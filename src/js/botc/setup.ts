/** Encode the rules for BotC setup. */

import { CharacterInfo } from "./roles";

export interface Distribution {
  townsfolk: number,
  outsider: number,
  minion: number,
  demon: number,
}

export function zeroDistribution(): Distribution {
  return { townsfolk: 0, outsider: 0, minion: 0, demon: 0 };
}

export function distributionForCount(numPlayers: number): Distribution {
  var dist = zeroDistribution();
  dist.demon = 1;
  if (numPlayers == 5 || numPlayers == 6) {
    dist.outsider = numPlayers - 5;
    dist.minion = 1;
  } else {
    dist.outsider = (numPlayers - 7) % 3;
    dist.minion = Math.floor((numPlayers - 7) / 3) + 1;
  }
  dist.townsfolk = numPlayers - dist.outsider - dist.minion - dist.demon;
  return dist;
}

export function actualDistribution(characters: CharacterInfo[]): Distribution {
  var dist = zeroDistribution();
  for (const c of characters) {
    dist[c.roleType]++;
  }
  return dist;
}

export function validNumPlayers(numPlayers: number): boolean {
  return 5 <= numPlayers && numPlayers <= 15;
}

export type SetupModification =
  {
    // eg, Baron (+2), Fang Gu (+1), Vigormortis (-1)
    type: "outsider_count",
    delta: number,
  } |
  // unique: +1 townsfolk and does not go in bag
  { type: "drunk", notInBag: true } |
  // unique: +1 minion and does not go in bag
  { type: "lilmonsta", notInBag: true } |
  // unique: +1 or -1 outsider (non-deterministic)
  { type: "godfather" }
  // Riot [All Minions are Riot] is special but can be run by putting in
  // arbitrary minions.

  // Legion is complicated (need duplicates, non-deterministic).
  // Atheist is complicated (setup is arbitrary but all good).
  ;

function outsiders(delta: number): SetupModification {
  return { type: "outsider_count", delta };
}

export const SetupChanges: { [key: string]: SetupModification } = {
  "baron": outsiders(+2),
  "vigormortis": outsiders(-1),
  "fanggu": outsiders(+1),
  "balloonist": outsiders(+1),
  "drunk": { type: "drunk", notInBag: true },
  "lilmonsta": { type: "lilmonsta", notInBag: true },
  "godfather": { type: "godfather" },
};

export function goesInBag(id: string): boolean {
  const mod = SetupChanges[id];
  if (!mod) {
    return true;
  }
  if (!("notInBag" in mod)) {
    return true;
  }
  return !mod.notInBag;
}

function applyModification(old_dist: Distribution, mod: SetupModification): Distribution {
  var dist: Distribution = { ...old_dist };
  switch (mod.type) {
    case "outsider_count": {
      dist.townsfolk -= mod.delta;
      dist.outsider += mod.delta;
      return dist;
    }
    case "drunk": {
      dist.townsfolk++;
      return dist;
    }
    case "lilmonsta": {
      dist.minion++;
      return dist;
    }
    case "godfather": {
      dist.townsfolk--;
      dist.outsider++;
      // TODO: handle non-determinism upstream and also return otherDist
      var otherDist = { ...old_dist };
      otherDist.townsfolk++;
      otherDist.townsfolk--;
      return dist;
    }
  }
}

export function modifiedDistribution(
  dist: Distribution,
  mods: SetupModification[],
  characters: CharacterInfo[])
  : Distribution {
  var dist = dist;
  for (const mod of mods) {
    dist = applyModification(dist, mod);
  }
  if (dist.outsider < 0) {
    dist.outsider = 0;
  }
  const numOutsiders = characters.filter(c => c.roleType == "outsider").length;
  if (dist.outsider > numOutsiders) {
    dist.outsider = numOutsiders;
  }
  const numMinions = characters.filter(c => c.roleType == "minion").length;
  if (dist.minion > numMinions) {
    dist.minion = numMinions;
  }
  return dist;
}

export function differentRoleTypes(d1: Distribution, d2: Distribution): string[] {
  return ["townsfolk", "outsider", "minion", "demon"].filter(
    roleType => d1[roleType] != d2[roleType]
  );
}
