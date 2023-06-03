import React, { Dispatch, SetStateAction, useEffect, useReducer, useState } from 'react';
import {
  distributionForCount, isTeensyville, zeroDistribution,
} from '../botc/setup';
import { Script } from '../botc/script';
import { createSelectionReducer, CharacterSelection, initialSelection } from './characters';
import { Distr, SetupModifiers } from './setup_help';
import { randomRanking, SelectedCharacters } from './bag';
import { CharacterContext } from './character_context';
import { State, loadState, storeState } from './state';
import { FullscreenRole } from './role_fullscreen';
import { History } from './history';

function BaseDistr({ numPlayers }: { numPlayers: number }): JSX.Element {
  const dist = (5 <= numPlayers && numPlayers <= 15) ?
    distributionForCount(numPlayers) : zeroDistribution();
  return <>
    <span className='label'>base: </span>
    <Distr dist={dist} />
  </>;
}

interface NumPlayerVar {
  numPlayers: number,
  setNumPlayers: Dispatch<SetStateAction<number>>,
}

function NumPlayerSelector(props: NumPlayerVar & { teenysville: boolean }): JSX.Element {
  const { numPlayers } = props;
  function handleIncDec(delta: number): () => void {
    return () => {
      props.setNumPlayers(n => n + delta);
    };
  }

  const maxPlayers = props.teenysville ? 6 : 15;

  return <div className='players'>
    <div>
      <label className='label' htmlFor='numPlayers'>players: </label>
      <button disabled={numPlayers <= 5} onClick={handleIncDec(-1)}>&#x2212;</button>
      <input id="numPlayers" value={numPlayers} readOnly={true}></input>
      <button disabled={numPlayers >= maxPlayers} onClick={handleIncDec(+1)}>+</button>
    </div>
    <div>
      <BaseDistr numPlayers={numPlayers} />
    </div>
  </div>;
}

function Randomizer({ script }: { script: Script }): JSX.Element {
  const { characters } = script;
  const [numPlayers, setNumPlayers] = useState<number>(
    isTeensyville(characters) ? 5 : 8,
  );
  const [ranking, setRanking] = useState(randomRanking(characters));
  const [selection, selDispatch] = useReducer(
    createSelectionReducer(characters),
    initialSelection(characters));
  const [fsRole, setFsRole] = useState<string | null>(null);
  const [history, setHistory] = useState({ back: [], forward: [] } as History<Partial<State>>);

  // load state from local storage
  useEffect(() => {
    const s = loadState(script.title);
    if (!s) { return; }
    setNumPlayers(s.numPlayers);
    setRanking(s.ranking);
    selDispatch({ type: "set all", ids: s.selection });
  }, []);

  // keep local storage up-to-date
  useEffect(() => {
    storeState({ scriptTitle: script.title, numPlayers, ranking, selection });
  }, [numPlayers, ranking, selection]);

  useEffect(() => {
    window.history.scrollRestoration = 'manual';
  }, []);

  // register all of our event listeners
  useEffect(() => {
    window.addEventListener("popstate", (ev) => {
      const state: Partial<State> = ev.state;
      if (!state) { return; }
      if (state.ranking !== undefined) {
        setRanking(state.ranking);
      }
      if (state.selection !== undefined) {
        selDispatch({ type: "set all", ids: state.selection });
      }
    });

    window.addEventListener("hashchange", () => {
      // without some action the page won't change, even though the selected
      // script has changed
      //
      // reloading dynamically is a little hard and not worth it
      window.location.reload();
    });

    // note: this was supposed to reset zoom in landscape mode, but it doesn't
    // actually work
    window.addEventListener("orientationchange", () => {
      if ("orientation" in window.screen) {
        if (window.screen.orientation.type.startsWith("landscape")) {
          const viewportmeta = document.querySelector('meta[name=viewport]');
          if (viewportmeta) {
            viewportmeta.setAttribute('content',
              "width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=0");
          }
        }
      }
    });
  }, []);

  return <CharacterContext.Provider value={characters}>
    <div>
      <h1>{script.title}</h1>
      <NumPlayerSelector teenysville={isTeensyville(characters)} {...{ numPlayers, setNumPlayers }} />
      <SetupModifiers numPlayers={numPlayers} selection={selection} />
      <CharacterSelection selection={selection} selDispatch={selDispatch} />
      <hr className="separator" />
      <SelectedCharacters {...{
        selection, ranking, numPlayers,
        setRanking, selDispatch, setFsRole,
        history, setHistory,
      }} />
      <FullscreenRole fsRole={fsRole} setFsRole={setFsRole} />
    </div>
  </CharacterContext.Provider>;
}

export function App(props: { script: Script }): JSX.Element {
  return <Randomizer {...props} />
}
