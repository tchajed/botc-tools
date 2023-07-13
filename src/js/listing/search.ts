import { nameToId, roles } from "../botc/roles";
import { ScriptData } from "../botc/script";
import { matchSorter } from "match-sorter";

const FAVORITE_TITLES: Set<string> = new Set([
  "Chad Versus Virgin",
  "You're Not Evil, I'm Evil!",
  "The Spy Who Pinged Me",
  "No Roles Barred",
  "Whose Cult is it Anyway?",
  "Laissez un Faire",
  "High Stakes Betting",
  "Faith, Trust and Pixie Dust",
  "Race to the Bottom",
]);

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
    matches = scripts.filter((s) => FAVORITE_TITLES.has(s.title));
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
