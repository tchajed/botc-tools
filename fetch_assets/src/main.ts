import axios from 'axios';
import fs from 'fs';
import { Command } from 'commander';
import sharp from 'sharp';
import cliProgress from 'cli-progress';
import http from 'http';

http.globalAgent.maxSockets = 10;

/** Recursively fetch a paged query with a continue parameter until it has no more results.
 *
 * @param params The query to run.
 * @param continueParam The name of the parameter that specifies how to resume queries.
 */
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
  // insert the original results at the front of the list
  rest.unshift(data.query);
  return rest;
}

interface Icon {
  // like Icon_pithag.png
  name: string,
  // like https://wiki.bloodontheclocktower.com/images/6/6b/Icon_pithag.png
  url: string,
}

/** Fetch the list of all icons on the wiki through the MediaWiki API. */
function allIcons(): Promise<Icon[]> {
  // See https://www.mediawiki.org/wiki/API:Allimages for documentation
  //
  // Use curl to get an idea of the data format:
  // 'https://wiki.bloodontheclocktower.com/api.php?action=query&list=allimages&ailimit=10&aifrom=Icon_&aito=J&format=json'
  return completeQuery({
    list: "allimages",
    ailimit: 20,
    aifrom: "Icon_",
    aito: "J",
  }, "aicontinue").then((results) => {
    var images: Icon[] = [];
    for (const r of results) {
      images.push(...r.allimages);
    }
    return images;
  });
}

interface DownloadedIcon {
  icon: Icon;
  data: ArrayBuffer;
}

/** Download a list of icons and return the raw data in memory. */
async function downloadIcons(icons: Icon[], progressCb: (number) => any): Promise<DownloadedIcon[]> {
  async function downloadIcon(icon: Icon): Promise<ArrayBuffer> {
    let { data } = await axios.get(icon.url, {
      responseType: "arraybuffer",
      responseEncoding: "binary",
      maxRate: 3000 * 1024, // 3MB/s
    });
    return data;
  }

  var downloads: DownloadedIcon[] = [];
  while (icons.length > 0) {
    var nextBatch = await Promise.all(icons.splice(0, 10).map(icon =>
      downloadIcon(icon).then(data => {
        progressCb(1);
        return { icon, data };
      })
    ));
    downloads.push(...nextBatch);
  }
  return downloads;
}

async function rescaleIcon(data: ArrayBuffer): Promise<sharp.Sharp> {
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

/** Resize and save icons that are already in memory. */
async function saveIcons(downloads: DownloadedIcon[], imgDir: string) {
  function iconName(icon: Icon): string {
    const restOfName = icon.name.slice("Icon_".length);
    const cleanedName = restOfName.replace(/_/g, "");
    return `Icon_${cleanedName}`;
  }

  await Promise.all(downloads.map(dl => {
    const path = `${imgDir}/${iconName(dl.icon)}`;
    return rescaleIcon(dl.data).then(img => img.toFile(path));
  }));
}

/** Download JSON files with character metadata and text. */
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
      bar.increment(n);
    });
    bar.stop();

    await saveIcons(downloads, imgDir);
  }
}

main();
