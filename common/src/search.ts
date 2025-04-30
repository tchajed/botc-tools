import type { Character, ScriptData } from "./script.ts";
import { nameToId } from "./script.ts";
import Fuse from "fuse.js";

function characterList(
  roles: Map<string, Pick<Character, "id" | "name">>,
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

export function makeTitleSearcher(
  scripts: ScriptData[],
  titleFuseIndex?: unknown,
): Fuse<ScriptData> {
  return new Fuse(
    scripts,
    {
      keys: [
        {
          name: "title",
          getFn: (script) => script.title.replace(/[^A-Za-z]/g, ""),
        },
        { name: "author" },
      ],
    },
    titleFuseIndex ? Fuse.parseIndex(titleFuseIndex) : undefined,
  );
}

export function makeCharacterSearcher(
  roles: Map<string, Pick<Character, "id" | "name">>,
  scripts: ScriptData[],
  characterFuseIndex?: unknown,
): Fuse<ScriptData> {
  return new Fuse(
    scripts,
    {
      keys: [
        { name: "characters", getFn: (script) => characterList(roles, script) },
      ],
    },
    characterFuseIndex ? Fuse.parseIndex(characterFuseIndex) : undefined,
  );
}
