import axios from 'axios';
import fs from 'fs';
import { Command } from 'commander';
import sharp from 'sharp';

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
    maxRate: 1000 * 1024, // 1MB/s
  });
  return data;
}

async function rescaleIcon(data: ArrayBuffer): Promise<sharp.Sharp> {
  // need two resizes, which can't be in the same pipeline:
  // first removes some of the empty space around each icon,
  // second scales the icon down
  let resized = await sharp(data).resize({
    width: 451,
    height: 451,
    fit: 'cover',
  }).toBuffer();
  return sharp(resized).resize({
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

async function downloadIcons(icons: Icon[], baseDir: string, progressCb: (number) => any) {
  var processed = 0;
  while (icons.length > 0) {
    var nextBatch = icons.splice(0, 5);
    await Promise.all(nextBatch.map(icon => {
      const path = `${baseDir}/${iconName(icon)}`;
      return downloadIcon(icon).then((data) =>
        rescaleIcon(data).then((img) =>
          img.toFile(path)
        ));
    }));
    processed += nextBatch.length;
    progressCb(processed);
  }
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
    .parse(process.argv);

  const options = program.opts();

  if (!(options.json || options.img)) {
    console.warn("neither --json nor --img specified, doing nothing");
    return;
  }

  if (options.json) {
    console.log("downloading JSON data from script tool");
    fs.mkdirSync("assets/data", {
      recursive: true,
    });
    await downloadScriptData("assets/data");
  }

  if (options.img) {
    console.log("fetching list of icons");
    const icons = await allIcons();

    console.log(`downloading ${icons.length} images`);
    await downloadIcons(icons, "assets/img", (n) => {
      if (n % 50 == 0) {
        console.log(`...done with ${n}`);
      }
    });
  }
}

main();
