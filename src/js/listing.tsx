import { getScripts } from "./get_scripts";
import { App } from "./listing/app";
import React from "react";
import { createRoot } from "react-dom/client";

async function init() {
  const app = document.getElementById("app");
  if (!app) {
    return;
  }

  const scripts = await getScripts();

  const root = createRoot(app);
  root.render(
    <React.StrictMode>
      <App scripts={scripts} />
    </React.StrictMode>,
  );
}

init();
