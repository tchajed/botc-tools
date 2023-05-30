import { CharacterInfo } from './botc/roles';
import { Script } from './botc/script';

import { characterIconElement, htmlToElements } from './views';

import h from 'hyperscript';
import hh from 'hyperscript-helpers';
const { div, h1, strong, br, span, label, input, hr, button } = hh(h);

import classnames from 'classnames';
import { selectedScript } from './select_script';
import { Randomizer } from './randomizer_state';
import { Distribution, distributionForCount, zeroDistribution } from './botc/setup';

function createHeaderHTML(title: string): HTMLElement {
  return h1(div(title));
}

var state = new Randomizer();

// TODO: better naming
function distributionHTML(dist: Distribution): HTMLElement {
  return span(".distribution",
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
  const numPlayers = state.getNumPlayers();
  const dist = numPlayers == null ? zeroDistribution() : distributionForCount(numPlayers);
  return span([
    span(".label", "base: "),
    distributionHTML(dist),
  ]);
}

function onNumPlayerUpdate(numPlayers: string) {
  if (numPlayers == "") {
    state.setNumPlayers(null);
  } else {
    state.setNumPlayers(parseInt(numPlayers));
  }
  updateBaseDistribution();
}

function updateBaseDistribution() {
  const distEl = document.getElementById("distribution");
  if (!distEl) { return; }
  distEl.innerHTML = "";
  distEl.insertAdjacentElement("beforeend", createDistributionHTML(state));
}

function updatePlayerInput() {
  const el = document.getElementById("numPlayers");
  if (el instanceof HTMLInputElement) {
    let numPlayers = state.getNumPlayers();
    el.value = numPlayers == null ? "" : numPlayers.toString();
    updateBaseDistribution();
  }
}

function incdecButtonEvent(change: number): (Event) => void {
  return (e) => {
    const numPlayers = state.getNumPlayers();
    if (numPlayers == null) {
      state.setNumPlayers(5);
    } else {
      state.setNumPlayers(numPlayers + change);
    }
    updatePlayerInput();
    return true;
  };
}

function createPlayerSelectHTML(): HTMLElement {
  state.setNumPlayers(8);
  return div("#players", [
    div(
      [label(".label", { for: "numPlayers" }, "players: "),
      button({ onclick: incdecButtonEvent(-1) }, "-"),
      input(
        {
          value: state.getNumPlayers(),
          oninput: (e: Event) => {
            if (e.target instanceof HTMLInputElement) {
              onNumPlayerUpdate(e.target.value);
              return true;
            }
          },
        },
        { type: "text", id: "numPlayers", name: "numPlayers" },
      ),
      button({ onclick: incdecButtonEvent(+1) }, "+"),
      ]),
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
  var columns: CharacterInfo[][] = [];
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
  function characterColumnsHTML(characters: CharacterInfo[], numColumns: number): HTMLElement {
    var cols = createCharacterColumns(characters, numColumns);
    return div(".characters", cols.map(col =>
      div(".column", col.map(character =>
        createCharacterHTML(character, true)
      )),
    ));
  }
  return div([
    characterColumnsHTML(characters.filter(c => c.good), 2),
    characterColumnsHTML(characters.filter(c => !c.good), 2),
  ]);
}

function createSelectedCharactersHTML(): HTMLElement {
  var selected = state.allSelected();
  selected.sort((i1, i2) => Math.random() - Math.random());
  var distribution = zeroDistribution();
  for (const char of selected) {
    distribution[char.roleType]++;
  }
  const cols = createCharacterColumns(selected, 1);
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
  if (!selected) { return; }
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
  document.title = `${script.title} role select`;
  const app = document.getElementById("app");
  if (!app) { return; }
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
