import allScripts from '../../assets/scripts.json';

import h from 'hyperscript';
import hh from 'hyperscript-helpers';
const { div, h1, h2, a, table, tbody, tr, td } = hh(h);

interface Script {
  id: string,
  title: string,
}

function createScriptTable(scripts: Script[]): HTMLElement {
  let rows = scripts.map(script => {
    return tr([
      td(".title-cell", script.title),
      td(".roles-cell",
        div(".btn", a({ href: `./roles.html?id=${script.id}` },
          ["Roles"]))),
      td(".nightsheet-cell",
        div(".btn", a({ href: `./nightsheet.html?id=${script.id}` },
          ["Night sheet"]))),
      td(".randomizer-cell",
        div(".btn", a({ href: `./randomize.html?id=${script.id}` },
          ["Select roles"]))),
    ]);
  });
  return table(tbody(rows));
}

function createScriptLists(scripts: Script[]): HTMLElement {
  const baseThree = scripts.filter(s => ["178", "180", "181"].includes(s.id));
  const custom = scripts.filter(s => !["178", "180", "181"].includes(s.id));
  return div([
    h2("Base 3"),
    createScriptTable(baseThree),
    h2("Custom"),
    createScriptTable(custom),
  ]);
}

function loadTableToDOM() {
  const el = document.getElementById("app");
  if (!el) { return; }
  el.innerHTML = "";
  el.insertAdjacentElement("beforeend", createScriptLists(allScripts.scripts));
}

loadTableToDOM();
