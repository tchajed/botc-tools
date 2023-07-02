import { nameToId, roles } from "../botc/roles";
import { ScriptData } from "../botc/script";
import { matchSorter } from "match-sorter";

const FAVORITES: number[] = (() => {
  // 360 Visitors
  // 811 Lunatic's Asylum
  // 23 Stringing 'Em Along Redux
  // 81 High Stakes Betting
  // 2 Catfishing
  // 1245 Trust
  // 394 Whose Cult is it Anyway?
  // 19 Laissez un Carnaval
  // 2282 Chad Versus Virgin
  // 2235 You're Not Evil, I'm Evil!
  // 1273 Creme de la Creme
  const favorites = "178,180,181,10,83,4,435,81,394,2282,2235";
  return favorites.split(",").map((s) => parseInt(s));
})();

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
      }),
    scripts,
  );
}

export function queryMatches(
  scripts: ScriptData[],
  query: string,
): ScriptData[] {
  let matches: ScriptData[];
  if (query == "") {
    matches = scripts.filter((s) => FAVORITES.includes(s.pk));
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
