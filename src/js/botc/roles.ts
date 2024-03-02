/* Script Tool roles
 *
 * Provides roleType but not abilities (these are in images which are assembled
 * to form the script PDF).
 *
 * Official characters from https://script.bloodontheclocktower.com/
 * clocktower.online (old online website) roles
 *
 * Unofficial, but quite up-to-date. Has abilities and storyteller instructions
 * ("reminders") for first and other nights. The reminder text is unofficial;
 * the wiki has detailed "how to run" instructions but not concise ones suitable
 * for a night sheet. There are also night orderings here, but they're ignored
 * in favor of the official script tool.
 */
import botc_roles from "../../../assets/data/botc_online_roles.json";
import script_roles from "../../../assets/data/roles.json";
import { nightorder } from "./nightorder";

/* Custom overrides provided by this app. Most of these are simplifications to
 * the night sheet to surface more important instructions, but this also
 * includes fabled abilities which are otherwise not available anywhere.
 */
import { overrides } from "./overrides";

export interface NightAction {
  details: string;
  index: number;
}

const RoleTypes = [
  "townsfolk",
  "outsider",
  "minion",
  "demon",
  "fabled",
  "travellers",
] as const;
export type RoleType = (typeof RoleTypes)[number];

const Editions = ["tb", "snv", "bmr", "other"] as const;
export type Edition = (typeof Editions)[number];

// TODO: this is the only class in use, perhaps it would be good to make it a
// mere interface and handle these methods some other way (currently it creates
// some awkwardness when we need CardInfo & {demonNum: number}).
export class CharacterInfo {
  readonly id: string;
  readonly name: string;
  readonly roleType: RoleType;
  readonly edition: Edition;
  ability: string | null;

  firstNight: NightAction | null;
  otherNights: NightAction | null;

  constructor(id: string, name: string, roleType: RoleType, edition: Edition) {
    this.id = id;
    this.name = name;
    this.roleType = roleType;
    this.edition = edition;
    this.ability = null;
    this.firstNight = null;
    this.otherNights = null;
  }

  get good(): boolean {
    return ["townsfolk", "outsider"].includes(this.roleType);
  }

  get evil(): boolean {
    return ["minion", "demon"].includes(this.roleType);
  }

  get special(): boolean {
    return ["travellers", "fabled"].includes(this.roleType);
  }

  nightDetails(firstNight: boolean): NightAction | null {
    if (firstNight) {
      return this.firstNight;
    }
    return this.otherNights;
  }
}

export const MinionInfo: CharacterInfo = new CharacterInfo(
  "MINION",
  "Minion Info",
  "minion",
  "other",
);
MinionInfo.firstNight = {
  details: `If 7 or more players: <tab>Wake all Minions. Show the THIS IS THE DEMON token.
    <tab>Point to the Demon.`,
  index: nightorder.firstNight("MINION"),
};

export const NonTeensyMinionInfo: CharacterInfo = new CharacterInfo(
  MinionInfo.id,
  MinionInfo.name,
  MinionInfo.roleType,
  MinionInfo.edition,
);
NonTeensyMinionInfo.firstNight = {
  details: `Wake all Minions. Show the THIS IS THE DEMON token.
  Point to the Demon.`,
  index: nightorder.firstNight("MINION"),
};

export const DemonInfo: CharacterInfo = new CharacterInfo(
  "DEMON",
  "Demon Info",
  "demon",
  "other",
);
DemonInfo.firstNight = {
  details: `If there are 7 or more players:<tab>Wake the Demon.
  <tab>Show the THESE ARE YOUR MINIONS token. Point to all Minions.
  <tab>Show THESE CHARACTERS ARE NOT IN PLAY and three bluffs.`,
  index: nightorder.firstNight("DEMON"),
};

export const NonTeensyDemonInfo: CharacterInfo = new CharacterInfo(
  DemonInfo.id,
  DemonInfo.name,
  DemonInfo.roleType,
  DemonInfo.edition,
);
NonTeensyDemonInfo.firstNight = {
  details: `Wake the Demon.
  Show the THESE ARE YOUR MINIONS token. Point to all Minions.
  Show THESE CHARACTERS ARE NOT IN PLAY and three bluffs.`,
  index: nightorder.firstNight("DEMON"),
};

export function nameToId(name: string): string {
  return name.toLowerCase().replaceAll(/[ '-_]/g, "");
}

function versionToEdition(version: string): Edition {
  if (version == "1 - Trouble Brewing") {
    return "tb";
  } else if (version == "2 - Bad Moon Rising") {
    return "bmr";
  } else if (version == "3 - Sects and Violets") {
    return "snv";
  }
  return "other";
}

function useOverride(id: string, info: CharacterInfo) {
  info.ability = overrides.ability(id) ?? info.ability;
  const firstNight = overrides.firstNight(id);
  if (firstNight) {
    const index =
      overrides.firstNightIndex(id) ?? nightorder.firstNight(info.name);
    info.firstNight = {
      index,
      details: firstNight,
    };
  }
  const otherNights = overrides.otherNights(id);
  if (otherNights) {
    const index =
      overrides.otherNightsIndex(id) ?? nightorder.otherNights(info.name);
    info.otherNights = {
      index,
      details: otherNights,
    };
  }
}

function createRoleData(): Map<string, CharacterInfo> {
  const roles: Map<string, CharacterInfo> = new Map();

  for (const role of script_roles) {
    const id = nameToId(role.id);
    const name: string = role.name;
    const roleType = role.roleType;
    const validRole = RoleTypes.find((r) => r == roleType);
    if (validRole) {
      const info = new CharacterInfo(
        id,
        name,
        validRole,
        versionToEdition(role.version),
      );
      roles.set(id, info);
      if (id == "villageidiot") {
        // add two copies of Village Idiot for the extra selections
        for (let i = 1; i <= 2; i++) {
          const info = new CharacterInfo(
            `${id}-${i}`,
            name,
            validRole,
            versionToEdition(role.version),
          );
          roles.set(info.id, info);
        }
      }
    } else {
      console.warn(`invalid role ${roleType} for ${id}`);
    }
  }

  for (const role of botc_roles) {
    const id = role.id;
    const info = roles.get(id);
    if (info === undefined) {
      // a character in the online tool but not known to the script tool -
      // applies to Mephit (which was renamed)
      continue;
    }

    info.ability = role.ability;

    if (role.firstNightReminder != "") {
      const index = nightorder.getFirstNight(info.name);
      if (index == null && info.roleType != "travellers") {
        console.warn(`${id} not found in night sheet`);
      }
      info.firstNight = {
        details: role.firstNightReminder,
        index: index || -1,
      };
    }
    if (role.otherNightReminder != "") {
      const index = nightorder.getOtherNights(info.name);
      if (index == null && info.roleType != "travellers") {
        console.warn(`${id} not found in night sheet`);
      }
      info.otherNights = {
        details: role.otherNightReminder,
        index: index || -1,
      };
    }
    useOverride(id, info);
  }

  for (const id of Object.keys(overrides.all)) {
    const override = overrides.all[id];
    if (override.homebrew !== undefined) {
      const data = override.homebrew;
      const char = new CharacterInfo(id, data.name, data.roleType, "other");
      useOverride(id, char);
      roles.set(id, char);
      continue;
    }
    const info = roles.get(id);
    // an override for a non-Homebrew character not in Clocktower Online
    if (info === undefined) {
      console.error(`override info for unknown id ${id} `);
      continue;
    }
    useOverride(id, info);
  }

  roles.set("MINION", MinionInfo);
  roles.set("DEMON", DemonInfo);

  return roles;
}

export const roles = createRoleData();

export function getCharacter(id: string): CharacterInfo {
  const c = roles.get(id);
  if (!c) {
    throw new Error(`unknown character ${id}`);
  }
  return c;
}

// Lunatic with night instructions customized to Teensyville (where Lunatic and
// Demon should not learn Minions or bluffs).
export const TeensyLunatic: CharacterInfo = ((lunatic) => {
  if (!lunatic) {
    throw new Error("could not get lunatic character");
  }
  const info = new CharacterInfo(
    lunatic.id,
    lunatic.name,
    lunatic.roleType,
    lunatic.edition,
  );
  info.ability = lunatic.ability;

  info.firstNight = {
    details: `Wake the demon. Show the YOU ARE token, and the Demon token.
    Show THIS PLAYER IS and the Lunatic token, point to the Lunatic.`,
    index: lunatic.firstNight?.index || 0,
  };
  info.otherNights = {
    details: "Do whatever is needed to simulate the demon.",
    index: lunatic.otherNights?.index || 0,
  };
  return info;
})(roles.get("lunatic"));

// regular expression to remove a number from a character id, used to allow
// selecting multiple copies of Village Idiot
const NameNumberRe = /(?<name>[a-zA-Z]+)-(?<number>\d+)/;

/** Remove a number suffix, turning villageidiot-1 into villageidiot for example,
 * if the normalized identifier is needed. */
export function characterIdWithoutNumber(id: string): string {
  const match = id.match(NameNumberRe);
  if (match && match.groups) {
    return match.groups.name;
  }
  return id;
}
