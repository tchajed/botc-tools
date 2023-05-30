import fs from 'fs';
import { Command } from 'commander';
import cliProgress from 'cli-progress';
import { allIcons, downloadIcons, findNotDownloaded, saveIcons } from './images';
import { downloadCharacterData } from './character_json';
import { ScriptData, getScript } from './get_script';
import path from 'path';

async function downloadImages(imgDir: string) {
  console.log("fetching list of icons");
  var icons = await allIcons();
  icons = findNotDownloaded(icons, imgDir);

  if (icons.length == 0) {
    console.log("nothing to download");
    return;
  }

  console.log(`downloading ${icons.length} images`);
  fs.mkdirSync(imgDir, { recursive: true });

  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.rect);
  bar.start(icons.length, 0);
  const downloads = await downloadIcons(icons, (n) => {
    bar.increment(n);
  });
  bar.stop();

  console.log("rescaling images")
  await saveIcons(downloads, imgDir);
}

async function downloadScripts(scriptsOpt: string | null, scriptsDir: string, assetsDir: string) {
  fs.mkdirSync(scriptsDir, { recursive: true });

  const scripts: string = scriptsOpt || "";
  let ids = scripts.split(",").map(s => s.trim()).filter(s => s != "");
  await Promise.all(ids.map(async (id) => {
    let script = await getScript(id);
    if (script == null) {
      console.error(`could not download ${id}`);
      return;
    }
    await fs.promises.writeFile(`${scriptsDir}/${id}.json`, JSON.stringify(script));
    console.log(`downloaded ${id} - ${script.title}`);
  }));

  let listing = [];
  var files = fs.readdirSync(scriptsDir);
  for (const file of files) {
    let contents = await fs.promises.readFile(`${scriptsDir}/${file}`, {
      encoding: "utf-8",
    });
    let id = path.basename(file, ".json");
    let script: ScriptData = JSON.parse(contents);
    listing.push({
      id,
      title: script.title,
    });
  }
  listing.sort((s1, s2) => parseInt(s1.id) - parseInt(s2.id));
  await fs.promises.writeFile(`${assetsDir}/scripts.json`, JSON.stringify({
    scripts: listing,
  }));
}

async function main() {
  const program = new Command();

  program.version("0.1.0")
    .description("Download assets for BotC sheets")
    .option("--json", "Download JSON game data")
    .option("--img", "Download images")
    .option("--scripts <ids>", "Download script (by its id on botc-scripts)")
    .option("-o, --out <assets dir>", "Path to assets directory", "./assets")
    .parse(process.argv);

  const options = program.opts();

  if (!(options.json || options.img || options.scripts !== undefined)) {
    console.warn("no tasks specified, doing nothing");
    return;
  }

  const assetsDir = options.out;
  const dataDir = `${assetsDir}/data`;
  const imgDir = `${assetsDir}/img`;
  const scriptsDir = `${assetsDir}/static/scripts`;

  if (options.json) {
    console.log("downloading JSON data from script tool");
    fs.mkdirSync(dataDir, { recursive: true });
    await downloadCharacterData(dataDir);
  }

  if (options.img) {
    downloadImages(imgDir);
  }

  if (options.scripts !== undefined) {
    downloadScripts(options.scripts, scriptsDir, assetsDir);
  }
}

main();
