import { CharacterContext } from "./character_context";
import { SelectedCharacters, sortBag } from "./components/bag";
import { BluffsToggleBtn } from "./components/bluffs";
import { CharacterSelection } from "./components/characters";
import { PlayerNameInput } from "./components/player_names";
import { RandomSetupButton } from "./components/random_setup_btn";
import { SetupModifiers } from "./components/setup_help";
import { History, restoreState } from "./history";
import { randomRanking } from "./ranking";
import { Selection, SelAction, CharacterSelectionVars } from "./selection";
import {
  ScriptState,
  initStorage,
  loadGlobalState,
  loadState,
  storeGlobalState,
  storeState,
} from "./state";
import { CharacterInfo, getCharacter } from "botc/roles";
import { Script } from "botc/script";
import {
  effectiveDistribution,
  modifyingCharacters,
  roleTypesDefinitelyDone,
  splitSelectedChars,
  targetDistributions,
} from "botc/setup";
import { NumPlayerSelector } from "components/num_players";
import { FullscreenRole } from "components/role_fullscreen";
import { TownsquareImage } from "randomizer/tokens/townsquare_canvas";
import React, { SetStateAction, useEffect, useState } from "react";
import { restoreScroll } from "routing";
import { visibleClass } from "tabs";

export function Randomizer({
  script,
  active,
  selection,
  selDispatch,
  bluffs,
  bluffsDispatch,
  numPlayers,
  setNumPlayers,
}: {
  script: Script;
  active: boolean;
  selection: Selection;
  selDispatch: React.Dispatch<SelAction>;
  bluffs: Selection;
  bluffsDispatch: React.Dispatch<SelAction>;
  numPlayers: number;
  setNumPlayers: React.Dispatch<SetStateAction<number>>;
}): JSX.Element {
  const { characters } = script;
  const [ranking, setRanking] = useState(randomRanking(characters));
  const [fsRole, setFsRole] = useState<string | null>(null);
  const [history, setHistory] = useState({ back: [], forward: [] } as History<
    Partial<ScriptState>
  >);
  const [selectBluffs, setSelectBluffs] = useState(false);
  const [players, setPlayers] = useState<string[]>([]);

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
      bluffsDispatch({ type: "set all", ids: s.bluffs });
    });
    loadGlobalState().then((s) => {
      setPlayers(s.players);
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
      bluffs,
    });
  }, [numPlayers, ranking, selection, bluffs]);
  useEffect(() => {
    storeGlobalState({ players });
  }, [players]);

  useEffect(() => {
    window.history.scrollRestoration = "manual";
  }, []);

  const popState = (ev: PopStateEvent) => {
    const state: Partial<ScriptState> = ev.state;
    if (state) {
      restoreState(setRanking, selDispatch, bluffsDispatch, state);
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
    characters,
  );
  const selectedCharInfo: CharacterInfo[] = [...selection].map((id) =>
    getCharacter(id),
  );
  const actual = effectiveDistribution(numPlayers, selectedCharInfo);
  const rolesNotNeeded = roleTypesDefinitelyDone(targetDists, actual);

  const { bag, outsideBag } = splitSelectedChars(
    characters,
    selection,
    numPlayers,
  );
  sortBag(bag, ranking);

  const selectionVars: CharacterSelectionVars = {
    selection: {
      chars: selection,
      dispatch: selDispatch,
    },
    bluffs: {
      chars: bluffs,
      dispatch: bluffsDispatch,
    },
  };

  const bluffList = [...bluffs.values()].map((id) => getCharacter(id));
  bluffList.sort((c1, c2) => c1.name.localeCompare(c2.name));

  return (
    <CharacterContext.Provider value={characters}>
      <div className={visibleClass(active)}>
        <h1>{script.title}</h1>
        <NumPlayerSelector
          teenysville={script.teensyville}
          {...{ numPlayers, setNumPlayers }}
        />
        <SetupModifiers numPlayers={numPlayers} selection={selection} />
        <div className="columns">
          <div className="column">
            <RandomSetupButton
              {...{
                numPlayers,
                selection,
                selDispatch,
                bluffs,
                bluffsDispatch,
                history,
                setHistory,
              }}
            />
          </div>
          <div className="column">
            <BluffsToggleBtn {...{ selectBluffs, setSelectBluffs }} />
          </div>
        </div>
        <CharacterSelection
          {...selectionVars}
          selectBluffs={selectBluffs}
          doneRoles={rolesNotNeeded}
        />
        <hr className="separator" />
        <SelectedCharacters
          {...selectionVars}
          {...{
            ranking,
            numPlayers,
            setRanking,
            setFsRole,
            history,
            setHistory,
          }}
        />
        {bag.length == numPlayers && (
          <TownsquareImage
            title={script.title}
            bag={bag}
            players={players}
            outsideBag={outsideBag}
            bluffs={bluffList}
          />
        )}
        <PlayerNameInput {...{ numPlayers, players, setPlayers }} />
        <FullscreenRole fsRole={fsRole} setFsRole={setFsRole} />
      </div>
    </CharacterContext.Provider>
  );
}
