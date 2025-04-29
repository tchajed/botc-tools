/** Format for a single saved script. */
export interface ScriptData {
  pk: number;
  title: string;
  author: string;
  score?: number;
  allAmne?: boolean;
  characters: string[];
}

/** Format for assets/static/scripts.json `ScriptData`. */
export interface ScriptsFile {
  scripts: ScriptData[];
  lastUpdate: string;
}

export interface NightAction {
  details: string;
  index: number;
}

export const RoleTypes = [
  "townsfolk",
  "outsider",
  "minion",
  "demon",
  "fabled",
  "travellers",
] as const;
export type RoleType = (typeof RoleTypes)[number];

export const Editions = ["tb", "snv", "bmr", "other"] as const;
export type Edition = (typeof Editions)[number];

export interface Character {
  readonly id: string;
  readonly name: string;
  readonly roleType: RoleType;
  readonly edition: Edition;
  ability: string | null;

  firstNight: NightAction | null;
  otherNights: NightAction | null;
}

export function nameToId(name: string): string {
  if (name.toLowerCase() !== name) {
    console.warn("nameToId called on non-lowercase name", name);
  }
  return name.toLowerCase().replaceAll(/[ '_-]/g, "");
}
