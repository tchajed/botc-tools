import { NightOrders, Script } from './botc/script';

const tokenNames = new Set([
  "THIS IS THE DEMON",
  "THESE ARE YOUR MINIONS",
  "THESE CHARACTERS ARE NOT IN PLAY",
  "YOU ARE",
  "THIS CHARACTER SELECTED YOU",
  "THIS PLAYER IS",
]);

function createHeader(title: string, firstNight: boolean): HTMLElement {
  const element = document.createElement("h1");
  element.insertAdjacentHTML("beforeend", `<div>${title}</div>`);
  const nightLabel = firstNight ? "FIRST NIGHT" : "OTHER NIGHTS";
  element.insertAdjacentHTML("beforeend", `<div class="label">${nightLabel}</div>`);
  return element;
}

function createCharacterList(orders: NightOrders, firstNight: boolean): HTMLElement {
  var charList = document.createElement("table");
  var charHTML = "";
  charHTML += "<tbody>";
  for (const character of firstNight ? orders.firstNight : orders.otherNights) {
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
  div.insertAdjacentElement("beforeend", createCharacterList(script.orders, firstNight));
  div.insertAdjacentElement("beforeend", createJinxesElement(script));
  return div;
}

export function loadScriptToDOM(script: Script) {
  document.title = `${script.title} night sheets`;
  document.body.insertAdjacentElement("beforeend", createSheetElement(script, true));
  document.body.insertAdjacentHTML("beforeend", `<div class="page-divider-top"></div>`);
  document.body.insertAdjacentHTML("beforeend", `<div class="page-divider-bottom"></div>`);
  document.body.insertAdjacentElement("beforeend", createSheetElement(script, false));
}

// import script from '../assets/scripts/laissez_un_carnaval.json';
import script from '../assets/scripts/faith_trust_and_pixie_dust.json';
import { iconPath } from './views';
// import script from '../assets/scripts/visitors.json';
// import script from '../assets/scripts/sects_and_violets.json';
loadScriptToDOM(new Script(script));
