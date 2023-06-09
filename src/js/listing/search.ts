import { ScriptData } from "../botc/script";

const FAVORITES: number[] = (() => {
  // removed compared to fetch_assets:
  // 360 Visitors
  // 811 Lunatic's Asylum
  // 23 Stringing 'Em Along Redux
  // 81 High Stakes Betting
  const favorites = "19,178,180,181,10,1273,1245,83,4,2,435"
  return favorites.split(",").map(s => parseInt(s));
})()

function normalize(title: string): string {
  return title.toLowerCase().replaceAll(/ +/g, " ").replaceAll(/[']/g, "");
}

type Tuple = { n1: number, n2: string };

function lexCompare(x: Tuple, y: Tuple): number {
  if (x.n1 != y.n1) {
    return x.n1 - y.n1;
  }
  return x.n2.localeCompare(y.n2);
}

function matchPriority(s: ScriptData, q: string): number {
  if (s.title.startsWith(q)) {
    return -100;
  }
  const title = normalize(s.title)
  let normq = normalize(q);
  if (title.startsWith(normq)) {
    return -99;
  }
  if (title.split(" ").some(w => w.startsWith(normq))) {
    return -97;
  }
  if (title.includes(normq)) {
    return -98;
  }
  return 0;
}

function measure(s: ScriptData, q: string): Tuple {
  return { n1: matchPriority(s, q), n2: s.title };
}

export function queryMatches(scripts: ScriptData[], query: string): ScriptData[] {
  var matches: ScriptData[];
  if (query == "") {
    matches = scripts.filter(s => FAVORITES.includes(s.pk));
  } else {
    let q = normalize(query);
    if (q == "") {
      matches = scripts;
    } else {
      matches = scripts.filter(s => normalize(s.title).includes(q));
    }
  }
  matches.sort((s1, s2) => {
    return lexCompare(measure(s1, query), measure(s2, query));
  });
  return matches;
}

export function searchNormalize(s: string): string {
  return normalize(s);
}
