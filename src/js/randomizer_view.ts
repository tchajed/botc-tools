import { CharacterInfo } from './botc/roles';
import { Script } from './botc/script';

import { characterIconElement, htmlToElements } from './views';

import h from 'hyperscript';
import hh from 'hyperscript-helpers';
const { div, h1, strong, br, span } = hh(h);

import classnames from 'classnames';
import { selectedScript } from './select_script';

function createHeaderHTML(title: string): HTMLElement {
  return h1(div(title));
}

function createCharacterHTML(character: CharacterInfo): HTMLElement {
  var roleLabel = null;
  if (["outsider", "minion"].includes(character.roleType)) {
    roleLabel = span(".role-label", character.roleType.charAt(0).toUpperCase());
  }
  return div({ className: classnames(character.evil ? "evil" : "good", "character") },
    [
      roleLabel,
      characterIconElement(character),
      span(".name", character.name),
    ])
}

function createCharactersList(characters: CharacterInfo[]): HTMLElement {
  var rows = [];
  for (const character of characters) {
    rows.push(createCharacterHTML(character));
  }
  var num = Math.ceil(rows.length / 2);
  var column1 = rows.slice(0, num);
  var column2 = rows.slice(num, rows.length);
  return div(".characters",
    [div(".column", column1),
    div(".column", column2)],
  );
}

function loadScriptToDOM(script: Script) {
  document.title = `${script.title} roles sheet`;
  const el = document.getElementById("app");
  el.innerHTML = "";
  el.insertAdjacentElement("beforeend", createHeaderHTML(script.title));
  el.insertAdjacentElement("beforeend", createCharactersList(script.characters));
}

async function init() {
  let script = await selectedScript();
  loadScriptToDOM(new Script(script));
}

init();
