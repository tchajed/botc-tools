import images from '../assets/img/*.png';
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
    firstNight: "The poisoner picks a player to poison.",
  },
}

class NightAction {
  details: string;
  index: number;
}

class CharacterInfo {
  readonly id: string;
  readonly name: string;
  readonly roleType: string;

  firstNight: NightAction | null;
  otherNights: NightAction | null;

  constructor(id: string, name: string, roleType: string) {
    this.id = id;
    this.name = name;
    this.roleType = roleType;
    this.firstNight = null;
    this.otherNights = null;
  }

  get evil(): boolean {
    return ["minion", "demon", "MINION", "DEMON"].includes(this.roleType);
  }

  nightDetails(firstNight: boolean): NightAction | null {
    if (firstNight) {
      return this.firstNight;
    }
    return this.otherNights;
  }
}

function nameToId(name: string): string {
  return name.toLowerCase().replace(" ", "").replace("'", "").replace("-", "").replace("_", "");
}

function createRoleData(): Map<string, CharacterInfo> {
  var roles: Map<string, CharacterInfo> = new Map();

  for (const role of script_roles) {
    const id = nameToId(role.id);
    const name: string = role.name;
    const roleType = role.roleType;
    const info = new CharacterInfo(id, name, roleType);
    roles.set(id, info);
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

  return roles;
}

const roles = createRoleData();

const MinionInfo: CharacterInfo = new CharacterInfo("MINION", "Minion Info", "minion");
MinionInfo.firstNight = {
  details: "If there are 7 or more players: Wake all Minions. Show the THIS IS THE DEMON token. Point to the Demon.",
  index: nightsheet.firstNight.indexOf("MINION"),
};

const DemonInfo: CharacterInfo = new CharacterInfo("DEMON", "Demon Info", "demon");
DemonInfo.firstNight = {
  details: "If there are 7 or more players: Wake the Demon. Show the 'These are \
  your minions' token. Point to all Minions.",
  index: nightsheet.firstNight.indexOf("DEMON"),
}

class ScriptData {
  title: string;
  characters: string[];
}

const tokenNames = new Set([
  "THIS IS THE DEMON",
  "THESE ARE YOUR MINIONS",
  "THESE CHARACTERS ARE NOT IN PLAY",
  "YOU ARE",
  "THIS CHARACTER SELECTED YOU",
  "THIS PLAYER IS",
]);

function iconPath(character: CharacterInfo): string {
  return images[character.id];
}

interface NightSheets {
  // already sorted
  firstNight: CharacterInfo[];
  // already sorted
  otherNights: CharacterInfo[];
}

function getNightSheets(characters: string[]) {
  var firstNightChars: CharacterInfo[] = [MinionInfo, DemonInfo];
  var otherNightChars: CharacterInfo[] = [];

  for (const id of characters) {
    const character = roles.get(id);
    if (character === undefined) {
      console.warn(`unknown character ${id}`);
      continue;
    } else {
      if (character.firstNight) {
        firstNightChars.push(character);
      }
      if (character.otherNights) {
        otherNightChars.push(character);
      }
    }
  }

  firstNightChars.sort((info1, info2) => (info1.firstNight?.index || 0) - (info2.firstNight?.index || 0));
  otherNightChars.sort((info1, info2) => (info1.otherNights?.index || 0) - (info2.otherNights?.index || 0));

  return {
    firstNight: firstNightChars,
    otherNights: otherNightChars,
  }
}

class Script {
  readonly title: string;
  readonly sheets: NightSheets;

  constructor(data: ScriptData) {
    this.title = data.title;
    this.sheets = getNightSheets(data.characters);
  }
}

function createHeader(title: string, firstNight: boolean): HTMLElement {
  const element = document.createElement("h1");
  element.insertAdjacentHTML("beforeend", `<div>${title}</div>`);
  const nightLabel = firstNight ? "FIRST NIGHT" : "OTHER NIGHTS";
  element.insertAdjacentHTML("beforeend", `<div class="label">${nightLabel}</div>`);
  return element;
}

function createCharacterList(sheets: NightSheets, firstNight: boolean): HTMLElement {
  var charList = document.createElement("table");
  var charHTML = "";
  charHTML += "<tbody>";
  for (const character of firstNight ? sheets.firstNight : sheets.otherNights) {
    const align = character.evil ? "evil" : "good";
    if (character.nightDetails(firstNight)) {
      charHTML += `<tr class="${align}">`;

      charHTML += `<td class="icon-cell">`
      if (iconPath(character)) {
        charHTML += `<div class="img-container"><img class="char-icon" src=${iconPath(character)}></div>`;
      }
      charHTML += `</td>`
      charHTML += `<td class="name-cell">${character.name}</td>`;
      var details = character.nightDetails(firstNight).details || "";
      details = details.replace(/If [^.]*:/g, '\n$&\n');
      details = details.trim();
      details = details.replace(/\n/g, "<br/>");
      details = details.replace(/\<tab\>/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
      for (const tokenName of tokenNames) {
        details = details.replace(tokenName, '<strong>$&</strong>');
      }
      charHTML += `<td class="details-cell ${details == "" ? "empty" : ""}">${details}</td>`;
      charHTML += `</tr>`;
    }
  }
  charHTML += "</tbody>";
  charList?.insertAdjacentHTML("beforeend", charHTML);
  return charList;
}

function createSheetElement(script: Script, firstNight: boolean): HTMLElement {
  const div = document.createElement("div");
  div.insertAdjacentElement("beforeend", createHeader(script.title, firstNight));
  div.insertAdjacentElement("beforeend", createCharacterList(script.sheets, firstNight));
  return div;
}

export function loadScriptToDOM(data: ScriptData) {
  const script = new Script(data);
  document.title = `${script.title}`;
  document.body.insertAdjacentElement("beforeend", createSheetElement(script, true));
  document.body.insertAdjacentHTML("beforeend", `<div class="page-divider-top"></div>`);
  document.body.insertAdjacentHTML("beforeend", `<div class="page-divider-bottom"></div>`);
  document.body.insertAdjacentElement("beforeend", createSheetElement(script, false));
}

// import script from '../assets/scripts/laissez_un_carnaval.json';
// import script from '../assets/scripts/faith_trust_and_pixie_dust.json';
import script from '../assets/scripts/visitors.json';
loadScriptToDOM(script);
