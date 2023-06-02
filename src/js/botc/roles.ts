import script_roles from '../../../assets/data/roles.json';
import botc_roles from '../../../assets/data/botc_online_roles.json';
import nightsheet from '../../../assets/data/nightsheet.json';

interface Override {
  ability?: string;
  firstNight?: string | null;
  otherNights?: string | null;
}

const overrides: { [key: string]: Override } = {
  "philosopher": {
    firstNight: null,
    otherNights: null,
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

interface NightAction {
  details: string;
  index: number;
}

const RoleTypes = ["townsfolk", "outsider", "minion", "demon", "fabled", "travellers"] as const;
export type RoleType = typeof RoleTypes[number];

export class CharacterInfo {
  readonly id: string;
  readonly name: string;
  readonly roleType: RoleType;
  ability: string | null;

  firstNight: NightAction | null;
  otherNights: NightAction | null;

  constructor(id: string, name: string, roleType: RoleType) {
    this.id = id;
    this.name = name;
    this.roleType = roleType;
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

export const MinionInfo: CharacterInfo = new CharacterInfo("MINION", "Minion Info", "minion");
MinionInfo.firstNight = {
  details: "If there are 7 or more players: Wake all Minions. Show the THIS IS THE DEMON token. Point to the Demon.",
  index: nightsheet.firstNight.indexOf("MINION"),
};

export const DemonInfo: CharacterInfo = new CharacterInfo("DEMON", "Demon Info", "demon");
DemonInfo.firstNight = {
  details: `If there are 7 or more players: Wake the Demon.Show the THESE ARE YOUR MINIONS token.Point to all Minions.
  Show THESE CHARACTERS ARE NOT IN PLAY and three bluffs.`,
  index: nightsheet.firstNight.indexOf("DEMON"),
}

export function nameToId(name: string): string {
  return name.toLowerCase().replaceAll(/[ '-_]/g, "");
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
    const override = overrides[id];
    if (info === undefined) {
      // a character in the online tool but not known to the script tool -
      // applies to Mephit (which was renamed)
      continue;
    }

    if (override !== undefined && override.ability !== undefined) {
      info.ability = override.ability;
    } else {
      info.ability = role.ability;
    }

    if (role.firstNightReminder != "") {
      const index = nightsheet.firstNight.indexOf(info.name);
      if (index < 0 && info.roleType != "travellers") {
        console.warn(`${id} not found in night sheet`);
      }
      info.firstNight = {
        details: role.firstNightReminder,
        index,
      };
      if (override !== undefined) {
        info.firstNight.details = override.firstNight || "";
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
      if (override !== undefined) {
        var details = override.otherNights;
        // copy first night override of otherNights is omitted
        if (details === undefined) {
          details = override.firstNight;
        }
        info.otherNights.details = details || "";
      }
    }
  }

  for (const id of Object.keys(overrides)) {
    if (botc_roles.find(c => c.id == id) === undefined) {
      // an override for a character not in Clocktower Online
      const info = roles.get(id);
      if (info === undefined) {
        console.error(`override info for unknown id ${id} `);
        continue;
      }
      const override = overrides[id];
      if (override.ability) {
        info.ability = override.ability;
      }
    }
  }

  roles.set("MINION", MinionInfo);
  roles.set("DEMON", DemonInfo);

  console.log(roles.get("spiritofivory"));

  return roles;
}

export const roles = createRoleData();
