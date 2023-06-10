import { Script } from "./botc/script";
import { App } from "./randomizer/app";
import { selectedScript } from "./select_script";
import React from "react";
import { createRoot } from "react-dom/client";

async function init() {
  const script = new Script(await selectedScript());
  document.title = `${script.title} role select`;
  const app = document.getElementById("app");
  if (!app) {
    return;
  }
  const root = createRoot(app);
  root.render(<App script={script} />);
}

init();
