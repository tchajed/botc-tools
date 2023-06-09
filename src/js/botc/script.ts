import { Jinx, getJinxList } from "./jinx";
import { CharacterInfo, DemonInfo, MinionInfo, nameToId, roles } from "./roles";

export interface ScriptData {
  pk: number;
  title: string;
  author?: string;
  characters: string[];
}

export interface NightOrders {
  // already sorted
  firstNight: CharacterInfo[];
  // already sorted
  otherNights: CharacterInfo[];
}

export function getCharacterList(characters: string[]): CharacterInfo[] {
  var chars: CharacterInfo[] = [];
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
  var firstNightChars: CharacterInfo[] = [MinionInfo, DemonInfo];
  var otherNightChars: CharacterInfo[] = [];

  for (const character of characters) {
    if (character.firstNight) {
      firstNightChars.push(character);
    }
    if (character.otherNights) {
      otherNightChars.push(character);
    }
  }

  firstNightChars.sort((info1, info2) => (info1.firstNight?.index || 0) - (info2.firstNight?.index || 0));
  otherNightChars.sort((info1, info2) => (info1.otherNights?.index || 0) - (info2.otherNights?.index || 0));

  return {
    firstNight: firstNightChars,
    otherNights: otherNightChars,
  }
}

export function isTeensyville(characters: CharacterInfo[]): boolean {
  const numTownsfolk = characters.filter(c => c.roleType == "townsfolk").length;
  // normal scripts have 13 townsfolk while teensyville is 6
  return numTownsfolk < 10;
}

export function onlyBaseThree(characters: CharacterInfo[]): boolean {
  return characters.every(c =>
    c.edition != "other" || c.roleType == "travellers" || c.roleType == "fabled"
  );
}

export class Script {
  readonly id: number;
  readonly title: string;
  readonly orders: NightOrders;
  readonly characters: CharacterInfo[];
  readonly jinxes: Jinx[];
  readonly teensyville: boolean;

  constructor(data: ScriptData) {
    this.id = data.pk || 0;
    this.title = data.title;

    // normalize
    for (var i = 0; i < data.characters.length; i++) {
      data.characters[i] = nameToId(data.characters[i]);
    }

    const characters = getCharacterList(data.characters);

    this.characters = characters;
    this.teensyville = isTeensyville(characters);
    this.orders = getNightOrders(characters);
    this.jinxes = getJinxList(data.characters);
  }
}
