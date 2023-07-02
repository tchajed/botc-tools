import { Ranking } from "./ranking";
import localforage from "localforage";

export interface ScriptState {
  scriptTitle: string;
  id: number;
  numPlayers: number;
  ranking: Ranking;
  selection: string[];
  bluffs: string[];
  lastSave: Date;
}

export interface GlobalState {
  players: string[];
}

export function initStorage() {
  localforage.config({
    name: "botc-tools",
    storeName: "botc_tools",
  });
}

export async function loadState(id: number): Promise<ScriptState | null> {
  const s = await localforage.getItem<Partial<ScriptState>>(`assign.${id}`);
  if (!s) {
    return null;
  }
  return {
    scriptTitle: s.scriptTitle || "",
    id: s.id || 0,
    numPlayers: s.numPlayers || 8,
    ranking: s.ranking || {},
    selection: s.selection || [],
    bluffs: s.bluffs || [],
    lastSave: s.lastSave || new Date(),
  };
}

export async function storeState(
  id: number,
  state: {
    scriptTitle: string;
    numPlayers: number;
    ranking: Ranking;
    selection: Set<string>;
    bluffs: Set<string>;
  }
): Promise<void> {
  const lastSave = new Date();
  const s: ScriptState = {
    ...state,
    id,
    selection: [...state.selection.values()],
    bluffs: [...state.bluffs.values()],
    lastSave,
  };
  await localforage.setItem(`assign.${id}`, s);
}

export async function latestScript(): Promise<ScriptState | null> {
  let newestState: ScriptState | null = null;
  await localforage.iterate<ScriptState, void>((s) => {
    if (newestState == null || s.lastSave > newestState.lastSave) {
      newestState = s;
    }
    return;
  });
  return newestState;
}

export async function loadGlobalState(): Promise<GlobalState> {
  let state = await localforage.getItem<Partial<GlobalState>>("global");
  if (!state) {
    state = {};
  }
  return {
    players: state.players || [],
  };
}

export async function storeGlobalState(state: GlobalState): Promise<void> {
  await localforage.setItem("global", state);
}
