// homebrew characters
import { nightorder } from "./nightorder";
import { Override } from "./overrides";

type Overrides = { [key: string]: Override };

export const homebrewRoles: Overrides = {
  actor: {
    ability: `Whoever wins, loses & whoever loses, wins, even if you are dead. [All good players are Actors and know each other]`,
    firstNight: `Wake up all Actors and let them see each other.`,
    homebrew: {
      name: "Actor",
      roleType: "townsfolk",
      firstNightIndex: nightorder.firstNight("Pukka") + 1,
    },
  },
  lout: {
    ability: `On night three, learn an evil townsfolk. [1 Townsfolk is evil]`,
    firstNight: `Wake the townsfolk who is evil and show them YOU ARE EVIL and the thumbs-down sign.`,
    otherNights: `If it is night three, wake the Lout and point to an evil townsfolk.`,
    homebrew: {
      name: "Lout",
      roleType: "outsider",
      // very early
      firstNightIndex: 1,
      otherNightsIndex: nightorder.otherNights("Empath"),
    },
  },
};

// amnesiacs of any category
export const amnesiacs: Overrides = {
  amnesiacoutsider: {
    ability: `Outsider. You do not know what your ability is. Each day, privately guess what it is: you learn how accurate you are.`,
    firstNight: `Decide the Amnesiac's entire ability.
    If the Amnesiac's ability causes them to wake tonight:
    Wake the Amnesiac and run their ability.`,
    otherNights: `If the Amnesiac's ability causes them to wake tonight:
    Wake the Amnesiac and run their ability.`,
    homebrew: {
      name: "Amnesiac (O)",
      roleType: "outsider",
      firstNightIndex: nightorder.firstNight("Amnesiac"),
      otherNightsIndex: nightorder.otherNights("Amnesiac"),
    },
  },
  amnesiacminion: {
    ability: `Minion. You do not know what your ability is. Each day, privately guess what it is: you learn how accurate you are.`,
    firstNight: `Decide the Amnesiac's entire ability.
    If the Amnesiac's ability causes them to wake tonight:
    Wake the Amnesiac and run their ability.`,
    otherNights: `If the Amnesiac's ability causes them to wake tonight:
    Wake the Amnesiac and run their ability.`,
    homebrew: {
      name: "Amnesiac (M)",
      roleType: "minion",
      firstNightIndex: nightorder.firstNight("Amnesiac"),
      otherNightsIndex: nightorder.otherNights("Amnesiac"),
    },
  },
  amnesiacdemon: {
    ability: `Demon. You do not know what your ability is. Each day, privately guess what it is: you learn how accurate you are.`,
    firstNight: `Decide the Amnesiac's entire ability.
    If the Amnesiac's ability causes them to wake tonight:
    Wake the Amnesiac and run their ability.`,
    otherNights: `If the Amnesiac's ability causes them to wake tonight:
    Wake the Amnesiac and run their ability.`,
    homebrew: {
      name: "Amnesiac (D)",
      roleType: "demon",
      firstNightIndex: nightorder.firstNight("Amnesiac"),
      otherNightsIndex: nightorder.otherNights("Amnesiac"),
    },
  },
};
