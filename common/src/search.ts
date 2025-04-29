import type { Character, ScriptData } from "./script.ts";
import { nameToId } from "./script.ts";
import Fuse from "fuse.js/basic";

function characterList(
  roles: Map<string, Character>,
  script: ScriptData,
): string[] {
  const characters: string[] = [];
  for (const id of script.characters) {
    const char = roles.get(nameToId(id));
    if (char !== undefined) {
      characters.push(char.name);
    }
  }
  return characters;
}

export function makeTitleSearcher(scripts: ScriptData[]): Fuse<ScriptData> {
  return new Fuse(scripts, {
    keys: [
      {
        name: "title",
        getFn: (script) => script.title.replace(/[^A-Za-z]/g, ""),
      },
      { name: "author" },
    ],
  });
}

export function makeCharacterSearcher(
  roles: Map<string, Character>,
  scripts: ScriptData[],
): Fuse<ScriptData> {
  return new Fuse(scripts, {
    keys: [
      { name: "characters", getFn: (script) => characterList(roles, script) },
    ],
  });
}
