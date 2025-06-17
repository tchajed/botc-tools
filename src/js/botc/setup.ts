/** Encode the rules for BotC setup. */
import { CardInfo } from "../randomizer/components/characters";
import {
  CharacterInfo,
  RoleType,
  characterIdWithoutNumber,
  getCharacter,
} from "./roles";

export interface Distribution {
  townsfolk: number;
  outsider: number;
  minion: number;
  demon: number;
}

const DistRoles: (keyof Distribution)[] = [
  "townsfolk",
  "outsider",
  "minion",
  "demon",
];

export function isDistRoleType(role: RoleType): role is keyof Distribution {
  return ["townsfolk", "outsider", "minion", "demon"].includes(role);
}

function incRoleType(dist: Distribution, role: RoleType) {
  if (isDistRoleType(role)) {
    dist[role]++;
  }
}

export function zeroDistribution(): Distribution {
  return { townsfolk: 0, outsider: 0, minion: 0, demon: 0 };
}

export function distributionForCount(numPlayers: number): Distribution {
  const dist = zeroDistribution();
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
  const dist = zeroDistribution();
  for (const c of characters) {
    incRoleType(dist, c.roleType);
  }
  return dist;
}

/** Get the number of characters of each type taking into account extra copies of
 * characters like Riot and Legion. */
export function effectiveDistribution(
  numPlayers: number,
  characters: CharacterInfo[],
): Distribution {
  const dist = zeroDistribution();
  const targetDist = distributionForCount(numPlayers);
  let isLegion = false;
  for (const c of characters) {
    if (c.id == "riot") {
      // all minions are riot
      dist.demon += targetDist.minion;
    }
    if (c.id == "actor") {
      // all good players are actors
      dist.townsfolk += targetDist.townsfolk + targetDist.outsider - 1;
    }
    isLegion = isLegion || c.id == "legion";
    incRoleType(dist, c.roleType);
  }
  if (isLegion) {
    // all other players are legion
    //
    // the minion count is going to be wrong but avoid adding too many characters
    const demonCount =
      numPlayers - dist.townsfolk - dist.outsider - dist.minion;
    if (demonCount > 0) {
      dist.demon = demonCount;
    }
  }
  return dist;
}

export function selectableCharacters(
  characters: CharacterInfo[],
): CharacterInfo[] {
  const newChars: CharacterInfo[] = [];
  for (const c of characters) {
    newChars.push(c);
    if (c.id == "villageidiot" || c.id == "legionaryfallofrome") {
      for (let i = 1; i <= 2; i++) {
        newChars.push(getCharacter(`${c.id}-${i}`));
      }
    }
  }
  return newChars;
}

export type SetupModification = (
  | {
      // eg, Fang Gu (+1), Vigormortis (-1)
      // godfather and sentinel have multiple options
      type: "outsider_count";
      delta: number[];
    }
  // +1 townsfolk and does not go in bag (these are identical but it's easier to
  // separate them)
  | { type: "drunk"; notInBag: true }
  // Baron is separated to handle Heretic/Baron jinx, which changes Baron's
  // ability to +1 or +2 Outsiders.
  | { type: "baron" }
  | { type: "marionette"; notInBag: true }
  // +1 minion and does not go in bag
  | { type: "lilmonsta"; notInBag: true }
  // +damsel (allows/might require adding an outsider)
  | { type: "huntsman" }
  // all minions are riot (requires duplicate characters in bag)
  | { type: "riot" }
  // most players are legion (choice of number of evil, and requires duplicate
  // characters in bag)
  | { type: "legion" }
  // Atheist is complicated (setup is arbitrary but all good).
  | { type: "atheist" }
  // No effect on distribution but list +the King in setup help
  | { type: "choirboy" }
  // all good players are Actors
  | { type: "actor" }
  // arbitrary number of outsiders, no minions in bag
  | { type: "kazali" }
  // +0 to +2 village idiot (can be in bag up to 3 times)
  | { type: "villageidiot" }
  | { type: "lordoftyphon" }
  // no demon in bag, +1 townsfolk
  | { type: "summoner" }
  // arbitrary number of outsiders (X)
  | { type: "xaan" }
  // +Spartacus (similar to Huntsman)
  | { type: "haruspex" }
  // +0 to +2 legionary, like Village Idiot
  | { type: "legionary" }
  // +2 good, no demon in bag
  | { type: "hannibal"; notInBag: true }
  // -1 Minion
  | { type: "minion_ppp" }
  // +2 Minion
  | { type: "babygronk_battc" }
  // -0 or -1 outsider & all other outsider modifications
  | { type: "hermit" }
) & { notInBag?: boolean };

function outsiders(...delta: number[]): SetupModification {
  return { type: "outsider_count", delta };
}

export const SetupChanges: { [key: string]: SetupModification } = {
  baron: { type: "baron" },
  vigormortis: outsiders(-1),
  fanggu: outsiders(+1),
  balloonist: outsiders(0, +1),
  drunk: { type: "drunk", notInBag: true },
  lilmonsta: { type: "lilmonsta", notInBag: true },
  marionette: { type: "marionette", notInBag: true },
  godfather: outsiders(+1, -1),
  sentinel: outsiders(0, +1, -1),
  lyingppp: outsiders(+1, -1),
  huntsman: { type: "huntsman" },
  riot: { type: "riot" },
  legion: { type: "legion" },
  atheist: { type: "atheist" },
  choirboy: { type: "choirboy" },
  actor: { type: "actor" },
  kazali: { type: "kazali" },
  villageidiot: { type: "villageidiot" },
  summoner: { type: "summoner" },
  lordoftyphon: { type: "lordoftyphon" },
  xaan: { type: "xaan" },
  hermit: { type: "hermit" },

  // Fall of Rome
  badomenfallofrome: { type: "drunk", notInBag: true },
  scholarfallofrome: outsiders(+1),
  haruspexfallofrome: { type: "haruspex" },
  legionaryfallofrome: { type: "legionary" },
  hannibalfallofrome: { type: "hannibal", notInBag: true },

  // Pedagogic Pits & Pendulums
  minionppp: { type: "minion_ppp" },

  // Brainrot at the Twitch Chat
  babygronkbattc: { type: "babygronk_battc" },
};

export function goesInBag(char: CardInfo): boolean {
  if (char.roleType == "fabled") {
    return false;
  }
  const mod = SetupChanges[characterIdWithoutNumber(char.id)];
  if (!mod) {
    return true;
  }
  const notInBag = mod.notInBag || false;
  return !notInBag;
}

function distTotal(dist: Distribution): number {
  return dist.townsfolk + dist.outsider + dist.minion + dist.demon;
}

function arbitraryOutsiders(old_dist: Distribution): Distribution[] {
  // start with 0 outsiders and build the other counts from there
  const start: Distribution = {
    townsfolk: old_dist.townsfolk + old_dist.outsider,
    outsider: 0,
    minion: old_dist.minion,
    demon: old_dist.demon,
  };
  const dists: Distribution[] = [];
  // allow 0-5; clamping will remove the invalid ones
  for (let outsiderCount = 0; outsiderCount <= 5; outsiderCount++) {
    const dist: Distribution = { ...start };
    dist.townsfolk -= outsiderCount;
    dist.outsider = outsiderCount;
    dists.push(dist);
  }
  return dists;
}

function applyModification(
  old_dist: Distribution,
  mod: SetupModification,
  // global character list
  characters: CharacterInfo[],
): Distribution[] {
  const dist: Distribution = { ...old_dist };
  switch (mod.type) {
    case "outsider_count": {
      return mod.delta.map((delta) => {
        const newDist = { ...old_dist };
        newDist.townsfolk -= delta;
        newDist.outsider += delta;
        return newDist;
      });
    }
    // these are actually handled the same way
    case "drunk":
    case "marionette": {
      dist.townsfolk++;
      return [dist];
    }
    case "baron": {
      let mod: SetupModification = { type: "outsider_count", delta: [2] };
      // Heretic on the script changes the Baron's ability (using a Jinx)
      if (characters.find((c) => c.id == "heretic")) {
        mod = { type: "outsider_count", delta: [1, 2] };
      }
      return applyModification(old_dist, mod, characters);
    }
    case "lilmonsta": {
      dist.minion++;
      return [dist];
    }
    // both of these are +a specific outsider
    case "huntsman":
    case "haruspex": {
      if (dist.outsider == 0) {
        // we must add an outsider to have the Damsel/Spartacus
        dist.outsider = 1;
        dist.townsfolk--;
        return [dist];
      }
      // allowed to add Damsel/Spartacus by adding an outsider
      dist.townsfolk--;
      dist.outsider++;
      // ...but we don't have to
      const sameDist = { ...old_dist };
      return [sameDist, dist];
    }
    case "choirboy": {
      return [dist];
    }
    case "riot": {
      dist.demon += dist.minion;
      dist.minion = 0;
      return [dist];
    }
    case "legion": {
      const dists: Distribution[] = [];
      const numPlayers = distTotal(old_dist);
      const oldGoodCount = old_dist.townsfolk + old_dist.outsider;
      for (const demonCount of [oldGoodCount, oldGoodCount - 1]) {
        const goodCount = numPlayers - demonCount;
        dist.demon = demonCount;
        dist.minion = 0;
        for (let numTownsfolk = 1; numTownsfolk <= goodCount; numTownsfolk++) {
          dists.push({
            demon: demonCount,
            minion: 0,
            townsfolk: numTownsfolk,
            outsider: goodCount - numTownsfolk,
          });
        }
      }
      return dists;
    }
    case "atheist": {
      const numPlayers = distTotal(old_dist);
      return arbitraryOutsiders({
        townsfolk: numPlayers,
        outsider: 0,
        minion: 0,
        demon: 0,
      });
    }
    case "actor": {
      return [
        {
          // all townsfolk are actors
          townsfolk: old_dist.townsfolk + old_dist.outsider,
          outsider: 0,
          minion: old_dist.minion,
          demon: old_dist.demon,
        },
      ];
    }
    case "kazali": {
      const start: Distribution = { ...old_dist };
      // move minions to townsfolk, then arbitrary outsiders
      start.townsfolk += old_dist.minion;
      start.minion = 0;
      return arbitraryOutsiders(start);
    }
    case "xaan": {
      return arbitraryOutsiders(old_dist);
    }
    case "summoner": {
      const dist = { ...old_dist };
      dist.townsfolk += dist.demon;
      dist.demon = 0;
      return [dist];
    }
    case "lordoftyphon": {
      const dist = { ...old_dist };
      // minions are not distributed
      //
      // TODO: would be better to select minions but make them not go in the bag
      dist.minion = 0;
      dist.townsfolk += old_dist.minion;
      return arbitraryOutsiders(dist);
    }
    case "hermit": {
      // hermit's own ability
      const dists = applyModification(old_dist, outsiders(-0, -1), characters);
      // inherit any setup modifications of other characters in bag
      const scriptOutsiderMods: SetupModification[] = characters
        .filter((c) => c.roleType === "outsider" && c.id != "hermit")
        .flatMap((c) => {
          const mod = SetupChanges[characterIdWithoutNumber(c.id)];
          if (mod) {
            return [mod];
          }
          return [];
        });
      return dists.flatMap((d) => {
        return scriptOutsiderMods.flatMap((mod) =>
          applyModification(d, mod, characters),
        );
      });
    }
    case "villageidiot":
    case "legionary": {
      return [dist];
    }
    case "hannibal": {
      const dist = { ...old_dist };
      // the demon remains selected, but isn't distributed
      // an extra townsfolk is added so two good players can be Hannibal
      dist.townsfolk++;
      return [dist];
    }
    case "minion_ppp": {
      const dist = { ...old_dist };
      dist.minion--;
      dist.townsfolk++;
      return [dist];
    }
    case "babygronk_battc": {
      const dist = { ...old_dist };
      dist.minion++;
      dist.minion++;
      dist.townsfolk--;
      dist.townsfolk--;
      return [dist];
    }
  }
}

function clampedValid(
  dist: Distribution,
  characters: CharacterInfo[],
): boolean {
  const totalDist = actualDistribution(characters);
  // allow arbitrary number of demons for clamping purposes (for Riot, Legion)
  totalDist.demon = 15;
  return DistRoles.every((roleType) => {
    return 0 <= dist[roleType] && dist[roleType] <= totalDist[roleType];
  });
}

export function uniqueDistributions(dists: Distribution[]): Distribution[] {
  const uniqueDists: Distribution[] = [];
  for (const dist of dists) {
    if (uniqueDists.some((d) => sameDistribution(d, dist))) {
      // duplicate
      continue;
    }
    uniqueDists.push(dist);
  }
  return uniqueDists;
}

export function modifiesSetup(id: string): boolean {
  return id in SetupChanges;
}

export function modifiedDistribution(
  dist: Distribution,
  mods: SetupModification[],
  characters: CharacterInfo[],
): Distribution[] {
  let dists = [dist];
  for (const mod of mods) {
    dists = dists.flatMap((dist) => applyModification(dist, mod, characters));
  }
  // the Hermit can remove itself but still have its -1 outsider setup effect,
  // so it change the distribution without being in the selection
  if (characters.some((c) => c.id === "hermit")) {
    dists = dists.flatMap((dist) =>
      applyModification(dist, outsiders(-0, -1), characters),
    );
  }
  dists = dists.filter((d) => clampedValid(d, characters));
  return uniqueDistributions(dists);
}

export function modifyingCharacters(selection: Set<string>): CharacterInfo[] {
  const modified: CharacterInfo[] = [];
  selection.forEach((id) => {
    if (modifiesSetup(id)) {
      modified.push(getCharacter(id));
    }
  });
  modified.sort((c1, c2) => c1.name.localeCompare(c2.name));
  return modified;
}

export function targetDistributions(
  numPlayers: number,
  modifying: CharacterInfo[],
  characters: CharacterInfo[],
): Distribution[] {
  const baseDistribution = distributionForCount(numPlayers);
  const newDistributions = modifiedDistribution(
    baseDistribution,
    modifying.map((c) => SetupChanges[c.id]),
    characters,
  );
  // fallback for some edge cases (specifically High Stakes Betting where
  // without Riot there are no valid setups)
  if (newDistributions.length == 0) {
    return [baseDistribution];
  }
  return newDistributions;
}

function differentRoleTypes(d1: Distribution, d2: Distribution): string[] {
  return DistRoles.filter((roleType) => d1[roleType] != d2[roleType]);
}

export function sameDistribution(d1: Distribution, d2: Distribution): boolean {
  return differentRoleTypes(d1, d2).length == 0;
}

export function roleTypesDefinitelyDone(
  targets: Distribution[],
  d: Distribution,
): RoleType[] {
  return DistRoles.filter((roleType) =>
    targets.every((td) => d[roleType] >= td[roleType]),
  );
}

// instanceNum disambiguates instances of characters that can be in the bag
// multiple times (eg, riot, legion, actor)
export type BagCharacter = CardInfo & { instanceNum?: number };

/** Divide the selection into characters in the bag and those "outside" (in play
 * but not distributed). */
export function splitSelectedChars(
  characters: CharacterInfo[],
  selection: Set<string>,
  numPlayers: number,
): {
  bag: BagCharacter[];
  outsideBag: CardInfo[];
} {
  const selected = characters.filter((char) => selection.has(char.id));
  const bag: BagCharacter[] = selected.filter((c) => goesInBag(c));
  const dist = distributionForCount(numPlayers);
  const riot = bag.find((c) => c.id == "riot");
  if (riot) {
    for (let i = 0; i < dist.minion; i++) {
      const thisRiot: BagCharacter = { instanceNum: i, ...riot };
      bag.push(thisRiot);
    }
  }

  const legion = bag.find((c) => c.id == "legion");
  if (legion) {
    const numExtraLegion = dist.townsfolk + dist.outsider - 1;
    for (let i = 0; i < numExtraLegion && bag.length < numPlayers; i++) {
      const thisLegion: BagCharacter = { instanceNum: i, ...legion };
      bag.push(thisLegion);
    }
  }

  const actor = bag.find((c) => c.id == "actor");
  if (actor) {
    const numExtraActors = dist.townsfolk + dist.outsider - 1;
    for (let i = 0; i < numExtraActors && bag.length < numPlayers; i++) {
      const thisActor: BagCharacter = { instanceNum: i, ...actor };
      bag.push(thisActor);
    }
  }

  const outsideBag = selected.filter((char) => !goesInBag(char));
  if (bag.find((c) => c.id == "hermit")) {
    const drunk = characters.find((c) => c.id == "drunk");
    if (drunk && !bag.find((c) => c.id == "drunk")) {
      outsideBag.push(drunk);
    }
  }

  outsideBag.sort((c1, c2) => c1.name.localeCompare(c2.name));
  return { bag, outsideBag };
}
