import { CharacterInfo } from './botc/roles';
import { Script } from './botc/script';

import { characterIconElement, htmlToElements } from './views';

import h from 'hyperscript';
import hh from 'hyperscript-helpers';
const { div, h1, strong, br, span, label, input } = hh(h);

import classnames from 'classnames';
import { selectedScript } from './select_script';
import { Randomizer } from './randomizer_state';

function createHeaderHTML(title: string): HTMLElement {
  return h1(div(title));
}

var state = new Randomizer();

function distributionForCount(numPlayers: number): { townsfolk: number, outsiders: number, minions: number, demons: number } {
  const demons = 1;
  var outsiders = null;
  var minions = null;
  if (numPlayers == 5 || numPlayers == 6) {
    outsiders = numPlayers - 5;
    minions = 1;
  } else {
    outsiders = (numPlayers - 7) % 3;
    minions = Math.floor((numPlayers - 7) / 3) + 1;
  }
  const townsfolk = numPlayers - outsiders - minions - demons;
  return { townsfolk, outsiders, minions, demons };
}

function createDistributionHTML(state: Randomizer): HTMLElement {
  if (state.getNumPlayers() == null) {
    return span("");
  }
  let dist = distributionForCount(state.getNumPlayers());
  return span(
    [span(".good", dist.townsfolk.toString()),
      " / ",
    span(".good", dist.outsiders.toString()),
      " / ",
    span(".evil", dist.minions.toString()),
      " / ",
    span(".evil", dist.demons.toString()),
    ]);
}

function createPlayerSelectHTML(): HTMLElement {
  return div("#players", [
    div(
      [label({ for: "numPlayers" }, "Players: "),
      input(
        {
          oninput: (e: Event) => {
            if (e.target instanceof HTMLInputElement) {
              const el = e.target;
              if (el.value == "") {
                state.setNumPlayers(null);
              } else {
                state.setNumPlayers(parseInt(el.value));
              }
              const distEl = document.getElementById("distribution");
              distEl.innerHTML = "";
              distEl.insertAdjacentElement("beforeend", createDistributionHTML(state));
            }
          },
        },
        { type: "text", id: "numPlayers", name: "numPlayers" },
      )]),
    div("#distribution", createDistributionHTML(state)),
  ]);
}

function toggleCharacter(id: string, e: Event) {
  var sel = state.toggleSelected(id);
  if (e.currentTarget instanceof Element) {
    const classes = e.currentTarget.classList;
    if (sel) {
      classes.add("selected");
    } else {
      classes.remove("selected");
    }
  }
}

function createCharacterHTML(character: CharacterInfo): HTMLElement {
  var roleLabel = null;
  if (["outsider", "minion"].includes(character.roleType)) {
    roleLabel = span(".role-label", character.roleType.charAt(0).toUpperCase());
  }
  state.addCharacter(character);
  return div({
    className: classnames(character.evil ? "evil" : "good", "character"),
    onclick: (e: Event) => toggleCharacter(character.id, e),
  },
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

function createApp(script: Script): HTMLElement[] {
  return [
    createHeaderHTML(script.title),
    createPlayerSelectHTML(),
    createCharactersList(script.characters),
  ]
}

function loadScriptToDOM(script: Script) {
  document.title = `${script.title} roles sheet`;
  const app = document.getElementById("app");
  app.innerHTML = "";
  for (const el of createApp(script)) {
    app.insertAdjacentElement("beforeend", el);
  }
}

async function init() {
  let script = await selectedScript();
  loadScriptToDOM(new Script(script));
}

init();
