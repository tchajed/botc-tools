import axios from 'axios';
import fs from 'fs';
import { Command } from 'commander';
import cliProgress from 'cli-progress';
import { allIcons, downloadIcons, saveIcons } from './images';

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
