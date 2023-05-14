import { Jinx, getJinxList } from "./jinx";
import { CharacterInfo, nameToId, roles } from "./roles";

export class ScriptData {
  title: string;
  characters: string[];
}

export interface NightOrders {
  // already sorted
  firstNight: CharacterInfo[];
  // already sorted
  otherNights: CharacterInfo[];
}

function getCharacterList(characters: string[]): CharacterInfo[] {
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
  var firstNightChars: CharacterInfo[] = [roles.get("MINION"), roles.get("DEMON")];
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

export class Script {
  readonly title: string;
  readonly orders: NightOrders;
  readonly characters: CharacterInfo[];
  readonly jinxes: Jinx[];

  constructor(data: ScriptData) {
    this.title = data.title;

    // normalize
    for (var i = 0; i < data.characters.length; i++) {
      data.characters[i] = nameToId(data.characters[i]);
    }

    const characters = getCharacterList(data.characters);

    this.characters = characters;
    this.orders = getNightOrders(characters);

    this.jinxes = getJinxList(data.characters);
  }
}
