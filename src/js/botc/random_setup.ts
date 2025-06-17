import { Selection } from "./../randomizer/selection";
import { CharacterInfo, getCharacter } from "./roles";
import {
  Distribution,
  effectiveDistribution,
  modifyingCharacters,
  sameDistribution,
  targetDistributions,
} from "./setup";
import { shuffleArray } from "randomizer/ranking";

function randomChoice<T>(a: T[]): T {
  return a[Math.floor(Math.random() * a.length)];
}

function effectiveSelection(
  numPlayers: number,
  selection: Selection,
): Distribution {
  const selectedChars = [...selection.values()].map((id) => getCharacter(id));
  return effectiveDistribution(numPlayers, selectedChars);
}

function nextRandomChar(
  numPlayers: number,
  characters: CharacterInfo[],
  selection: Selection,
): { id: string } | "done" | "fail" {
  const newDists = targetDistributions(
    numPlayers,
    modifyingCharacters(selection, characters),
    characters,
  );

  const currentDist = effectiveSelection(numPlayers, selection);

  // already have avalid setup
  if (newDists.some((dist) => sameDistribution(dist, currentDist))) {
    return "done";
  }

  const available = characters.filter((c) => !selection.has(c.id));

  const randomOfRoleType = (roleType: string) => {
    const roles = available.filter((c) => c.roleType == roleType);
    if (roles.length == 0) {
      return "fail";
    }
    return {
      id: randomChoice(roles).id,
    };
  };

  // make sure there's an evil team
  if (newDists.every((dist) => currentDist.demon < dist.demon)) {
    // need a demon
    return randomOfRoleType("demon");
  }
  if (newDists.every((dist) => currentDist.minion < dist.minion)) {
    // need a minion
    return randomOfRoleType("minion");
  }

  // pick a distribution and try to satisfy it
  const targetDist = randomChoice(newDists);
  if (currentDist.outsider < targetDist.outsider) {
    return randomOfRoleType("outsider");
  }
  if (currentDist.townsfolk < targetDist.townsfolk) {
    return randomOfRoleType("townsfolk");
  }
  // selection is probably overfull, or we made a bad choice along the way
  return "fail";
}

// Return a new complete and valid selection that extends the input selection,
// or fail and return null.
//
// See the documentation for randomCompleteSelection.
function tryRandomCompleteSelection(
  numPlayers: number,
  characters: CharacterInfo[],
  selection: Selection,
): Selection | "fail" {
  const newSelection = new Set(selection);
  let nextChar = nextRandomChar(numPlayers, characters, newSelection);
  while (nextChar instanceof Object) {
    newSelection.add(nextChar.id);
    nextChar = nextRandomChar(numPlayers, characters, newSelection);
  }
  if (nextChar == "fail") {
    return nextChar;
  }
  return newSelection;
}

/**
 * Construct a new random selection starting from (and including) selection, and
 * stopping only at a valid selection.
 *
 * This process may fail, either because the initial setup has too many
 * characters, or because of incorrect choices along the way, since the
 * selection is computed one at a time.
 *
 * @param numPlayers
 * @param characters
 * @param selection
 * @returns
 */
export function randomCompleteSelection(
  numPlayers: number,
  characters: CharacterInfo[],
  selection: Selection,
): Selection | null {
  // try a few times to get a valid selection
  for (let i = 0; i < 5; i++) {
    const newSelection = tryRandomCompleteSelection(
      numPlayers,
      characters,
      selection,
    );
    if (newSelection == "fail") {
      continue;
    }
    return newSelection;
  }
  // too many failures, give up
  return null;
}

// The demon already knows these roles aren't in play
const badBluffs = new Set(["king", "poppygrower", "lunatic", "atheist"]);

export function randomBluffs(
  characters: CharacterInfo[],
  selection: Selection,
  bluffs: Selection,
): Selection {
  const chars = characters.filter(
    (c) => !selection.has(c.id) && !bluffs.has(c.id) && !badBluffs.has(c.id),
  );
  const townsfolk = chars.filter((c) => c.roleType == "townsfolk");
  shuffleArray(townsfolk);
  const newBluffs = new Set(bluffs);
  while (newBluffs.size < 3) {
    const c = townsfolk.pop()?.id;
    if (!c) {
      return newBluffs;
    }
    newBluffs.add(c);
  }
  return newBluffs;
}
