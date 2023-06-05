// To show nothing for a night reminder, set it to an empty string "".
//
// nights sets both firstNight and otherNights implicitly

export interface Override {
  ability?: string;
  nights?: string;
  firstNight?: string;
  otherNights?: string;
}

const overrideList: { [key: string]: Override } = {
  "philosopher": {
    nights: "",
  },
  "investigator": {
    firstNight: "",
  },
  "chef": {
    firstNight: "Show the number of pairs of neighboring evil players.",
  },
  "clockmaker": {
    firstNight: "Show the number of places from Demon to closest Minion.",
  },
  "lunatic": {
    firstNight: `If 7 or more players: <tab>Show THESE ARE YOUR MINIONS. Point to "Minions".
    <tab>Show three bluffs.
    <tab>Put the Lunatic to sleep. Wake the demon.
    <tab>Show the YOU ARE token, and the Demon token.
    <tab>Show THIS PLAYER IS and the Lunatic token, point to the Lunatic.
    `,
    otherNights: "Do whatever is needed to simulate the demon.",
  },
  "cerenovus": {
    nights: `The Cerenovus chooses a player and character. Wake the target.
    Show THIS CHARACTER SELECTED YOU, the Cerenovus token, and the madness character.`,
  },
  "sailor": {
    nights: "",
  },
  "poisoner": {
    nights: "The Poisoner picks a player to poison.",
  },
  "fortuneteller": {
    nights: "The Fortune Teller points to two players. Give a yes if one is the Demon (or red herring)."
  },
  "cultleader": {
    nights: "The Cult Leader might change alignment to match an alive neighbor. If it changed, tell the Cult Leader their new alignment.",
  },
  "monk": {
    nights: "The Monk protects a player from the Demon.",
  },
  "innkeeper": {
    nights: "The Innkeeper points to two players, who are both safe from the Demon. One is drunk.",
  },
  "imp": {
    otherNights: `The Imp kills a player. If they chose themselves,
    replace an alive Minion with an Imp token. Show them YOU ARE and then the Imp token.`,
  },
  "towncrier": {
    otherNights: "Give a 'yes' or 'no' for if a Minion nominated today.",
  },

  // new roles not in BotC online
  "knight": {
    ability: "You start knowing 2 players that are not the Demon.",
    firstNight: "Point to the two players marked Know (one is the Demon).",
  },
  "steward": {
    ability: "You start knowing 1 good player.",
    firstNight: "Point to the player marked Know (who is good).",
  },
  "vizier": {
    ability: "All players know who you are. You cannot die during the day. If good voted, you may choose to execute immediately.",
    firstNight: "Announce which player is the Vizier.",
  },
  "organgrinder": {
    ability: "All players keep their eyes closed when voting & the vote tally is secret. Votes for you only count if you vote.",
  },

  // fabled do not have abilities in the botc online data
  "spiritofivory": {
    ability: "There can't be more than 1 extra evil player."
  },
  "doomsayer": {
    ability: `If 4 or more players live, each living player may publicly
choose (once per game) that a player of their own alignment dies.`,
  },
  "duchess": {
    ability: `Each day, 3 players may choose to visit you.
At night*, each visitor learns how many visitors are evil, but 1 gets false info.`,
  },
  "sentinel": {
    ability: `There might be 1 extra or 1 fewer Outsider in play.`,
  },
  "stormcatcher": {
    ability: `Name a good character. If in play, they can only
die by execution, but evil players learn which player it is.`,
  },
}

function getOverride(id: string): Override {
  return overrideList[id] ?? {};
}

export const overrides = {
  all: overrideList,
  get: getOverride,
  firstNight: (id: string): string | undefined => {
    const override = getOverride(id);
    return override.nights ?? override.firstNight ?? undefined;
  },
  otherNights: (id: string): string | undefined => {
    const override = getOverride(id);
    return override.nights ?? override.otherNights ?? undefined;
  },
  ability: (id: string): string | undefined => {
    const override = getOverride(id);
    return override.ability ?? undefined;
  }
};
