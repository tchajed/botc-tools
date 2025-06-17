import { getScripts } from "./get_scripts";
import { App } from "./listing/app";
import React from "react";
import { createRoot } from "react-dom/client";
import { getScriptById } from "select_script";
import { getRecentScripts, initStorage } from "state";

const MAX_RECENT_SCRIPTS = 5;

async function init() {
  const app = document.getElementById("app");
  if (!app) {
    return;
  }

  initStorage();

  const scriptsFile = await getScripts();
  const recents = (await getRecentScripts()).slice(0, MAX_RECENT_SCRIPTS);
  const recentScripts = await Promise.all(
    recents.map((s) => {
      return getScriptById(scriptsFile, s.id);
    }),
  );

  const root = createRoot(app);
  root.render(
    <React.StrictMode>
      <App scriptsFile={scriptsFile} recents={recentScripts} />
    </React.StrictMode>,
  );
}

init();
