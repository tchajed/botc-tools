import React from 'react';
import { createRoot } from 'react-dom/client';
import { Script } from './botc/script';
import { selectedScript } from './select_script';
import { App } from './randomizer/components';

async function init() {
  let script = new Script(await selectedScript());
  document.title = `${script.title} role select`;
  const app = document.getElementById("app");
  if (!app) { return; }
  const root = createRoot(app);
  root.render(<App script={script} />);
}

init();
