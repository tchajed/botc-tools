import { Script } from "./botc/script";
import { splitSelectedChars } from "./botc/setup";
import { Nav } from "./components/nav";
import { NightOrder } from "./nightsheet/night_order";
import { Randomizer } from "./randomizer/randomizer";
import {
  bluffsReducer,
  createSelectionReducer,
  initialSelection,
} from "./randomizer/selection";
import { CharacterSheet } from "./roles/character_sheet";
import { Page } from "./routing";
import { selectedScript } from "./select_script";
import { Global, ThemeProvider } from "@emotion/react";
import { getCharacter } from "botc/roles";
import { initStorage } from "randomizer/state";
import React, { useEffect, useReducer, useState } from "react";
import { createRoot } from "react-dom/client";
import { GlobalStyle } from "styles/global_style";
import { ScriptStyles } from "styles/script_styles";
import { theme } from "theme";

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

// Add a meta property=name tag to the head of the document.
function addMetaProperty(name: string, content: string) {
  document.querySelectorAll(`meta[property="${name}"]`).forEach((e) => {
    e.remove();
  });
  const meta = document.createElement("meta");
  meta.setAttribute("property", name);
  meta.content = content;
  document.head.appendChild(meta);
}

function ScriptApp({ script }: { script: Script }): JSX.Element {
  const [currentPage, setCurrentPage] = useState<Page>(getUrlPage() || "roles");
  const characters = script.characters;

  // mostly randomizer state (but influences night sheet)
  const [numPlayers, setNumPlayers] = useState<number>(
    script.teensyville ? 5 : 8,
  );
  const [selection, selDispatch] = useReducer(
    createSelectionReducer(characters),
    initialSelection(characters),
  );
  const [bluffs, bluffsDispatch] = useReducer(bluffsReducer, new Set<string>());

  const bluffList = [...bluffs.values()].map((id) => getCharacter(id));
  bluffList.sort((c1, c2) => c1.name.localeCompare(c2.name));

  const { bag } = splitSelectedChars(characters, selection, numPlayers);
  const teensy = 5 <= numPlayers && numPlayers <= 6;
  const completeSetup = bag.length == numPlayers;
  // heuristic for whether any attempt has been made to set roles:
  // if this is false, the toggle button isn't even shown
  const anySetup = bag.length >= 4;

  useEffect(() => {
    window.history.scrollRestoration = "manual";
  }, []);

  useEffect(() => {
    switch (currentPage) {
      case "roles": {
        document.title = `${script.title} - roles - BotC tools`;
        addMetaProperty("og:title", `${script.title} - roles`);
        addMetaProperty(
          "og:url",
          `${document.location.origin}/scripts.html?id=${script.id}`,
        );
        document.querySelector(`meta[name="description"]`)?.remove();
        break;
      }
      case "night":
        document.title = `${script.title} - night order - BotC tools`;
        addMetaProperty("og:title", `${script.title} - night order`);
        addMetaProperty(
          "og:url",
          `${document.location.origin}/scripts.html?id=${script.id}&page=night`,
        );
        document.querySelector(`meta[name="description"]`)?.remove();
        break;
      case "assign":
        document.title = `${script.title} - assign roles - BotC tools`;
        addMetaProperty("og:title", `${script.title} - assign roles`);
        addMetaProperty(
          "og:url",
          `${document.location.origin}/scripts.html?id=${script.id}&page=assign`,
        );
        document.querySelector(`meta[name="description"]`)?.remove();
        break;
    }
  }, [currentPage]);

  return (
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <div>
          <Global styles={[GlobalStyle, ScriptStyles]} />
          <Nav
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            scriptId={script.id}
          />
          <div className="main">
            <CharacterSheet
              active={currentPage == "roles"}
              script={script}
              completeSetup={completeSetup}
            />
            <NightOrder
              active={currentPage == "night"}
              script={script}
              selection={selection}
              bluffs={bluffList}
              teensy={teensy}
              validSetup={completeSetup}
              anySetup={anySetup}
            />
            <Randomizer
              active={currentPage == "assign"}
              script={script}
              selection={selection}
              selDispatch={selDispatch}
              bluffs={bluffs}
              bluffsDispatch={bluffsDispatch}
              numPlayers={numPlayers}
              setNumPlayers={setNumPlayers}
            />
          </div>
        </div>
      </ThemeProvider>
    </React.StrictMode>
  );
}

async function init() {
  initStorage();
  const script = new Script(await selectedScript());
  const app = document.getElementById("app");
  if (!app) {
    return;
  }
  const root = createRoot(app);
  root.render(<ScriptApp script={script} />);
}

init();
