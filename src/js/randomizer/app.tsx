import React, { useEffect, useReducer, useState } from "react";
import { Script } from "../botc/script";
import {
  createSelectionReducer,
  CharacterSelection,
  initialSelection,
} from "./characters";
import { SetupModifiers } from "./setup_help";
import { randomRanking, SelectedCharacters, sortBag } from "./bag";
import { CharacterContext } from "./character_context";
import { State, initStorage, loadState, storeState } from "./state";
import { FullscreenRole } from "./role_fullscreen";
import { History } from "./history";
import { Nav } from "./nav";
import { NumPlayerSelector } from "./num_players";
import {
  effectiveDistribution,
  modifyingCharacters,
  roleTypesDefinitelyDone,
  splitSelectedChars,
  targetDistributions,
} from "../botc/setup";
import { CharacterInfo, getCharacter } from "../botc/roles";
import { TownsquareImage } from "./tokens/townsquare";

function Randomizer({ script }: { script: Script }): JSX.Element {
  const { characters } = script;
  const [numPlayers, setNumPlayers] = useState<number>(
    script.teensyville ? 5 : 8
  );
  const [ranking, setRanking] = useState(randomRanking(characters));
  const [selection, selDispatch] = useReducer(
    createSelectionReducer(characters),
    initialSelection(characters)
  );
  const [fsRole, setFsRole] = useState<string | null>(null);
  const [history, setHistory] = useState({ back: [], forward: [] } as History<
    Partial<State>
  >);

  // load state from local storage
  useEffect(() => {
    initStorage();
    loadState(script.id).then((s) => {
      if (!s) {
        return;
      }
      setNumPlayers(s.numPlayers);
      setRanking(s.ranking);
      selDispatch({ type: "set all", ids: s.selection });
    });
  }, []);

  // keep local storage up-to-date
  useEffect(() => {
    storeState(script.id, {
      scriptTitle: script.title,
      numPlayers,
      ranking,
      selection,
    });
  }, [numPlayers, ranking, selection]);

  useEffect(() => {
    window.history.scrollRestoration = "manual";
  }, []);

  // register all of our event listeners
  useEffect(() => {
    // TODO: this needs to be disabled if the randomizer is not the current page
    window.addEventListener("popstate", (ev) => {
      const state: Partial<State> = ev.state;
      if (!state) {
        return;
      }
      if (state.ranking !== undefined) {
        setRanking(state.ranking);
      }
      if (state.selection !== undefined) {
        selDispatch({ type: "set all", ids: state.selection });
      }
    });

    // note: this was supposed to reset zoom in landscape mode, but it doesn't
    // actually work
    window.addEventListener("orientationchange", () => {
      if ("orientation" in window.screen) {
        if (window.screen.orientation.type.startsWith("landscape")) {
          const viewportmeta = document.querySelector("meta[name=viewport]");
          if (viewportmeta) {
            viewportmeta.setAttribute(
              "content",
              "width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=0"
            );
          }
        }
      }
    });
  }, []);

  const targetDists = targetDistributions(
    numPlayers,
    modifyingCharacters(selection),
    characters
  );
  const selectedCharInfo: CharacterInfo[] = [...selection].map((id) =>
    getCharacter(id)
  );
  const actual = effectiveDistribution(numPlayers, selectedCharInfo);
  const rolesNotNeeded = roleTypesDefinitelyDone(targetDists, actual);

  const { bag } = splitSelectedChars(characters, selection, numPlayers);
  sortBag(bag, ranking);

  return (
    <CharacterContext.Provider value={characters}>
      <h1>{script.title}</h1>
      <NumPlayerSelector
        teenysville={script.teensyville}
        {...{ numPlayers, setNumPlayers }}
      />
      <SetupModifiers numPlayers={numPlayers} selection={selection} />
      <CharacterSelection
        selection={selection}
        selDispatch={selDispatch}
        doneRoles={rolesNotNeeded}
      />
      <hr className="separator" />
      <SelectedCharacters
        {...{
          selection,
          ranking,
          numPlayers,
          setRanking,
          selDispatch,
          setFsRole,
          history,
          setHistory,
        }}
      />
      {bag.length == numPlayers && <TownsquareImage bag={bag} />}
      <FullscreenRole fsRole={fsRole} setFsRole={setFsRole} />
    </CharacterContext.Provider>
  );
}

export function App(props: { script: Script }): JSX.Element {
  return (
    <div>
      <Nav scriptId={props.script.id} />
      <div className="main"></div>
      <Randomizer {...props} />
    </div>
  );
}
