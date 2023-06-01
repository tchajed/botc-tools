import React, { useEffect, useReducer, useState } from 'react';
import {
  actualDistribution, distributionForCount, isTeensyville, zeroDistribution,
} from '../botc/setup';
import { CharacterInfo } from '../botc/roles';
import { Script } from '../botc/script';
import { selectionReducer, CharacterSelection } from './characters';
import { Distr, SetupModifiers } from './setup_help';
import { randomRanking, SelectedCharacters } from './bag';
import { CharacterContext } from './character_context';
import { parseState, serializeState } from './state';
import { FullscreenRole } from './role_fullscreen';

function BaseDistr({ numPlayers }: { numPlayers: number | "" }): JSX.Element {
  const dist = numPlayers == "" ? zeroDistribution() : distributionForCount(numPlayers);
  return <>
    <span className='label'>base: </span>
    <Distr dist={dist} />
  </>;
}

interface NumPlayerVar {
  numPlayers: number | "",
  setNumPlayers: (n: number | "") => void,
}

function NumPlayerSelector({ numPlayers, setNumPlayers }: NumPlayerVar): JSX.Element {
  function handleIncDec(delta: number): () => void {
    return () => {
      setNumPlayers(numPlayers ? (numPlayers + delta) : 5);
    };
  }

  return <div className='players'>
    <div>
      <label className='label' htmlFor='numPlayers'>players: </label>
      <button onClick={handleIncDec(-1)}>&#x2212;</button>
      <input value={numPlayers} readOnly={true}></input>
      <button onClick={handleIncDec(+1)}>+</button>
    </div>
    <div>
      <BaseDistr numPlayers={numPlayers} />
    </div>
  </div>;
}

/** Get the characters that should be initially selected.
 *
 * If the script has a lone demon, it is automatically added.
 */
function initialSelection(characters: CharacterInfo[]): Set<string> {
  var sel = new Set<string>();
  const totalDistribution = actualDistribution(characters);
  if (totalDistribution.demon == 1) {
    for (const c of characters) {
      if (c.roleType == "demon") { sel.add(c.id); }
    }
  }
  return sel;
}

function Randomizer({ script }: { script: Script }): JSX.Element {
  const { characters } = script;
  const [numPlayers, setNumPlayers] = useState<number | "">(
    isTeensyville(characters) ? 5 : 8,
  );
  const [ranking, setRanking] = useState(randomRanking(characters));
  const [selection, dispatch] = useReducer(selectionReducer, initialSelection(characters));
  const [fsRole, setFsRole] = useState<string | null>(null);

  useEffect(() => {
    const json = window.localStorage.getItem("state");
    if (!json) { return; }
    const s = parseState(json);
    if (!s) { return; }
    if (s.scriptTitle != script.title) {
      window.localStorage.removeItem("state");
      return;
    }
    setNumPlayers(s.numPlayers);
    setRanking(s.ranking);
    dispatch({ type: "set all", ids: s.selection });
  }, []);

  useEffect(() => {
    window.localStorage.setItem("state",
      serializeState({
        scriptTitle: script.title,
        numPlayers,
        ranking,
        selection: [...selection]
      }));
  }, [numPlayers, ranking, selection]);

  window.addEventListener("popstate", (ev) => {
    const state = ev.state;
    if (!state) { return; }
    if ("ranking" in state) {
      setRanking(state["ranking"]);
    }
    if ("selection" in state) {
      dispatch({ type: "set all", ids: state["selection"] });
    }
  });

  return <CharacterContext.Provider value={characters}>
    <div>
      <h1>{script.title}</h1>
      <NumPlayerSelector {...{ numPlayers, setNumPlayers }} />
      <SetupModifiers numPlayers={numPlayers || 5} selection={selection} />
      <CharacterSelection selection={selection} dispatch={dispatch} />
      <hr className="separator" />
      <SelectedCharacters {...{ selection, ranking, setRanking, dispatch, setFsRole }} />
      <FullscreenRole fsRole={fsRole} setFsRole={setFsRole} />
    </div>
  </CharacterContext.Provider>;
}

export function App(props: { script: Script }): JSX.Element {
  return <Randomizer {...props} />
}
