import { Script } from "./botc/script";
import { Nav } from "./components/nav";
import { NightOrder } from "./nightsheet/night_order";
import { Randomizer } from "./randomizer/randomizer";
import { CharacterSheet } from "./roles/character_sheet";
import { Page } from "./routing";
import { selectedScript } from "./select_script";
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

function getUrlPage(): Page | null {
  const params = new URLSearchParams(window.location.search);
  const page = params.get("page");
  if (
    page !== undefined &&
    (page == "roles" || page == "nightsheet" || page == "randomize")
  ) {
    return page;
  }
  return null;
}

function ScriptApp({ script }: { script: Script }): JSX.Element {
  const [currentPage, setCurrentPage] = useState<Page>(getUrlPage() || "roles");

  useEffect(() => {
    switch (currentPage) {
      case "roles":
        document.title = `${script.title} - roles`;
        break;
      case "nightsheet":
        document.title = `${script.title} - night order`;
        break;
      case "randomize":
        document.title = `${script.title} - assign roles`;
        break;
    }
  }, [currentPage]);

  return (
    <React.StrictMode>
      <div>
        <Nav
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          scriptId={script.id}
        />
        <div className="main">
          <CharacterSheet
            active={currentPage == "roles"}
            script={script}
            key="roles"
          />
          <NightOrder
            active={currentPage == "nightsheet"}
            script={script}
            key="nightsheet"
          />
          <Randomizer
            active={currentPage == "randomize"}
            script={script}
            key="randomize"
          />
        </div>
      </div>
    </React.StrictMode>
  );
}

async function init() {
  const script = new Script(await selectedScript());
  const app = document.getElementById("app");
  if (!app) {
    return;
  }
  const root = createRoot(app);
  root.render(<ScriptApp script={script} />);
}

init();
