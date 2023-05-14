import { CharacterInfo } from './botc/roles';
import { Script } from './botc/script';

import { iconPath } from './views';

function htmlToElement(html: string): HTMLElement {
  var template = document.createElement('template');
  html = html.trimStart(); // Avoid creating a whitespace node
  template.innerHTML = html;
  return template.content.firstChild as HTMLElement;
}

function createHeaderHTML(title: string): HTMLElement {
  return htmlToElement(`<h1><div>${title}</div></h1>`);
}

function createCharacterHTML(character: CharacterInfo): HTMLElement {
  const el = document.createElement("tr");
  el.classList.add(character.evil ? "evil" : "good");

  var charHTML = "";
  charHTML += `<td class="icon-cell">`
  // TODO: factor out this snippet to views.ts
  if (iconPath(character.id)) {
    charHTML += `<div class="img-container"><img class="char-icon" src=${iconPath(character.id)}></div>`;
  }
  charHTML += `</td>`
  charHTML += `<td class="name-cell">${character.name}</td>`;
  var ability = character.ability;
  ability = ability.replace(/\[[^]*\]/g, '<strong>$&</strong>');
  charHTML += `<td class="ability-cell">${ability}</td>`;

  el.insertAdjacentHTML("beforeend", charHTML);

  return el;
}

function createCharactersList(characters: CharacterInfo[]): HTMLElement {
  const table = document.createElement("table");

  const el = document.createElement("tbody");
  table.insertAdjacentElement("beforeend", el);

  var rolesSeen = {};
  for (const character of characters) {
    if (!rolesSeen[character.roleType]) {
      var roleType: string = character.roleType;
      if (roleType != "townsfolk") {
        roleType += "s";
      }
      roleType = roleType.toUpperCase();
      el.insertAdjacentElement("beforeend", htmlToElement(
        `<tr><td></td><td>
        <strong>${roleType}</strong>
        </td><td></td>`,
      ));
      rolesSeen[character.roleType] = true;
    }
    el.insertAdjacentElement("beforeend", createCharacterHTML(character));
  }

  return table;
}

function loadScriptToDOM(script: Script) {
  document.title = `${script.title} roles sheet`;
  document.body.insertAdjacentElement("beforeend", createHeaderHTML(script.title));
  document.body.insertAdjacentElement("beforeend", createCharactersList(script.characters));
  document.body.insertAdjacentHTML("beforeend", "<footer>*Not the first night</footer>");
}

import script from '../assets/scripts/faith_trust_and_pixie_dust.json';
loadScriptToDOM(new Script(script));
