import { Ranking } from "./bag";
import localforage from 'localforage';

export interface State {
  scriptTitle: string,
  numPlayers: number;
  ranking: Ranking;
  selection: string[];
  lastSave: Date;
}

export function initStorage() {
  localforage.config({
    name: 'botc-tools',
    storeName: 'botc_tools',
  });
}

export async function loadState(id: number): Promise<State | null> {
  const s = await localforage.getItem<State>(`assign.${id}`);
  return s;
}

export async function storeState(id: number,
  state: {
    scriptTitle: string;
    numPlayers: number;
    ranking: Ranking,
    selection: Set<string>;
  }): Promise<void> {
  let selection = Array.from(state.selection);
  let lastSave = new Date();
  let s: State = { ...state, selection, lastSave };
  await localforage.setItem(`assign.${id}`, s);
}
