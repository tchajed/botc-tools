import { scripts } from '../../assets/scripts.json';

import h from 'hyperscript';
import hh from 'hyperscript-helpers';
const { div, h1, a, table, tbody, tr, td } = hh(h);

function createScriptTable(): HTMLElement {
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

function loadTableToDOM() {
  const el = document.getElementById("app");
  el.innerHTML = "";
  el.insertAdjacentElement("beforeend", createScriptTable());
}

loadTableToDOM();
