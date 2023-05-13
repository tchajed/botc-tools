import images from './img/*.png';
import nightsheet from '../data/nightsheet.json';
// script tool roles
import roles from '../data/roles.json';
import botc_roles from '../data/botc_online_roles.json';

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
    if (this.roleType == "minion" || this.roleType == "demon" || this.id == "MINION" || this.id == "DEMON") {
      return true;
    }
    return false;
  }
}


function nameToId(name: string): string {
  return name.toLowerCase().replace(" ", "").replace("'", "").replace("-", "");
}

var role_data: Map<string, CharacterInfo> = new Map();

function loadRoleData() {
  for (const role of roles) {
    const name: string = role.name;
    const id = nameToId(name);
    const roleType = role.roleType;
    const info = new CharacterInfo(id, name, roleType);
    role_data.set(id, info);
  }

  for (const role of botc_roles) {
    const id = role.id;
    const info = role_data.get(id);
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
}

loadRoleData();

const MinionInfo: CharacterInfo = new CharacterInfo("MINION", "Minion Info", "minion");
MinionInfo.firstNight = {
  details: "wake minions and show demon blah blah",
  index: nightsheet.firstNight.indexOf("MINION"),
};

const DemonInfo: CharacterInfo = new CharacterInfo("DEMON", "Demon Info", "demon");
DemonInfo.firstNight = {
  details: "wake demon and show minions blah blah",
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
    const character = role_data.get(id);
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

function setCharacterList(characters: string[]) {
  var charList = document.getElementById("list");

  const sheets = getNightSheets(characters);

  for (const character of sheets.firstNight) {
    const align = character.evil ? "evil" : "good";
    var charHTML = "";
    if (character.firstNight) {
      charHTML += `<div class="direction-line">`;
      if (iconPath(character)) {
        charHTML += `<div class="icon-container">
    <img class="char-icon" src=${iconPath(character)}>
    </div>`;
      } else {
        charHTML += `<div class="img-placeholder"></div>`;
      }
      charHTML += `<div class="char-name ${align}">${character.name}</div>`;
      var details = character.firstNight.details;
      details = details.replace("\n", "<br/>");
      for (const tokenName of tokenNames) {
        details = details.replace(tokenName, '<strong>$&</strong>');
      }
      charHTML += `<div class="directions">${details}</div>`;
    }
    charHTML += `</div>`;
    charList?.insertAdjacentHTML("beforeend", charHTML);
  }
}

export function loadScriptToDOM(data: ScriptData) {
  setScriptTitle(data.title);
  setCharacterList(data.characters);
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
