import { Ranking } from "./bag";

export interface State {
  scriptTitle: string,
  numPlayers: number | "";
  ranking: Ranking;
  selection: string[];
}

export function serializeState(s: State): string {
  return JSON.stringify({
    scriptTitle: s.scriptTitle,
    numPlayers: s.numPlayers,
    ranking: s.ranking,
    selection: s.selection,
  });
}

export function parseState(json: string): State | null {
  const s = JSON.parse(json);
  if ("scriptTitle" in s && "numPlayers" in s && "ranking" in s && "selection" in s) {
    return {
      scriptTitle: s["scriptTitle"],
      numPlayers: s["numPlayers"],
      ranking: s["ranking"],
      selection: Array.from(s["selection"]),
    }
  }
  return null;
}
