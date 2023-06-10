import { ScriptData } from "../botc/script";
import { matchSorter } from "match-sorter";

const FAVORITES: number[] = (() => {
  // 360 Visitors
  // 811 Lunatic's Asylum
  // 23 Stringing 'Em Along Redux
  // 81 High Stakes Betting
  const favorites = "19,178,180,181,10,1273,1245,83,4,2,435,811";
  return favorites.split(",").map((s) => parseInt(s));
})();

export function queryMatches(
  scripts: ScriptData[],
  query: string
): ScriptData[] {
  let matches: ScriptData[];
  if (query == "") {
    matches = scripts.filter((s) => FAVORITES.includes(s.pk));
  } else {
    matches = matchSorter(scripts, query, { keys: ["title"] });
  }
  return matches;
}

export function searchNormalize(query: string): string {
  return query.toLowerCase().replaceAll(/ +/g, " ").replaceAll(/[']/g, "");
}
