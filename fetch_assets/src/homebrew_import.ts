import fs from "fs";
import {
  Role,
  downloadRoles,
  findNotDownloadedIcons,
} from "./script_tool_images";
import cliProgress from "cli-progress";

interface HomebrewMeta {
  id: "_meta";
  name: string;
  author: string;
}

export interface HomebrewCharacter {
  id: string;
  image: string | Array<string>; // can have multiple images (eg, for good and evil variant)
  firstNightReminder?: string;
  otherNightReminder?: string;
  name: string;
  team: "townsfolk" | "outsider" | "minion" | "demon" | "fabled" | "traveler";
  ability: string;
  firstNight?: number;
  otherNight?: number;
}

type HomebrewScriptJson = (HomebrewMeta | HomebrewCharacter)[];

export interface HomebrewScript {
  name: string;
  author: string;
  characters: HomebrewCharacter[];
}

export function loadHomebrew(path: string): HomebrewScript {
  const jsonText = fs.readFileSync(path, "utf8");
  const data: HomebrewScriptJson = JSON.parse(jsonText);
  if (!(data instanceof Array)) {
    throw new Error("Invalid homebrew JSON: not an array");
  }
  if (!(data.length > 0 && data[0].id == "_meta")) {
    throw new Error("Invalid homebrew: no _meta");
  }
  const meta: HomebrewMeta = data[0] as HomebrewMeta;
  const characters: Array<HomebrewCharacter> = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i].id == "_meta") {
      throw new Error("duplicate _meta in homebrew");
    }
    characters.push(data[i] as HomebrewCharacter);
  }
  return {
    name: meta.name,
    author: meta.author,
    characters,
  };
}

export async function downloadHomebrewImages(
  script: HomebrewScript,
  imgDir: string,
) {
  fs.mkdirSync(imgDir, { recursive: true });
  const roles: Role[] = script.characters.map((c) => {
    return {
      id: c.id,
      icon: c.image instanceof Array ? c.image[0] : c.image,
      version: "",
    };
  });
  const icons = findNotDownloadedIcons(roles, imgDir);
  if (icons.length == 0) {
    console.log(`homebrew "${script.name}" images already downloaded`);
    return;
  }
  console.log(`downloading ${icons.length} images`);
  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.rect);
  bar.start(icons.length, 0);
  await downloadRoles(icons, imgDir, (n) => {
    bar.increment(n);
  });
  bar.stop();
}

export function loadAllHomebrew(): HomebrewScript[] {
  const homebrewDir = "homebrew_scripts";
  const files = fs.readdirSync(homebrewDir);
  const scripts: HomebrewScript[] = [];
  for (const file of files) {
    if (!file.endsWith(".json")) {
      continue;
    }
    const script = loadHomebrew(`${homebrewDir}/${file}`);
    scripts.push(script);
  }
  return scripts;
}

export async function downloadAllHomebrew(
  scripts: HomebrewScript[],
  imgDir: string,
) {
  for (const script of scripts) {
    await downloadHomebrewImages(script, imgDir);
  }
}
