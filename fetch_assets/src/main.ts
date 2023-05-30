import fs from 'fs';
import { Command } from 'commander';
import cliProgress from 'cli-progress';
import { allIcons, downloadIcons, findNotDownloaded, saveIcons } from './images';
import { downloadCharacterData } from './character_json';
import { ScriptData, getScript } from './get_script';
import path from 'path';

const FAVORITE_SCRIPTS = "19,178,180,181,10,360,1273";

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

async function makeIndex(scriptsDir: string, destFile: string) {
  const files = fs.readdirSync(scriptsDir).map(name => {
    let contents = fs.promises.readFile(`${scriptsDir}/${name}`, {
      encoding: "utf-8",
    });
    return { name, contents };
  });
  let listing = [];
  for (const file of files) {
    let id = path.basename(file.name, ".json");
    let script: ScriptData = JSON.parse(await file.contents);
    let title = script.title;
    listing.push({ id, title });
  }
  listing.sort((s1, s2) => parseInt(s1.id) - parseInt(s2.id));
  await fs.promises.writeFile(destFile, JSON.stringify({
    scripts: listing,
  }));
}

async function downloadScripts(scriptsOpt: string | null, scriptsDir: string, assetsDir: string) {
  fs.mkdirSync(scriptsDir, { recursive: true });

  var scripts: string = scriptsOpt || "";
  if (scripts == "favorites") {
    scripts = FAVORITE_SCRIPTS;
  }
  let ids = scripts.split(",").map(s => s.trim()).filter(s => s != "");

  await Promise.all(ids.map(async (id) => {
    let destFile = `${scriptsDir}/${id}.json`;
    if (fs.existsSync(destFile)) {
      console.log(`already have ${id}`);
      return;
    }
    let script = await getScript(id);
    if (script == null) {
      console.error(`could not download ${id}`);
      return;
    }
    await fs.promises.writeFile(destFile, JSON.stringify(script));
    console.log(`downloaded ${id} - ${script.title}`);
  }));

  makeIndex(scriptsDir, `${assetsDir}/scripts.json`);
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
    await downloadImages(imgDir);
  }

  if (options.scripts !== undefined) {
    await downloadScripts(options.scripts, scriptsDir, assetsDir);
  }
}

main();
