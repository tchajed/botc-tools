import fs from 'fs';
import { Command } from 'commander';
import cliProgress from 'cli-progress';
import { allIcons, downloadIcons, saveIcons } from './images';
import { downloadCharacterData } from './character_json';
import { getScript } from './get_script';

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

  if (!(options.json || options.img || options.scripts)) {
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

    console.log("rescaling images")
    await saveIcons(downloads, imgDir);
  }

  if (options.scripts) {
    fs.mkdirSync(scriptsDir, { recursive: true });

    let scripts: string = options.scripts;
    let ids = scripts.split(",").map(s => s.trim())
    await Promise.all(ids.map(async (id) => {
      let script = await getScript(id);
      await fs.promises.writeFile(`${scriptsDir}/${id}.json`, JSON.stringify(script));
      console.log(`downloaded ${id} - ${script.title}`);
    }));

    // TODO: create an index of downloaded scripts
  }
}

main();
