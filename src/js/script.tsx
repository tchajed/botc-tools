import { Script } from "./botc/script";
import { splitSelectedChars } from "./botc/setup";
import { Nav } from "./components/nav";
import { NightOrder } from "./nightsheet/night_order";
import { Randomizer } from "./randomizer/randomizer";
import {
  createSelectionReducer,
  initialSelection,
} from "./randomizer/selection";
import { CharacterSheet } from "./roles/character_sheet";
import { Page } from "./routing";
import { selectedScript } from "./select_script";
import React, { useEffect, useReducer, useState } from "react";
import { createRoot } from "react-dom/client";

function getUrlPage(): Page | null {
  const params = new URLSearchParams(window.location.search);
  const page = params.get("page");
  if (
    page !== undefined &&
    (page == "roles" || page == "night" || page == "assign")
  ) {
    return page;
  }
  return null;
}

function ScriptApp({ script }: { script: Script }): JSX.Element {
  const [currentPage, setCurrentPage] = useState<Page>(getUrlPage() || "roles");
  const characters = script.characters;

  // mostly randomizer state (but influences night sheet)
  const [numPlayers, setNumPlayers] = useState<number>(
    script.teensyville ? 5 : 8
  );
  const [selection, selDispatch] = useReducer(
    createSelectionReducer(characters),
    initialSelection(characters)
  );

  const { bag } = splitSelectedChars(characters, selection, numPlayers);
  const validSetup = bag.length == numPlayers;
  // heuristic for whether any attempt has been made to set roles:
  // if this is false, the toggle button isn't even shown
  const anySetup = bag.length >= 4;

  useEffect(() => {
    window.history.scrollRestoration = "manual";
  }, []);

  useEffect(() => {
    switch (currentPage) {
      case "roles":
        document.title = `${script.title} - roles`;
        break;
      case "night":
        document.title = `${script.title} - night order`;
        break;
      case "assign":
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
            active={currentPage == "night"}
            script={script}
            selection={selection}
            validSetup={validSetup}
            anySetup={anySetup}
            key="night"
          />
          <Randomizer
            active={currentPage == "assign"}
            script={script}
            selection={selection}
            selDispatch={selDispatch}
            numPlayers={numPlayers}
            setNumPlayers={setNumPlayers}
            key="assign"
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
