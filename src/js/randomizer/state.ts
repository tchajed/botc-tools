import { Ranking } from "./bag";

export interface State {
  scriptTitle: string,
  numPlayers: number;
  ranking: Ranking;
  selection: string[];
}

function serializeState(s: State): string {
  return JSON.stringify({
    scriptTitle: s.scriptTitle,
    numPlayers: s.numPlayers,
    ranking: s.ranking,
    selection: s.selection,
  });
}

function parseState(json: string): State | null {
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

export function loadState(title: string): State | undefined {
  const json = window.localStorage.getItem("state");
  if (!json) { return; }
  const s = parseState(json);
  if (!s) { return; }
  if (s.scriptTitle != title) {
    window.localStorage.removeItem("state");
    return;
  }
  return s;
}

export function storeState(state: {
  scriptTitle: string;
  numPlayers: number;
  ranking: Ranking, selection: Set<string>;
}) {
  let selection = Array.from(state.selection);
  let s = serializeState({ ...state, selection });
  window.localStorage.setItem("state", s);
}
