import React, { useEffect, useReducer, useState } from 'react';
import {
  actualDistribution, distributionForCount, isTeensyville, zeroDistribution,
} from '../botc/setup';
import { CharacterInfo } from '../botc/roles';
import { Script } from '../botc/script';
import { createSelectionReducer, CharacterSelection, initialSelection } from './characters';
import { Distr, SetupModifiers } from './setup_help';
import { randomRanking, SelectedCharacters } from './bag';
import { CharacterContext } from './character_context';
import { parseState, serializeState } from './state';
import { FullscreenRole } from './role_fullscreen';
import { create } from 'axios';

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
      <input id="numPlayers" value={numPlayers} readOnly={true}></input>
      <button onClick={handleIncDec(+1)}>+</button>
    </div>
    <div>
      <BaseDistr numPlayers={numPlayers} />
    </div>
  </div>;
}

function Randomizer({ script }: { script: Script }): JSX.Element {
  const { characters } = script;
  const [numPlayers, setNumPlayers] = useState<number | "">(
    isTeensyville(characters) ? 5 : 8,
  );
  const [ranking, setRanking] = useState(randomRanking(characters));
  const [selection, dispatch] = useReducer(
    createSelectionReducer(characters),
    initialSelection(characters));
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

  window.addEventListener("hashchange", () => {
    // without some action the page won't change, even though the selected
    // script has changed
    //
    // reloading dynamically is a little hard and not worth it
    window.location.reload();
  })

  return <CharacterContext.Provider value={characters}>
    <div>
      <h1>{script.title}</h1>
      <NumPlayerSelector {...{ numPlayers, setNumPlayers }} />
      <SetupModifiers numPlayers={numPlayers || 5} selection={selection} />
      <CharacterSelection selection={selection} dispatch={dispatch} />
      <hr className="separator" />
      <SelectedCharacters {...{
        selection, ranking, numPlayers,
        setRanking, dispatch, setFsRole
      }} />
      <FullscreenRole fsRole={fsRole} setFsRole={setFsRole} />
    </div>
  </CharacterContext.Provider>;
}

export function App(props: { script: Script }): JSX.Element {
  return <Randomizer {...props} />
}
