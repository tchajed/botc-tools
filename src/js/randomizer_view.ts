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
  var numColumns = 3;
  const numPerColumn = Math.ceil(rows.length / numColumns);
  var taken = 0;
  var columns = [];
  while (rows.length > 0) {
    var num = numPerColumn;
    // this isn't the last column
    if (rows.length > num &&
      // and the last two of this row have different roles
      characters[taken + num - 1].roleType !=
      characters[taken + num - 2].roleType) {
      // ... so move the last one to the next column
      num--;
    }
    // if the next column would have a single role at the top, take it earlier
    if (rows.length > 1 &&
      taken + num + 1 < characters.length &&
      characters[taken + num].roleType != characters[taken + num + 1].roleType) {
      num++;
    }
    let col = rows.splice(0, num);
    columns.push(col);
    taken += col.length;
  }
  return div(".characters", columns.map(col => div(".column", col)));
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
