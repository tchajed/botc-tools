import { Jinx, getJinxList } from "./jinx";
import { CharacterInfo, nameToId, roles } from "./roles";

export class ScriptData {
  title: string;
  characters: string[];
}

export interface NightSheets {
  // already sorted
  firstNight: CharacterInfo[];
  // already sorted
  otherNights: CharacterInfo[];
}

export function getNightSheets(characters: string[]): NightSheets {
  var firstNightChars: CharacterInfo[] = [roles.get("MINION"), roles.get("DEMON")];
  var otherNightChars: CharacterInfo[] = [];

  for (const id of characters) {
    const character = roles.get(id);
    if (character === undefined) {
      console.warn(`unknown character ${id} `);
      continue;
    } else {
      if (character.firstNight) {
        firstNightChars.push(character);
      }
      if (character.otherNights) {
        otherNightChars.push(character);
      }
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
  readonly sheets: NightSheets;
  readonly jinxes: Jinx[];

  constructor(data: ScriptData) {
    // normalize
    for (var i = 0; i < data.characters.length; i++) {
      data.characters[i] = nameToId(data.characters[i]);
    }
    this.title = data.title;
    this.sheets = getNightSheets(data.characters);
    this.jinxes = getJinxList(data.characters);
  }
}
