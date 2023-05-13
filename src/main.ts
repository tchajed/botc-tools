import images from '../assets/img/*.png';
import script_jinxes from '../assets/data/jinx.json';
import script_roles from '../assets/data/roles.json';
import botc_roles from '../assets/data/botc_online_roles.json';
import nightsheet from '../assets/data/nightsheet.json';

// normalizes keys for images
function fixImages() {
  for (const name of Object.keys(images)) {
    const newName = nameToId(name);
    if (newName != name) {
      images[newName] = images[name];
      // leave the old one as well just in case
    }
  }
}
fixImages();

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
  details: `If there are 7 or more players: Wake the Demon.Show the THESE ARE YOUR MINIONS token.Point to all Minions.
  Show THESE CHARACTERS ARE NOT IN PLAY and three bluffs.`,
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

function iconPath(id: string): string {
  return images[`Icon_${id}`];
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
      console.warn(`unknown character ${id} `);
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

interface Jinx {
  readonly character1: string,
  readonly character2: string,
  readonly description: string,
}

function getJinxList(characters: string[]): Jinx[] {
  var js = [];
  for (const jinx1 of script_jinxes) {
    const character1 = nameToId(jinx1.id);
    if (!characters.includes(character1)) {
      continue;
    }
    for (const jinx2 of jinx1.jinx) {
      const character2 = nameToId(jinx2.id);
      if (!characters.includes(character2)) {
        continue;
      }
      js.push({
        character1, character2, description: jinx2.reason,
      });
    }
  }
  return js;
}

class Script {
  readonly title: string;
  readonly sheets: NightSheets;
  readonly jinxes: Jinx[];

  constructor(data: ScriptData) {
    // normalize
    for (var i = 0; i < data.characters.length; i++) {
      data.characters[i] = nameToId(data.characters[i]);
    }
    this.title = data.title;
    this.sheets = getNightSheets(data.characters);
    this.jinxes = getJinxList(data.characters);
  }
}

function createHeader(title: string, firstNight: boolean): HTMLElement {
  const element = document.createElement("h1");
  element.insertAdjacentHTML("beforeend", `<div>${title} </div>`);
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
      if (iconPath(character.id)) {
        charHTML += `<div class="img-container"><img class="char-icon" src=${iconPath(character.id)}></div>`;
      }
      charHTML += `</td>`
      charHTML += `<td class="name-cell">`;
      // heuristic for whether this is a real character
      if (iconPath(character.id)) {
        charHTML += `<a href="https://wiki.bloodontheclocktower.com/${character.name}">
          ${character.name}
        </a>`;
      } else {
        charHTML += `${character.name}`;
      }
      charHTML += `</td>`;
      var details = character.nightDetails(firstNight).details || "";
      details = details.replace(/If [^.]*:/g, '\n$&\n');
      details = details.trim();
      details = details.replace(/\n/g, "<br/>");
      details = details.replace(/\<tab\>/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
      for (const tokenName of tokenNames) {
        details = details.replace(tokenName, `<strong>${tokenName}</strong>`);
        var altTokenName = tokenName.charAt(0).toUpperCase() + tokenName.substring(1).toLowerCase();
        altTokenName = `'${altTokenName}'`;
        details = details.replace(altTokenName, `<strong>${tokenName}</strong>`);
      }
      charHTML += `<td class="details details-cell ${details == "" ? "empty" : ""}">${details}</td>`;
      charHTML += `</tr>`;
    }
  }
  charHTML += "</tbody>";
  charList?.insertAdjacentHTML("beforeend", charHTML);
  return charList;
}

function createJinxesElement(script: Script): HTMLElement {
  const div = document.createElement("div");
  div.classList.add("jinxes")
  div.classList.add("details")
  for (const jinx of script.jinxes) {
    for (const char of [jinx.character1, jinx.character2]) {
      div.insertAdjacentHTML("beforeend",
        `<div class="img-container"><img class="char-icon" src="${iconPath(char)}"></div>`);
    }
    div.insertAdjacentHTML("beforeend", `<div class="jinx">${jinx.description}</div>`);
  }
  return div;
}

function createSheetElement(script: Script, firstNight: boolean): HTMLElement {
  const div = document.createElement("div");
  div.insertAdjacentElement("beforeend", createHeader(script.title, firstNight));
  div.insertAdjacentElement("beforeend", createCharacterList(script.sheets, firstNight));
  div.insertAdjacentElement("beforeend", createJinxesElement(script));
  return div;
}

export function loadScriptToDOM(data: ScriptData) {
  const script = new Script(data);
  document.title = `${script.title} night sheets`;
  document.body.insertAdjacentElement("beforeend", createSheetElement(script, true));
  document.body.insertAdjacentHTML("beforeend", `<div class="page-divider-top"></div>`);
  document.body.insertAdjacentHTML("beforeend", `<div class="page-divider-bottom"></div>`);
  document.body.insertAdjacentElement("beforeend", createSheetElement(script, false));
}

// import script from '../assets/scripts/laissez_un_carnaval.json';
import script from '../assets/scripts/faith_trust_and_pixie_dust.json';
// import script from '../assets/scripts/visitors.json';
// import script from '../assets/scripts/sects_and_violets.json';
loadScriptToDOM(script);
