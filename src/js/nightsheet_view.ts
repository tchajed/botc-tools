import { CharacterInfo } from './botc/roles';
import { NightOrders, Script } from './botc/script';
import { selectedScript } from './select_script';

import { characterIconElement, htmlToElements, iconPath } from './views';

import h from 'hyperscript';
import hh from 'hyperscript-helpers';
const { div, h1, a, table, tbody, tr, td } = hh(h);

import classnames from 'classnames';

const tokenNames = new Set([
  "THIS IS THE DEMON",
  "THESE ARE YOUR MINIONS",
  "THESE CHARACTERS ARE NOT IN PLAY",
  "YOU ARE",
  "THIS CHARACTER SELECTED YOU",
  "THIS PLAYER IS",
]);

function createHeader(title: string, firstNight: boolean): HTMLElement {
  const nightLabel = firstNight ? "FIRST NIGHT" : "OTHER NIGHTS";
  return h1(
    [
      div(title),
      div(".label", nightLabel),
    ]
  );
}

function detailsElement(details: string | null): ChildNode[] {
  if (!details) {
    return [];
  }
  var details = details;
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
  return htmlToElements(details);
}

function characterRow(character: CharacterInfo, firstNight: boolean): HTMLElement {
  var cells = [];

  cells.push(td(".icon-cell", characterIconElement(character)));
  var nameCell = [character.name];
  if (iconPath(character.id)) {
    nameCell = a({ href: `https://wiki.bloodontheclocktower.com/${character.name}` }, [nameCell]);
  }
  cells.push(td(".name-cell", nameCell));
  const details = detailsElement(character.nightDetails(firstNight).details);
  cells.push(td({
    className: classnames(
      "details", "details-cell",
      details.length == 0 ? "empty" : null)
  }, details));

  return tr({ className: classnames(character.evil ? "evil" : "good") }, cells);
}

function createCharacterList(orders: NightOrders, firstNight: boolean): HTMLElement {
  var rows = [];
  for (const character of firstNight ? orders.firstNight : orders.otherNights) {
    if (character.nightDetails(firstNight)) {
      rows.push(characterRow(character, firstNight));
    }
  }
  return table(tbody(rows));
}

function createJinxesElement(script: Script): HTMLElement {
  var els = [];
  for (const jinx of script.jinxes) {
    for (const char of [jinx.character1, jinx.character2]) {
      els.push(...characterIconElement({ id: char }));
    }
    els.push(div(".jinx", [jinx.description]));
  }
  return div(".jinxes .details", els);
}

function createSheetElement(script: Script, firstNight: boolean): HTMLElement {
  const div = document.createElement("div");
  div.insertAdjacentElement("beforeend", createHeader(script.title, firstNight));
  div.insertAdjacentElement("beforeend", createCharacterList(script.orders, firstNight));
  div.insertAdjacentElement("beforeend", createJinxesElement(script));
  return div;
}

export function loadScriptToDOM(script: Script) {
  document.title = `${script.title} night sheets`;
  const el = document.getElementById("app");
  el.innerHTML = "";
  el.insertAdjacentElement("beforeend", createSheetElement(script, true));
  el.insertAdjacentHTML("beforeend", `<div class="page-divider-top"></div>`);
  el.insertAdjacentHTML("beforeend", `<div class="page-divider-bottom"></div>`);
  el.insertAdjacentElement("beforeend", createSheetElement(script, false));
}

async function init() {
  let script = await selectedScript();
  loadScriptToDOM(new Script(script));
}

init();
