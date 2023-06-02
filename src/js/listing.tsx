import allScripts from '../../assets/scripts.json';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './listing/app';

function init() {
  const app = document.getElementById("app");
  if (!app) { return; }
  const root = createRoot(app);
  root.render(<App scripts={allScripts.scripts} />);
}

init();
