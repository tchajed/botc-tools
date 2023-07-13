import script_jinxes from "../../../assets/data/jinx.json";
import { extraJinxes } from "./overrides";
import { nameToId } from "./roles";

export interface JinxData {
  id: string;
  jinx: {
    id: string;
    reason: string;
  }[];
}

export interface Jinx {
  readonly character1: string;
  readonly character2: string;
  readonly description: string;
}

const allJinxes = script_jinxes.concat(extraJinxes);

export function getJinxList(characters: string[]): Jinx[] {
  const js: Jinx[] = [];
  for (const jinx1 of allJinxes) {
    const character1 = nameToId(jinx1.id);
    if (!characters.includes(character1)) {
      continue;
    }
    for (const jinx2 of jinx1.jinx) {
      const character2 = nameToId(jinx2.id);
      if (!characters.includes(character2)) {
        continue;
      }
      js.push({
        character1,
        character2,
        description: jinx2.reason,
      });
    }
  }
  return js;
}
