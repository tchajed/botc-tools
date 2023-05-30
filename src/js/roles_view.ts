import { CharacterInfo } from './botc/roles';
import { Script } from './botc/script';

import { characterIconElement, htmlToElements } from './views';

import h from 'hyperscript';
import hh from 'hyperscript-helpers';
const { div, h1, strong, table, tbody, tr, td } = hh(h);

import classnames from 'classnames';
import { selectedScript } from './select_script';

function createHeaderHTML(title: string): HTMLElement {
  return h1(div(title));
}

function abilityHTML(ability: string): ChildNode[] {
  return htmlToElements(ability.replace(/\[[^]*\]/g, '<strong>$&</strong>'));
}

function createCharacterHTML(character: CharacterInfo): HTMLElement {
  var cells = [];

  cells.push(td(".icon-cell", characterIconElement(character)));
  cells.push(td(".name-cell", [character.name]));
  cells.push(td(".ability-cell", abilityHTML(character.ability)));

  return tr({ className: classnames(character.evil ? "evil" : "good") }, cells);
}

function pluralRole(roleType: string): string {
  return roleType == "townsfolk" ? roleType : roleType + "s"
}

function roleTypeRow(roleType: string): HTMLElement {
  var label: string = pluralRole(roleType).toUpperCase();
  var cells = [];
  cells.push(td()); // icon column
  cells.push(td(strong([label])));
  cells.push(td()); // ability column
  return tr(cells);
}

function createCharactersList(characters: CharacterInfo[]): HTMLElement {
  var rows = [];
  var rolesSeen = {};
  for (const character of characters) {
    if (!rolesSeen[character.roleType]) {
      rows.push(roleTypeRow(character.roleType));
      rolesSeen[character.roleType] = true;
    }
    rows.push(createCharacterHTML(character));
  }
  return table(tbody(rows));
}

function loadScriptToDOM(script: Script) {
  document.title = `${script.title} roles sheet`;
  const el = document.getElementById("app");
  el.innerHTML = "";
  el.insertAdjacentElement("beforeend", createHeaderHTML(script.title));
  el.insertAdjacentElement("beforeend", createCharactersList(script.characters));
  el.insertAdjacentHTML("beforeend", "<footer>*Not the first night</footer>");
}

async function init() {
  let script = await selectedScript();
  loadScriptToDOM(new Script(script));
}

init();