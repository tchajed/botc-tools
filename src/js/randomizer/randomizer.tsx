import { CharacterInfo, getCharacter } from "../botc/roles";
import { Script } from "../botc/script";
import {
  effectiveDistribution,
  modifyingCharacters,
  roleTypesDefinitelyDone,
  splitSelectedChars,
  targetDistributions,
} from "../botc/setup";
import { NumPlayerSelector } from "../components/num_players";
import { FullscreenRole } from "../components/role_fullscreen";
import { restoreScroll } from "../routing";
import { visibleClass } from "../tabs";
import { randomRanking, SelectedCharacters, sortBag } from "./bag";
import { CharacterContext } from "./character_context";
import {
  createSelectionReducer,
  CharacterSelection,
  initialSelection,
} from "./characters";
import { History } from "./history";
import { SetupModifiers } from "./setup_help";
import { State, initStorage, loadState, storeState } from "./state";
import { TownsquareImage } from "./tokens/townsquare";
import React, { useEffect, useReducer, useState } from "react";

export function Randomizer({
  script,
  active,
}: {
  script: Script;
  active: boolean;
}): JSX.Element {
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

  useEffect(() => {
    if (active) {
      restoreScroll("assign");
    }
  }, [active]);

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

  const popState = (ev: PopStateEvent) => {
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
  };

  // register all of our event listeners
  useEffect(() => {
    window.addEventListener("popstate", popState);

    // cleanup function
    return () => {
      window.removeEventListener("popstate", popState);
    };
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
      <div className={visibleClass(active)}>
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
      </div>
    </CharacterContext.Provider>
  );
}
