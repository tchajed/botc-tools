import images from './img/*.png';
import script_roles from '../data/roles.json';
import botc_roles from '../data/botc_online_roles.json';
import nightsheet from '../data/nightsheet.json';

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
  return name.toLowerCase().replace(" ", "").replace("'", "").replace("-", "");
}

function createRoleData(): Map<string, CharacterInfo> {
  var roles: Map<string, CharacterInfo> = new Map();

  for (const role of script_roles) {
    const name: string = role.name;
    const id = nameToId(name);
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
      }
    }
  }

  return roles;
}

const roles = createRoleData();

const MinionInfo: CharacterInfo = new CharacterInfo("MINION", "Minion Info", "minion");
MinionInfo.firstNight = {
  details: "If there are 7 or more players: Wake all Minions. Show the 'This is the demon' token. Point to the Demon.",
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

function setScriptTitle(title: string) {
  document.title = `${title} night sheet`;
  var titleElement = document.getElementById("title");
  if (titleElement) {
    titleElement.innerText = title;
  }
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

function setCharacterList(characters: string[], firstNight: boolean) {
  var label = document.getElementById("nights_label");
  label.innerText = firstNight ? "FIRST NIGHT" : "OTHER NIGHTS";
  var charList = document.getElementById("list");

  const sheets = getNightSheets(characters);

  var charHTML = "";
  charHTML += "<tbody>";
  for (const character of firstNight ? sheets.firstNight : sheets.otherNights) {
    const align = character.evil ? "evil" : "good";
    if (character.firstNight) {
      charHTML += `<tr class="${align}">`;

      charHTML += `<td class="icon-cell">`
      if (iconPath(character)) {
        charHTML += `<div class="img-container"><img class="char-icon" src=${iconPath(character)}></div>`;
      }
      charHTML += `</td>`
      charHTML += `<td class="name-cell">${character.name}</td>`;
      var details = character.nightDetails(firstNight).details;
      details = details.replace(/If [^.]*:/g, '\n$&\n');
      details = details.replace(/\n/g, "<br/>");
      for (const tokenName of tokenNames) {
        details = details.replace(tokenName, '<strong>$&</strong>');
      }
      charHTML += `<td class="details-cell">${details}</td>`;
      charHTML += `</tr>`;
    }
  }
  charHTML += "</tbody>";
  charList?.insertAdjacentHTML("beforeend", charHTML);
}

export function loadScriptToDOM(data: ScriptData) {
  setScriptTitle(data.title);
  setCharacterList(data.characters, true);
}

// Embedded data for Laissez un Carnaval - imagine this came from a JSON file.


const script: ScriptData = {
  title: "Laissez un Carnaval",
  characters: [
    "investigator",
    "chef",
    "clockmaker",
    "balloonist",
    "snakecharmer",
    "philosopher",
    "artist",
    "fisherman",
    "savant",
    "amnesiac",
    "poppygrower",
    "minstrel",
    "cannibal",
    "mutant",
    "goon",
    "lunatic",
    "drunk",
    "poisoner",
    "goblin",
    "baron",
    "cerenovus",
    "leviathan",
  ],
};
loadScriptToDOM(script);
