import script_roles from '../assets/data/roles.json';
import botc_roles from '../assets/data/botc_online_roles.json';
import nightsheet from '../assets/data/nightsheet.json';

interface Override {
  firstNight?: string | null;
  otherNights?: string | null;
}

const overrides: { [key: string]: Override } = {
  "philosopher": {
    firstNight: null,
  },
  "investigator": {
    firstNight: null,
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
    `
  },
  "cerenovus": {
    firstNight: `The Cerenovus chooses a player and character. Wake the target.
    Show THIS CHARACTER SELECTED YOU, the Cerenovus token, and the madness character.`,
  },
  "sailor": {
    firstNight: null,
  },
  "poisoner": {
    firstNight: "The Poisoner picks a player to poison.",
  },
  "fortuneteller": {
    firstNight: "The Fortune Teller points to two players. Give a yes if one is the Demon (or red herring)."
  },
  "cultleader": {
    firstNight: "The Cult Leader might change alignment to match an alive neighbor. If it changed, tell the Cult Leader their new alignment.",
  },
  "monk": {
    otherNights: "The Monk protects a player from the Demon.",
  },
  "innkeeper": {
    otherNights: "The Innkeeper points to two players, who are both safe from the Demon. One is drunk.",
  },
  "imp": {
    otherNights: `The Imp kills a player. If they chose themselves,
    replace an alive Minion with an Imp token. Show them YOU ARE and then the Imp token.`,
  }
}

class NightAction {
  details: string;
  index: number;
}

const RoleTypes = ["townsfolk", "outsider", "minion", "demon", "fabled", "travellers"] as const;
type RoleType = typeof RoleTypes[number];

export class CharacterInfo {
  readonly id: string;
  readonly name: string;
  readonly roleType: RoleType;

  firstNight: NightAction | null;
  otherNights: NightAction | null;

  constructor(id: string, name: string, roleType: RoleType) {
    this.id = id;
    this.name = name;
    this.roleType = roleType;
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

const MinionInfo: CharacterInfo = new CharacterInfo("MINION", "Minion Info", "minion");
MinionInfo.firstNight = {
  details: "If there are 7 or more players: Wake all Minions. Show the THIS IS THE DEMON token. Point to the Demon.",
  index: nightsheet.firstNight.indexOf("MINION"),
};

const DemonInfo: CharacterInfo = new CharacterInfo("DEMON", "Demon Info", "demon");
DemonInfo.firstNight = {
  details: `If there are 7 or more players: Wake the Demon.Show the THESE ARE YOUR MINIONS token.Point to all Minions.
  Show THESE CHARACTERS ARE NOT IN PLAY and three bluffs.`,
  index: nightsheet.firstNight.indexOf("DEMON"),
}

export function nameToId(name: string): string {
  return name.toLowerCase().replace(" ", "").replace("'", "").replace("-", "").replace("_", "");
}

function createRoleData(): Map<string, CharacterInfo> {
  var roles: Map<string, CharacterInfo> = new Map();

  for (const role of script_roles) {
    const id = nameToId(role.id);
    const name: string = role.name;
    const roleType = role.roleType;
    const validRole = RoleTypes.find((r) => r == roleType);
    if (validRole) {
      const info = new CharacterInfo(id, name, validRole);
      roles.set(id, info);
    } else {
      console.warn(`invalid role ${roleType} for ${id}`);
    }
  }

  for (const role of botc_roles) {
    const id = role.id;
    const info = roles.get(id);
    if (info !== undefined) {
      if (role.firstNightReminder != "") {
        const index = nightsheet.firstNight.indexOf(info.name);
        if (index < 0 && info.roleType != "travellers") {
          console.warn(`${id} not found in night sheet`);
        }
        info.firstNight = {
          details: role.firstNightReminder,
          index,
        };
        if (overrides[id] !== undefined) {
          info.firstNight.details = overrides[id].firstNight;
        }
      }
      if (role.otherNightReminder != "") {
        const index = nightsheet.otherNight.indexOf(info.name);
        if (index < 0 && info.roleType != "travellers") {
          console.warn(`${id} not found in night sheet`);
        }
        info.otherNights = {
          details: role.otherNightReminder,
          index,
        }
        if (overrides[id] !== undefined) {
          var details = overrides[id].otherNights;
          if (details === undefined) {
            details = overrides[id].firstNight;
          }
          info.otherNights.details = details;
        }
      }
    }
  }

  roles.set("MINION", MinionInfo);
  roles.set("DEMON", DemonInfo);

  return roles;
}

export const roles = createRoleData();
