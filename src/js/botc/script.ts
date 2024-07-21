import { Jinx, getJinxList } from "./jinx";
import { CharacterInfo, DemonInfo, MinionInfo, nameToId, roles } from "./roles";

export interface ScriptData {
  pk: number;
  title: string;
  author?: string;
  allAmne?: boolean;
  characters: string[];
}

export type ScriptsFile = {
  scripts: ScriptData[];
  lastUpdate: string;
};

export interface NightOrders {
  // already sorted
  firstNight: CharacterInfo[];
  // already sorted
  otherNights: CharacterInfo[];
}

export function getCharacterList(characters: string[]): CharacterInfo[] {
  const chars: CharacterInfo[] = [];
  for (const id of characters) {
    const character = roles.get(id);
    if (character === undefined) {
      console.warn(`unknown character ${id} `);
      continue;
    } else {
      chars.push(character);
    }
  }
  return chars;
}

function getNightOrders(characters: CharacterInfo[]): NightOrders {
  const firstNightChars: CharacterInfo[] = [MinionInfo, DemonInfo];
  const otherNightChars: CharacterInfo[] = [];

  for (const character of characters) {
    if (character.firstNight) {
      firstNightChars.push(character);
    }
    if (character.otherNights) {
      otherNightChars.push(character);
    }
  }

  firstNightChars.sort(
    (info1, info2) =>
      (info1.firstNight?.index || 0) - (info2.firstNight?.index || 0),
  );
  otherNightChars.sort(
    (info1, info2) =>
      (info1.otherNights?.index || 0) - (info2.otherNights?.index || 0),
  );

  return {
    firstNight: firstNightChars,
    otherNights: otherNightChars,
  };
}

export function isTeensyville(characters: CharacterInfo[]): boolean {
  const numTownsfolk = characters.filter(
    (c) => c.roleType == "townsfolk",
  ).length;
  // normal scripts have 13 townsfolk while teensyville is 6
  return numTownsfolk < 10;
}

export function onlyBaseThree(characters: CharacterInfo[]): boolean {
  return characters.every(
    (c) =>
      c.edition != "other" ||
      c.roleType == "travellers" ||
      c.roleType == "fabled",
  );
}

export function hasAtheist(characters: CharacterInfo[]): boolean {
  return characters.some((c) => c.id == "atheist");
}

export function hasHeretic(characters: CharacterInfo[]): boolean {
  return characters.some((c) => c.id == "heretic");
}

export class Script {
  readonly id: number;
  readonly title: string;
  readonly allAmne: boolean;
  readonly orders: NightOrders;
  readonly characters: CharacterInfo[];
  readonly jinxes: Jinx[];
  readonly teensyville: boolean;

  constructor(data: ScriptData) {
    this.id = data.pk || 0;
    this.title = data.title;
    this.allAmne = data.allAmne ?? false;

    // normalize
    for (let i = 0; i < data.characters.length; i++) {
      data.characters[i] = nameToId(data.characters[i]);
    }

    const characters = getCharacterList(data.characters);

    this.characters = characters;
    this.teensyville = isTeensyville(characters);
    this.orders = getNightOrders(characters);
    this.jinxes = getJinxList(data.characters);
  }

  get toPocketGrimoire(): string {
    return JSON.stringify([
      { id: "_meta", name: this.title },
      ...this.characters.map((c: CharacterInfo) => ({ id: c.id })),
    ]);
  }
}
