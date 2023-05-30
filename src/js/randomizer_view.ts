import { CharacterInfo } from './botc/roles';
import { Script } from './botc/script';

import { characterIconElement, htmlToElements } from './views';

import h from 'hyperscript';
import hh from 'hyperscript-helpers';
const { div, h1, strong, br, span, label, input, hr } = hh(h);

import classnames from 'classnames';
import { selectedScript } from './select_script';
import { Randomizer } from './randomizer_state';

function createHeaderHTML(title: string): HTMLElement {
  return h1(div(title));
}

var state = new Randomizer();

interface Distribution {
  townsfolk: number,
  outsider: number,
  minion: number,
  demon: number,
}

function distributionForCount(numPlayers: number): Distribution {
  const demon = 1;
  var outsider = null;
  var minion = null;
  if (numPlayers == 5 || numPlayers == 6) {
    outsider = numPlayers - 5;
    minion = 1;
  } else {
    outsider = (numPlayers - 7) % 3;
    minion = Math.floor((numPlayers - 7) / 3) + 1;
  }
  const townsfolk = numPlayers - outsider - minion - demon;
  return { townsfolk, outsider, minion, demon };
}

// TODO: better naming
function distributionHTML(dist: Distribution): HTMLElement {
  return span(
    [span(".good", dist.townsfolk.toString()),
      " / ",
    span(".good", dist.outsider.toString()),
      " / ",
    span(".evil", dist.minion.toString()),
      " / ",
    span(".evil", dist.demon.toString()),
    ]);
}

function createDistributionHTML(state: Randomizer): HTMLElement {
  if (state.getNumPlayers() == null) {
    return span("");
  }
  let dist = distributionForCount(state.getNumPlayers());
  return distributionHTML(dist);
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

function toggleCharacter(id: string): (Event) => void {
  return (e) => {
    var sel = state.toggleSelected(id);
    if (e.currentTarget instanceof Element) {
      const classes = e.currentTarget.classList;
      if (sel) {
        classes.add("selected");
      } else {
        classes.remove("selected");
      }
    }
    updateSelected();
  }
}

function createCharacterHTML(character: CharacterInfo, interactive: boolean): HTMLElement {
  var roleLabel = null;
  if (["outsider", "minion"].includes(character.roleType)) {
    roleLabel = span(".role-label", character.roleType.charAt(0).toUpperCase());
  }
  var onclick = interactive ? toggleCharacter(character.id) : null;
  return div({
    className: classnames(character.evil ? "evil" : "good", "character"),
    onclick,
  },
    [
      roleLabel,
      characterIconElement(character),
      span(".name", character.name),
    ])
}

function createCharacterColumns(characters: CharacterInfo[], numColumns: number): CharacterInfo[][] {
  const numPerColumn = Math.ceil(characters.length / numColumns);
  var columns = [];
  while (characters.length > 0) {
    let col = characters.splice(0, numPerColumn);
    columns.push(col);
  }
  return columns;
}

function createCharactersList(characters: CharacterInfo[]): HTMLElement {
  for (const character of characters) {
    state.addCharacter(character);
  }
  var cols = createCharacterColumns(characters, 3);
  return div(".characters", cols.map(col =>
    div(".column", col.map(character =>
      createCharacterHTML(character, true)
    )),
  ));
}

function createSelectedCharactersHTML(): HTMLElement {
  var selected = state.allSelected();
  selected.sort((i1, i2) => Math.random() - Math.random());
  var distribution: Distribution = { townsfolk: 0, outsider: 0, minion: 0, demon: 0 };
  for (const char of selected) {
    distribution[char.roleType]++;
  }
  const cols = createCharacterColumns(selected, 4);
  return div([
    distributionHTML(distribution),
    div(".selected-characters", cols.map(col =>
      div(".column", col.map(char =>
        createCharacterHTML(char, false)
      ))))
  ]);
}

function updateSelected() {
  const selected = document.getElementById("selected");
  selected.innerHTML = "";
  selected.insertAdjacentElement("beforeend", createSelectedCharactersHTML());
}

function createApp(script: Script): HTMLElement[] {
  return [
    createHeaderHTML(script.title),
    createPlayerSelectHTML(),
    createCharactersList(script.characters),
    hr(".separator"),
    div("#selected"),
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
