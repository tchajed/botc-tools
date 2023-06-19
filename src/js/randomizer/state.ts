import { Ranking } from "./bag";
import localforage from "localforage";

export interface State {
  scriptTitle: string;
  id: number;
  numPlayers: number;
  ranking: Ranking;
  selection: string[];
  bluffs: string[];
  lastSave: Date;
}

export function initStorage() {
  localforage.config({
    name: "botc-tools",
    storeName: "botc_tools",
  });
}

export async function loadState(id: number): Promise<State | null> {
  const s = await localforage.getItem<Partial<State>>(`assign.${id}`);
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
  const s: State = {
    ...state,
    id,
    selection: [...state.selection.values()],
    bluffs: [...state.bluffs.values()],
    lastSave,
  };
  await localforage.setItem(`assign.${id}`, s);
}

export async function latestScript(): Promise<State | null> {
  let newestState: State | null = null;
  await localforage.iterate<State, void>((s) => {
    if (newestState == null || s.lastSave > newestState.lastSave) {
      newestState = s;
    }
    return;
  });
  return newestState;
}
