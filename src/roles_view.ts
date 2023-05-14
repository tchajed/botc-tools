import { CharacterInfo } from './botc/roles';
import { Script } from './botc/script';

import { iconPath } from './views';

import h from 'hyperscript';
import hh from 'hyperscript-helpers';
const { div, h1, img, strong, table, tbody, tr, td } = hh(h);

import classnames from 'classnames';

function htmlToElement(html: string): HTMLElement {
  var template = document.createElement('template');
  html = html.trimStart(); // Avoid creating a whitespace node
  template.innerHTML = html;
  return template.content.firstChild as HTMLElement;
}

function htmlToElements(html: string): ChildNode[] {
  var template = document.createElement('template');
  html = html.trimStart(); // Avoid creating a whitespace node
  template.innerHTML = html;
  return Array.from(template.content.childNodes);
}

function createHeaderHTML(title: string): HTMLElement {
  return h1(div(title));
}

function abilityHTML(ability: string): ChildNode[] {
  return htmlToElements(ability.replace(/\[[^]*\]/g, '<strong>$&</strong>'));
}

function createCharacterHTML(character: CharacterInfo): HTMLElement {
  var cells = [];

  cells.push(td(".icon-cell",
    iconPath(character.id) ? div(".img-container",
      img(".char-icon", { src: iconPath(character.id) })
    ) : []))

  cells.push(td(".name-cell", [character.name]));

  cells.push(td(".ability-cell", abilityHTML(character.ability)));

  return tr({ className: classnames(character.evil ? "evil" : "good") }, cells);
}

function roleTypeRow(roleType: string): HTMLElement {
  var label: string = roleType;
  if (label != "townsfolk") {
    label += "s";
  }
  label = label.toUpperCase();
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
  document.body.insertAdjacentElement("beforeend", createHeaderHTML(script.title));
  document.body.insertAdjacentElement("beforeend", createCharactersList(script.characters));
  document.body.insertAdjacentHTML("beforeend", "<footer>*Not the first night</footer>");
}

import script from '../assets/scripts/faith_trust_and_pixie_dust.json';
loadScriptToDOM(new Script(script));
