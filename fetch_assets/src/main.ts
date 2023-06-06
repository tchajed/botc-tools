import fs from 'fs';
import { Command, Option } from 'commander';
import cliProgress from 'cli-progress';
import { allIcons, downloadIcons, findNotDownloaded, saveIcons } from './images';
import { downloadCharacterData } from './character_json';
import { ScriptData, getScript } from './get_script';
import path from 'path';
import { fetchAllScripts } from './all_scripts';
import { gzip } from 'node-gzip';
import { downloadRoles, findNotDownloadedIcons, getRoles } from './script_tool_images';

const FAVORITE_SCRIPTS = "19,178,180,181,10,360,1273,1245,83,81,4,23,2,435,811";

async function downloadImages(imgDir: string) {
  console.log("fetching list of images");
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

async function downloadScriptToolIcons(dataDir: string, iconsDir: string) {
  fs.mkdirSync(iconsDir, { recursive: true });
  const roles = findNotDownloadedIcons(await getRoles(dataDir), iconsDir);
  if (roles.length == 0) {
    console.log("no icons to download");
    return;
  }
  console.log(`downloading ${roles.length} icons`);
  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.rect);
  bar.start(roles.length, 0);
  await downloadRoles(roles, iconsDir, (n) => { bar.increment(n); });
  bar.stop();
}

async function makeIndex(scriptsDir: string, destFile: string) {
  const files = fs.readdirSync(scriptsDir).map(name => {
    let contents = fs.promises.readFile(`${scriptsDir}/${name}`, {
      encoding: "utf-8",
    });
    return { name, contents };
  });
  let listing: { id: string, title: string }[] = [];
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
      console.log(`already have script ${id}.json`);
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

async function downloadAllScripts(staticDir: string) {
  fs.mkdirSync(staticDir, { recursive: true });
  let path = `${staticDir}/scripts.json.gz`;
  if (fs.existsSync(path)) {
    console.log("already have scripts.json.gz");
    return;
  }
  console.log("downloading all scripts");
  const allScripts = await fetchAllScripts();
  const compressed = await gzip(JSON.stringify(allScripts), { level: 9 });
  fs.promises.writeFile(path, compressed);
}

async function cleanAssets(assetsDir: string) {
  async function removeIfPresent(path: string, options?: fs.RmOptions) {
    if (fs.existsSync(path)) {
      return fs.promises.rm(path, options);
    }
  }

  const dataDir = `${assetsDir}/data`;
  const imgDir = `${assetsDir}/img`;
  const iconDir = `${assetsDir}/icons`;
  const staticDir = `${assetsDir}/static`;

  await Promise.all([
    removeIfPresent(dataDir, { recursive: true }),
    removeIfPresent(staticDir, { recursive: true }),
    removeIfPresent(imgDir, { recursive: true }),
    removeIfPresent(iconDir, { recursive: true }),
    removeIfPresent(`${assetsDir}/scripts.json`),
  ]);
}

async function main() {
  const program = new Command();

  program.version("0.3.0")
    .description("Download assets for BotC sheets")
    .addOption(new Option(
      "--all", "Download all assets (shorthand for --json --img --icons --scripts favorites)",
    ).implies({ json: true, img: true, icons: true, scripts: 'favorites' }))
    .option("--clean", "Delete any existing assets")
    .option("--json", "Download JSON game data")
    .option("--img", "Download images")
    .option("--icons", "Download icons from script tool")
    .option("--scripts <ids>", "Download scripts (by pk on botc-scripts)")
    .option("--all-scripts", "Download all scripts in database")
    .option("-o, --out <assets dir>", "Path to assets directory", "./assets");
  program.parse();

  const options = program.opts();

  if (// if nothing is selected, fetch everything by default
    !(options.json || options.img || options.scripts !== undefined || options.allScripts || options.icons)) {
    options.json = true;
    options.img = true;
    options.icons = true;
    options.scripts = "favorites";
  }

  const assetsDir = options.out;
  const dataDir = `${assetsDir}/data`;
  const imgDir = `${assetsDir}/img`;
  const iconsDir = `${assetsDir}/icons`;
  const staticDir = `${assetsDir}/static`;
  const scriptsDir = `${assetsDir}/static/scripts`;

  if (options.clean) {
    await cleanAssets(assetsDir);
    return;
  }

  if (options.json) {
    console.log("downloading JSON data from script tool");
    fs.mkdirSync(dataDir, { recursive: true });
    await downloadCharacterData(dataDir);
  }

  if (options.img) {
    await downloadImages(imgDir);
  }

  if (options.icons) {
    await downloadScriptToolIcons(dataDir, iconsDir);
  }

  if (options.scripts !== undefined) {
    await downloadScripts(options.scripts, scriptsDir, assetsDir);
  }

  if (options.allScripts) {
    await downloadAllScripts(staticDir);
  }
}

main();
