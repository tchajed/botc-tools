import { aliceInWonderland } from "./alice_in_wonderland";
import homebrews from "../../../assets/homebrew/homebrews.json";
import { nameToId } from "./roles";
import { homebrewRoles, amnesiacs } from "./homebrew";

// To show nothing for a night reminder, set it to an empty string "".
//
// nights sets both firstNight and otherNights implicitly
export interface Override {
  ability?: string;
  nights?: string;
  homebrew?: {
    name: string;
    roleType:
      | "townsfolk"
      | "outsider"
      | "minion"
      | "demon"
      | "fabled"
      | "travellers";
    firstNightIndex?: number;
    otherNightsIndex?: number;
  };
  firstNight?: string;
  otherNights?: string;
}

type Overrides = { [key: string]: Override };

// Changes to base + experimental roles, usually to make more concise or fix
// formatting for the tool.
const baseOverrides: Overrides = {
  drunk: {
    ability: `You do not know you are the Drunk. You think you are a Townsfolk character, but you are not.`,
    firstNight: `Assign which Townsfolk is actually the Drunk.`,
  },
  philosopher: {
    nights:
      `The Philosopher might pick a good character. If they chose a character:` +
      `<tab>Give them that ability.
      <tab>If the character is in play, make them drunk.`,
  },
  washerwoman: {
    firstNight: "Show a Townsfolk token and two players.",
  },
  librarian: {
    firstNight: "Show an Outsider token and two players.",
  },
  investigator: {
    firstNight: "Show a Minion token and two players.",
  },
  chef: {
    firstNight: "Show the number of pairs of neighboring evil players.",
  },
  clockmaker: {
    firstNight: "Show the number of places from Demon to closest Minion.",
  },
  lunatic: {
    firstNight: `If 7 or more players: <tab>Show THESE ARE YOUR MINIONS. Point to "Minions".
    <tab>Show three bluffs.
    <tab>Put the Lunatic to sleep.
    Wake the demon. Show the YOU ARE token, and the Demon token.
    Show THIS PLAYER IS and the Lunatic token, point to the Lunatic.
    `,
    otherNights: "Do whatever is needed to simulate the demon.",
  },
  cerenovus: {
    nights: `The Cerenovus chooses a player and character. Wake the target.
    Show THIS CHARACTER SELECTED YOU, the Cerenovus token, and the madness character.`,
  },
  poisoner: {
    nights: "The Poisoner picks a player to poison.",
  },
  fortuneteller: {
    nights:
      "The Fortune Teller points to two players. Give a yes if one is the Demon (or red herring).",
  },
  cultleader: {
    nights:
      "The Cult Leader might change alignment to match an alive neighbor. If it changed, tell the Cult Leader YOU ARE EVIL or YOU ARE GOOD.",
  },
  monk: {
    otherNights: "The Monk protects a player from the Demon.",
  },
  innkeeper: {
    otherNights:
      "The Innkeeper points to two players, who are both safe from the Demon. One is drunk.",
  },
  imp: {
    otherNights: `The Imp kills a player. If they chose themselves,
    replace an alive Minion with an Imp token. Show them YOU ARE and then the Imp token.`,
  },
  towncrier: {
    otherNights: "Give a 'yes' or 'no' for if a Minion nominated today.",
  },
  snakecharmer: {
    nights: `The Snake Charmer points to a player. If that player is the Demon:<tab>swap the Demon and Snake Charmer character and alignments.
<tab>Wake each player and show them YOU ARE and their new role and alignment.
The new Snake Charmer is poisoned.
    `,
  },
  // use new more-specific token texts
  damsel: {
    firstNight: `Wake all the Minions, show them THIS CHARACTER IS IN PLAY and the Damsel token.`,
  },
  king: {
    firstNight: `Wake the Demon, show them THIS PLAYER IS and point to the King player.`,
  },
  marionette: {
    firstNight:
      `Select one of the good players next to the Demon and mark them ` +
      `with Is the Marionette. Wake the Demon and show them THIS PLAYER IS ` +
      `and the Marionette token.`,
  },
  exorcist: {
    otherNights:
      `The Exorcist points to a player, different from the previous night. If that player is the Demon: ` +
      `<tab>Wake the Demon.
      <tab>Show THIS PLAYER IS and the Exorcist.
      <tab>The Demon does not act tonight.`,
  },
  bountyhunter: {
    firstNight: `Point to 1 evil player. Wake the townsfolk who is evil and show them YOU ARE EVIL and the thumbs-down sign.`,
  },
  mezepheles: {
    otherNights: `Wake the 1st good player that said the Mezepheles' secret word and show them YOU ARE EVIL and the thumbs-down sign.`,
  },
  fanggu: {
    otherNights: `The Fang Gu points to a player. That player dies.
    Or, if that player was an Outsider and there are no other Fang Gu in play:
    <tab>The Fang Gu dies instead of the chosen player. The chosen player is now an evil Fang Gu.
    <tab>Wake the new Fang Gu. Show the YOU ARE card, then the Fang Gu token. Show YOU ARE EVIL.`,
  },
  balloonist: {
    ability:
      "Each night, you learn 1 player of each character type, until there are no more types to learn. [+0 or +1 Outsider]",
    firstNight:
      "Choose a character type. Point to a player whose character is of that type. Place the Balloonist's Seen reminder next to that character.",
    otherNights:
      "Choose a character type that does not yet have a Seen reminder next to a character of that type. Point to a player whose character is of that type, if there are any. Place the Balloonist's Seen reminder next to that character.",
  },
};

// new roles not in BotC online
const newRoles: Overrides = {
  knight: {
    ability: "You start knowing 2 players that are not the Demon.",
    firstNight: "Point to the two players marked Know (one is the Demon).",
  },
  steward: {
    ability: "You start knowing 1 good player.",
    firstNight: "Point to the player marked Know (who is good).",
  },
  vizier: {
    ability:
      "All players know who you are. You cannot die during the day. If good voted, you may choose to execute immediately.",
    firstNight: "Announce which player is the Vizier.",
  },
  organgrinder: {
    ability:
      "All players keep their eyes closed when voting & the vote tally is secret. Votes for you only count if you vote.",
  },
  highpriestess: {
    ability:
      "Each night, learn which player the Storyteller believes you should talk to most.",
    nights: "Point to a player the High Priestess should talk to.",
  },
  harpy: {
    ability:
      "Each night, choose 2 players: tomorrow, the 1st player is mad that the 2nd is evil, or one or both might die.",
    nights:
      `The Harpy chooses two players. Mark both Harpy selected. ` +
      `Tell the first player THIS CHARACTER SELECTED YOU and point to the second player.`,
  },
  plaguedoctor: {
    ability: "If you die, the Storyteller gains a not-in-play Minion ability.",
  },
  shugenja: {
    ability:
      "You start knowing if your closest evil player is clockwise or anti-clockwise. If equidistant, this info is arbitrary.",
    firstNight:
      "Wake the Shugenja. Point horizontally in the direction of the closest evil player.",
  },
  ojo: {
    ability:
      "Each night*, choose a character: they die. If they are not in play, the Storyteller chooses who dies.",
    otherNights:
      "The Ojo chooses a character. If that character is in play, that player dies. If that character is not in play, choose any player. That player dies.",
  },
  hatter: {
    ability:
      "If you died today or tonight, the Minion & Demon players may choose new Minion & Demon characters to be.",
    otherNights:
      "If the Hatter died, show the Minion and Demon players the THIS CHARACTER SELECTED YOU and allow them to pick a new character.",
  },
  kazali: {
    ability:
      "Each night*, choose a player: they die. [You choose which players are which Minions. -? to +? Outsiders]",
    otherNights: "The Kazali chooses a player. That player dies.",
  },
  villageidiot: {
    ability:
      "Each night, choose a player: you learn their alignment. [+0 to +2 Village Idiots. 1 of the extras is drunk]",
    firstNight:
      "Choose an extra Village Idiot to be drunk. Each Village Idiot chooses a player. Show them the alignment of that player.",
    otherNights:
      "Each Village Idiot chooses a player. Show them the alignment of that player.",
  },
  yaggababble: {
    ability:
      "You start knowing a secret phrase. For each time you said it publicly today, a player might die.",
    firstNight: "Show the Yaggababble their secret phrase.",
    otherNights:
      "Choose a number of players up to the total number of times the Yaggababble said their secret phrase publicly; those players die.",
  },
  summoner: {
    ability:
      "You get 3 bluffs. On the 3rd night, choose a player: they become an evil Demon of your choice. [No Demon]",
    firstNight:
      "Show the Summoner THESE CHARACTERS ARE NOT IN PLAY and three bluffs.",
    otherNights: `If it is the 3rd night, wake the Summoner.
      <tab>They point to a player and a Demon on the character sheet - that player becomes that Demon.
      <tab>Show the player YOU ARE and the demon token, and YOU ARE EVIL.`,
  },
  banshee: {
    ability:
      "If the Demon kills you, all players learn this. From now on, you may nominate twice per day and vote twice per nomination.",
    otherNights: `If the Demon kills the Banshee, announce that the Banshee has awoken.`,
  },
  ogre: {
    ability:
      "On your 1st night, choose a player (not yourself): you become their alignment (you don't know which) even if drunk or poisoned.",
    firstNight:
      "The Ogre points to a player (not themselves) and becomes their alignment.",
  },
  alsaahir: {
    ability:
      "Once per day, if you publicly guess which players are Minion(s) and which are Demon(s), good wins.",
  },
};

// fabled do not have abilities in the botc online data
const fabledRoles: Overrides = {
  spiritofivory: {
    ability: "There can't be more than 1 extra evil player.",
  },
  doomsayer: {
    ability: `If 4 or more players live, each living player may publicly
choose (once per game) that a player of their own alignment dies.`,
  },
  duchess: {
    ability: `Each day, 3 players may choose to visit you.
At night*, each visitor learns how many visitors are evil, but 1 gets false info.`,
  },
  sentinel: {
    ability: `There might be 1 extra or 1 fewer Outsider in play.`,
  },
  stormcatcher: {
    ability: `Name a good character. If in play, they can only
die by execution, but evil players learn which player it is.`,
    firstNight: `If the named character is in play, show the evil players THIS PLAYER IS and the character token.
If not, show them STORM CAUGHT CHARACTER IS NOT IN PLAY.`,
  },
  angel: {
    ability: `Something bad might happen to whoever is most responsible for the death of a new player.`,
  },
  toymaker: {
    ability: `The Demon may choose not to attack & must do this at least once per game. Evil players get normal starting info.`,
  },
  buddhist: {
    ability: `For the first 2 minutes of each day, veteran players may not talk.`,
  },
  hellslibrarian: {
    ability: `Something bad might happen to whoever talks when the Storyteller has asked for silence.`,
  },
  fiddler: {
    ability: `Once per game, the Demon secretly chooses an opposing player: all players choose which of these 2 players win.`,
  },
  fibbin: {
    ability: `Once per game, 1 good player might get incorrect information.`,
  },
};

function homebrewOverrides(): Overrides {
  const homebrew: Overrides = {};
  for (const script of homebrews) {
    for (const id in script.characters) {
      homebrew[nameToId(id)] = (
        script.characters as { [key: string]: Override }
      )[id];
    }
  }
  return homebrew;
}

const overrideList: { [key: string]: Override } = {
  ...baseOverrides,
  ...newRoles,
  ...fabledRoles,
  ...homebrewRoles,
  ...amnesiacs,
  ...aliceInWonderland,
  ...homebrewOverrides(),
};

function getOverride(id: string): Override {
  return overrideList[id] ?? {};
}

export const overrides = {
  all: overrideList,
  get: getOverride,
  firstNight: (id: string): string | null => {
    const override = getOverride(id);
    return override.nights ?? override.firstNight ?? null;
  },
  firstNightIndex: (id: string): number | null => {
    const override = getOverride(id);
    return override.homebrew?.firstNightIndex ?? null;
  },
  otherNights: (id: string): string | null => {
    const override = getOverride(id);
    return override.nights ?? override.otherNights ?? null;
  },
  otherNightsIndex: (id: string): number | null => {
    const override = getOverride(id);
    return override.homebrew?.otherNightsIndex ?? null;
  },
  ability: (id: string): string | null => {
    const override = getOverride(id);
    return override.ability ?? null;
  },
};
