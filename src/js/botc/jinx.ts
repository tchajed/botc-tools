import script_jinxes from '../../../assets/data/jinx.json';

import { nameToId } from './roles';

export interface Jinx {
  readonly character1: string,
  readonly character2: string,
  readonly description: string,
}

export function getJinxList(characters: string[]): Jinx[] {
  var js = [];
  for (const jinx1 of script_jinxes) {
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
        character1, character2, description: jinx2.reason,
      });
    }
  }
  return js;
}
