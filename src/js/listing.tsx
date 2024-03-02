import { getScripts } from "./get_scripts";
import { App } from "./listing/app";
import { initStorage } from "randomizer/state";
import React from "react";
import { createRoot } from "react-dom/client";

async function init() {
  const app = document.getElementById("app");
  if (!app) {
    return;
  }

  initStorage();

  const scriptsFile = await getScripts();

  const root = createRoot(app);
  root.render(
    <React.StrictMode>
      <App scriptsFile={scriptsFile} />
    </React.StrictMode>,
  );
}

init();
