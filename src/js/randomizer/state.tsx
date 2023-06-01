import { Ranking } from "./bag";
import { Selection } from "./characters";

export interface State {
  scriptTitle: string,
  numPlayers: number | "";
  ranking: Ranking;
  selection: Selection;
}

export function serializeState(s: State): string {
  return JSON.stringify({
    scriptTitle: s.scriptTitle,
    numPlayers: s.numPlayers,
    ranking: s.ranking,
    selection: [...s.selection],
  });
}

export function parseState(json: string): State | null {
  const s = JSON.parse(json);
  if ("scriptTitle" in s && "numPlayers" in s && "ranking" in s && "selection" in s) {
    return {
      scriptTitle: s["scriptTitle"],
      numPlayers: s["numPlayers"],
      ranking: s["ranking"],
      selection: new Set(s["selection"]),
    }
  }
  return null;
}
