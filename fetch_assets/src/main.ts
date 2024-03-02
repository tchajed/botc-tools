import { fetchAllScripts, readScripts } from "./all_scripts";
import { downloadCharacterData } from "./character_json";
import { downloadExtraIcons } from "./extra_icons";
import { ScriptsFile, getScript } from "./get_script";
import {
  allIcons,
  downloadIcons,
  findNotDownloaded,
  saveIcons,
} from "./images";
import {
  downloadRoles,
  findNotDownloadedIcons,
  getRoles,
} from "./script_tool_images";
import cliProgress from "cli-progress";
import { Command, Option } from "commander";
import fs from "fs";

const FAVORITE_SCRIPTS = "19,178,180,181,10,360,1273,1245,83,81,4,23,2,435,811";

async function downloadImages(imgDir: string) {
  console.log("fetching list of images");
  let icons = await allIcons();
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

  console.log("rescaling images");
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
  await downloadRoles(roles, iconsDir, (n) => {
    bar.increment(n);
  });
  bar.stop();
}

async function downloadScripts(scriptsOpt: string | null, scriptsDir: string) {
  fs.mkdirSync(scriptsDir, { recursive: true });

  let scripts: string = scriptsOpt || "";
  if (scripts == "favorites") {
    scripts = FAVORITE_SCRIPTS;
  }
  const ids = scripts
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s != "");

  await Promise.all(
    ids.map(async (id) => {
      const destFile = `${scriptsDir}/${id}.json`;
      if (fs.existsSync(destFile)) {
        console.log(`already have script ${id}.json`);
        return;
      }
      const script = await getScript(id);
      if (script == null) {
        console.error(`could not download ${id}`);
        return;
      }
      await fs.promises.writeFile(destFile, JSON.stringify(script));
      console.log(`downloaded ${id} - ${script.title}`);
    }),
  );
}

async function getAllScripts(
  extraScriptsDir: string,
  staticDir: string,
): Promise<ScriptsFile> {
  const path = `${staticDir}/scripts.json`;
  if (fs.existsSync(path)) {
    // if scripts.json exists, merge the extra scripts into it
    // since the upstream scripts aren't updated, re-use the previous date
    console.log("already have scripts.json");
    const allScripts: ScriptsFile = JSON.parse(
      await fs.promises.readFile(path, "utf8"),
    );
    const extraScripts = await readScripts(extraScriptsDir);
    const allScriptsMinusExtra = allScripts.scripts.filter(
      (s) => !extraScripts.some((s2) => s2.pk == s.pk),
    );
    return {
      scripts: extraScripts.concat(allScriptsMinusExtra),
      lastUpdate: allScripts.lastUpdate,
    };
  }
  console.log("downloading all scripts");
  const updateTime = new Date();
  const allScripts = await fetchAllScripts();
  const extraScripts = await readScripts(extraScriptsDir);
  return {
    scripts: extraScripts.concat(allScripts),
    lastUpdate: updateTime.toJSON(),
  };
}

async function downloadAllScripts(extraScriptsDir: string, staticDir: string) {
  fs.mkdirSync(staticDir, { recursive: true });
  const path = `${staticDir}/scripts.json`;
  const scriptFile = await getAllScripts(extraScriptsDir, staticDir);
  await fs.promises.writeFile(path, JSON.stringify(scriptFile));
  return;
}

async function cleanAssets(assetsDir: string) {
  await Promise.all(
    fs.readdirSync(assetsDir).map(async (name) => {
      // the only non-ignored files
      if ([".gitignore", "globals.d.ts"].includes(name)) {
        return;
      }
      await fs.promises.rm(`${assetsDir}/${name}`, { recursive: true });
    }),
  );
}

async function main() {
  const program = new Command();

  program
    .version("0.3.0")
    .description("Download assets for BotC sheets")
    .addOption(
      new Option(
        "--all",
        "Download all assets (shorthand for --json --icons --extra-icons --all-scripts)",
      ).implies({
        json: true,
        icons: true,
        extraIcons: true,
        allScripts: true,
      }),
    )
    .option("--clean", "Delete any existing assets")
    .option("--json", "Download JSON game data")
    .option("--img", "Download images")
    .option("--icons", "Download icons from script tool")
    .option("--extra-icons", "Download extra icons from tchajed/botc-icons")
    .option("--scripts <ids>", "Download scripts (by pk on botc-scripts)")
    .option("--all-scripts", "Download all scripts in database")
    .option(
      "--extra-scripts <dir>",
      "Directory of extra scripts to include",
      "./extra_scripts",
    )
    .option("-o, --out <assets dir>", "Path to assets directory", "./assets");
  program.parse();

  const options = program.opts();

  if (
    // if nothing is selected, fetch everything by default
    !(
      options.json ||
      options.img ||
      options.scripts !== undefined ||
      options.allScripts ||
      options.icons ||
      options.extraIcons
    )
  ) {
    options.json = true;
    // options.img = true;
    options.icons = true;
    options.extraIcons = true;
    // options.scripts = "favorites";
    options.allScripts = true;
  }

  const assetsDir = options.out;
  const dataDir = `${assetsDir}/data`;
  const imgDir = `${assetsDir}/img`;
  const iconsDir = `${assetsDir}/icons`;
  const staticDir = `${assetsDir}/static`;
  const scriptsDir = `${assetsDir}/static/scripts`;

  if (options.clean) {
    await cleanAssets(assetsDir);
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

  if (options.extraIcons) {
    await downloadExtraIcons(iconsDir);
  }

  if (options.scripts !== undefined) {
    await downloadScripts(options.scripts, scriptsDir);
  }

  if (options.allScripts) {
    await downloadAllScripts(options.extraScripts, staticDir);
  }
}

main();
