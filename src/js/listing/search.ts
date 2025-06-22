import { nameToId, roles } from "../botc/roles";
import { ScriptData } from "../botc/script";
import Fuse from "fuse.js/basic";

const FAVORITE_TITLES: Array<string> = [
  "Trouble Brewing",
  "Sects and Violets",
  "Bad Moon Rising",
  "Magical Onion Pies",
  // "Reptiles II: Lizard in the City",
  // "Catfishing",
  // "No Roles Barred",
  // "Whose Cult Is It Anyway?",
  // "Creme De La Creme",
  "Laissez un Faire",
  // "High Stakes Betting",
  // "Race to the Bottom",
  // "Our Mutual Friend",
];

function characterList(script: ScriptData): string[] {
  const characters: string[] = [];
  for (const id of script.characters) {
    const char = roles.get(nameToId(id));
    if (char !== undefined) {
      characters.push(char.name);
    }
  }
  return characters;
}

/**
 * @returns A Fuse object containing the given scripts, indexed by character
 */
export function makeCharacterSearcher(scripts: ScriptData[]): Fuse<ScriptData> {
  return new Fuse(scripts, {
    keys: [{ name: "characters", getFn: (script) => characterList(script) }],
  });
}

export function favorites(scripts: ScriptData[]): ScriptData[] {
  const scriptsByTitle = new Map(scripts.map((s) => [s.title, s]));
  const results = [];
  for (const title of FAVORITE_TITLES) {
    const script = scriptsByTitle.get(title);
    if (script == undefined) {
      throw new Error(`Favorite script ${title} not found`);
    }
    results.push(script);
  }
  return results;
}

/**
 * @returns A Fuse object containing the given scripts, indexed by title and author
 */
export function makeTitleAuthorSearcher(
  scripts: ScriptData[],
): Fuse<ScriptData> {
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

export function searchNormalize(query: string): string {
  return query.toLowerCase().replaceAll(/ +/g, " ").replaceAll(/[']/g, "");
}
