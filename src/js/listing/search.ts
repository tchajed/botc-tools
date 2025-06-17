import { nameToId, roles } from "../botc/roles";
import { ScriptData } from "../botc/script";
import { matchSorter } from "match-sorter";

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

// match scripts that have a list of characters
function characterQueryMatches(
  characters: string,
  scripts: ScriptData[],
): ScriptData[] {
  const terms = characters.split(" ");

  return terms.reduceRight(
    (results, char) =>
      matchSorter(results, char.replace("-", ""), {
        keys: [characterList],
        threshold: matchSorter.rankings.WORD_STARTS_WITH,
      }),
    scripts,
  );
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

export function queryMatches(
  scripts: ScriptData[],
  query: string,
): ScriptData[] {
  let matches: ScriptData[] = [];
  if (query == "") {
    // matches = scripts.filter((s) => FAVORITE_TITLES.has(s.title));
  } else {
    matches = matchSorter(scripts, query, { keys: ["title", "author"] });
    if (matches.length < 10) {
      // fill in results with character-based search
      matches.push(
        ...characterQueryMatches(
          query,
          // start with non-matching scripts
          scripts.filter((s) => !matches.some((m) => m.pk == s.pk)),
        ),
      );
    }
  }
  return matches;
}

export function searchNormalize(query: string): string {
  return query.toLowerCase().replaceAll(/ +/g, " ").replaceAll(/[']/g, "");
}
