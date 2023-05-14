import axios from 'axios';
import fs from 'fs';
import { Command } from 'commander';
import sharp from 'sharp';
import cliProgress from 'cli-progress';

async function completeQuery(params: any, continueParam: string,
  continueVal: string | null = null): Promise<any[]> {
  if (continueVal !== null) {
    params[continueParam] = continueVal;
  }
  const query_api = axios.create({
    baseURL: 'https://wiki.bloodontheclocktower.com/',
    params: {
      action: "query",
      format: "json",
    }
  });
  let { data } = await query_api.get("api.php", { params });
  if (!('continue' in data)) {
    // terminated
    return [data.query];
  }
  // need to recursively get remaining results
  let rest = await completeQuery(params, continueParam, data.continue[continueParam]);
  rest.unshift(data.query);
  return rest;
}

interface Icon {
  // like Icon_pithag.png
  name: string,
  // like https://wiki.bloodontheclocktower.com/images/6/6b/Icon_pithag.png
  url: string,
}

function allIcons(): Promise<Icon[]> {
  return completeQuery({
    list: "allimages",
    ailimit: 20,
    aifrom: "Icon_",
    aito: "J",
  }, "aicontinue").then((results) => {
    var images = [];
    for (const r of results) {
      images.push(...r.allimages);
    }
    return images;
  });
}

async function downloadIcon(icon: Icon): Promise<ArrayBuffer> {
  let { data } = await axios.get(icon.url, {
    responseType: "arraybuffer",
    responseEncoding: "binary",
    maxRate: 2000 * 1024, // 1MB/s
  });
  return data;
}

async function rescaleIcon(data: ArrayBuffer): Promise<sharp.Sharp> {
  // need two resizes, which can't be in the same pipeline:
  // first removes some of the empty space around each icon,
  // second scales the icon down
  let img = sharp(data);
  let meta = await img.metadata();
  const size = 401;
  if (meta.height > size) {
    img = img.extract({
      left: Math.round((meta.width - size) / 2),
      top: Math.round((meta.height - size) / 2),
      width: size,
      height: size,
    })
  }
  return img.resize({
    width: 250,
    height: 250,
    fit: 'inside',
  });
}

function iconName(icon: Icon): string {
  const restOfName = icon.name.slice("Icon_".length);
  const cleanedName = restOfName.replace(/_/g, "");
  return `Icon_${cleanedName}`;
}

interface DownloadedIcon {
  icon: Icon;
  data: ArrayBuffer;
}

async function downloadIcons(icons: Icon[], progressCb: (number) => any): Promise<DownloadedIcon[]> {
  var downloads: DownloadedIcon[] = [];
  while (icons.length > 0) {
    var nextBatch = await Promise.all(icons.splice(0, 5).map(icon =>
      downloadIcon(icon).then(data => {
        return { icon, data };
      })
    ));
    downloads.push(...nextBatch);
    progressCb(downloads.length);
  }
  return downloads;
}

async function saveIcons(downloads: DownloadedIcon[], imgDir: string) {
  for (const dl of downloads) {
    const path = `${imgDir}/${iconName(dl.icon)}`;
    await rescaleIcon(dl.data).then(img => img.toFile(path));
  }
  // Promise.all(downloads.map(dl => {
  //   const path = `${imgDir}/${iconName(dl.icon)}`;
  //   return rescaleIcon(dl.data).then(img => img.toFile(path));
  // }));
}

async function downloadScriptData(assetsPath: string) {
  // there's also tether.json and game-characters-restrictions.json which we don't download
  var downloads: { url: string; name: string; }[] = [];
  for (const file of ["roles", "jinx", "nightsheet"]) {
    downloads.push({
      url: `https://script.bloodontheclocktower.com/data/${file}.json`,
      name: `${file}.json`,
    })
  }
  downloads.push({
    url: "https://raw.githubusercontent.com/bra1n/townsquare/develop/src/roles.json",
    name: "botc_online_roles.json",
  });
  await Promise.all(downloads.map(async (file) => {
    let { data } = await axios.get(file.url, {
      responseType: "arraybuffer",
      responseEncoding: "binary",
    });
    return fs.promises.writeFile(`${assetsPath}/${file.name}`, data);
  }));
}

async function main() {
  const program = new Command();

  program.version("0.1.0")
    .description("Download assets for BotC sheets")
    .option("--json", "Download only JSON game data")
    .option("--img", "Download only images")
    .option("-o, --out <assets dir>", "Path to assets directory", "./assets")
    .parse(process.argv);

  const options = program.opts();

  if (!(options.json || options.img)) {
    console.warn("neither --json nor --img specified, doing nothing");
    return;
  }

  const assetsDir = options.out;
  const dataDir = `${assetsDir}/data`;
  const imgDir = `${assetsDir}/img`;

  if (options.json) {
    console.log("downloading JSON data from script tool");
    fs.mkdirSync(dataDir, { recursive: true });
    await downloadScriptData(dataDir);
  }

  if (options.img) {
    console.log("fetching list of icons");
    const icons = await allIcons();

    console.log(`downloading ${icons.length} images`);
    fs.mkdirSync(imgDir, { recursive: true });

    const bar = new cliProgress.SingleBar({}, cliProgress.Presets.rect);
    bar.start(icons.length, 0);

    const downloads = await downloadIcons(icons, (n) => {
      bar.update(n);
    });
    bar.stop();

    await saveIcons(downloads, imgDir);
  }
}

main();
