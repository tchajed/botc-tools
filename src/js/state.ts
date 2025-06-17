import { Ranking } from "./randomizer/ranking";
import localforage from "localforage";
import { isCorrectPassword } from "password";

export interface ScriptState {
  scriptTitle: string;
  id: number;
  numPlayers: number;
  ranking: Ranking;
  selection: string[];
  bluffs: string[];
  lastSave: Date;
}

interface ScriptStateWithLastLoad extends ScriptState {
  lastLoad: Date;
}

export interface LastLoadState {
  id: number;
  lastLoad: Date;
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

function toScriptState(state: Partial<ScriptState>): ScriptState {
  return {
    scriptTitle: state.scriptTitle || "",
    id: state.id || 0,
    numPlayers: state.numPlayers || 8,
    ranking: state.ranking || {},
    selection: state.selection || [],
    bluffs: state.bluffs || [],
    lastSave: state.lastSave || new Date(),
  };
}

// load a script without setting its last load time
async function loadStateRaw(id: number): Promise<ScriptState | null> {
  const s: Partial<ScriptState> | null = await localforage.getItem(
    `assign.${id}`,
  );
  if (!s) {
    return null;
  }
  return toScriptState(s);
}

export async function loadState(id: number): Promise<ScriptState | null> {
  const s = await loadStateRaw(id);
  if (!s) {
    return null;
  }
  const lastLoad = new Date();
  await localforage.setItem(`lastLoad.${id}`, lastLoad);
  return s;
}

export async function storeState(
  id: number,
  state: {
    scriptTitle: string;
    numPlayers: number;
    ranking: Ranking;
    selection: Set<string>;
    bluffs: Set<string>;
  },
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
  await localforage.iterate<Partial<ScriptState>, void>((partial, key) => {
    if (!key.startsWith("assign.")) {
      return;
    }
    const s = toScriptState(partial);
    if (newestState == null || s.lastSave > newestState.lastSave) {
      newestState = s;
    }
    return;
  });
  return newestState;
}

async function recentlyLoaded(
  after: Date,
  deleteOlderThan: Date,
): Promise<ScriptStateWithLastLoad[]> {
  const states: ScriptStateWithLastLoad[] = [];
  const toDelete: number[] = [];
  await localforage.iterate<LastLoadState, void>(async (loadState, key) => {
    if (!key.startsWith("lastLoad.")) {
      return;
    }
    if (loadState.lastLoad > after) {
      const maybeState = await loadStateRaw(loadState.id);
      // TODO: need to find script title
      const s: ScriptState = maybeState || toScriptState({ id: loadState.id });
      states.push({
        ...s,
        lastLoad: loadState.lastLoad,
      });
    }
    if (loadState.lastLoad < deleteOlderThan) {
      toDelete.push(loadState.id);
    }
    return;
  });
  for (const id of toDelete) {
    await localforage.removeItem(`lastLoad.${id}`);
  }
  states.sort((a, b) => b.lastLoad.valueOf() - a.lastLoad.valueOf());
  return states;
}

const secPerDay = 24 * 60 * 60;
const RECENT_AGE_MS: number = 14 * secPerDay * 1000;
const MAX_RECENT_MS: number = 30 * secPerDay * 1000;

export async function getRecentScripts(): Promise<ScriptState[]> {
  const scripts = await recentlyLoaded(
    new Date(Date.now() - RECENT_AGE_MS),
    new Date(Date.now() - MAX_RECENT_MS),
  );
  return scripts;
}

export async function loadGlobalState(): Promise<GlobalState> {
  const state: Partial<GlobalState> =
    (await localforage.getItem("global")) || {};
  return {
    players: state.players || [],
  };
}

export async function storeGlobalState(state: GlobalState): Promise<void> {
  await localforage.setItem("global", state);
}

export async function getPassword(): Promise<string> {
  const password = await localforage.getItem<string>("password");
  if (!password) {
    return "";
  }
  return password;
}

export async function getAuthenticated(): Promise<boolean> {
  const password = await getPassword();
  const correct = await isCorrectPassword(password);
  // clear any incorrect stored password (which might happen if it changes)
  if (password != "" && !correct) {
    await storePassword("");
  }
  return correct;
}

export async function storePassword(password: string): Promise<void> {
  await localforage.setItem("password", password);
}
