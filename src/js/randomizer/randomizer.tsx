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
import { CharacterSelection } from "./characters";
import { History } from "./history";
import { RandomSetupButton } from "./random_setup_btn";
import { Selection, SelAction, bluffsReducer } from "./selection";
import { SetupModifiers } from "./setup_help";
import { State, initStorage, loadState, storeState } from "./state";
import { TownsquareImage } from "./tokens/townsquare_canvas";
import classnames from "classnames";
import React, {
  ChangeEvent,
  SetStateAction,
  useEffect,
  useReducer,
  useState,
} from "react";

function BluffsToggleBtn(props: {
  selectBluffs: boolean;
  setSelectBluffs: (b: boolean) => void;
}): JSX.Element {
  const { selectBluffs } = props;
  function onChange(e: ChangeEvent<HTMLInputElement>) {
    props.setSelectBluffs(e.target.checked);
  }
  return (
    <label
      className={classnames("bluffs-toggle", selectBluffs ? "selected" : "")}
    >
      choose bluffs
      <input type="checkbox" checked={selectBluffs} onChange={onChange} />
    </label>
  );
}

export function Randomizer({
  script,
  active,
  selection,
  selDispatch,
  numPlayers,
  setNumPlayers,
}: {
  script: Script;
  active: boolean;
  selection: Selection;
  selDispatch: React.Dispatch<SelAction>;
  numPlayers: number;
  setNumPlayers: React.Dispatch<SetStateAction<number>>;
}): JSX.Element {
  const { characters } = script;
  const [ranking, setRanking] = useState(randomRanking(characters));
  const [fsRole, setFsRole] = useState<string | null>(null);
  const [history, setHistory] = useState({ back: [], forward: [] } as History<
    Partial<State>
  >);
  const [selectBluffs, setSelectBluffs] = useState(false);
  const [bluffs, bluffsDispatch] = useReducer(bluffsReducer, new Set<string>());

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
        <div className="columns">
          <div className="column">
            <RandomSetupButton
              {...{ numPlayers, selection, selDispatch, history, setHistory }}
            />
          </div>
          <div className="column">
            <BluffsToggleBtn {...{ selectBluffs, setSelectBluffs }} />
          </div>
        </div>
        <CharacterSelection
          selection={selection}
          selDispatch={selDispatch}
          selectBluffs={selectBluffs}
          bluffs={bluffs}
          bluffsDispatch={bluffsDispatch}
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
        {bag.length == numPlayers && (
          <TownsquareImage title={script.title} bag={bag} />
        )}
        <FullscreenRole fsRole={fsRole} setFsRole={setFsRole} />
      </div>
    </CharacterContext.Provider>
  );
}
