import { Script } from './botc/script';
import { selectedScript } from './select_script';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './nightsheet/app';

async function init() {
  const script = new Script(await selectedScript());
  document.title = `${script.title} night sheets`;
  const app = document.getElementById("app");
  if (!app) { return; }
  const root = createRoot(app);
  root.render(<App script={script} />);
}

init();
