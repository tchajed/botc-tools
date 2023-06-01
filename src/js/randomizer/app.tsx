import React, { useEffect, useReducer, useState } from 'react';
import {
  actualDistribution, distributionForCount, goesInBag, zeroDistribution
} from '../botc/setup';
import { CharacterInfo } from '../botc/roles';
import { Script } from '../botc/script';
import { selectionReducer, CharacterSelection } from './characters';
import { Distr, SetupModifiers } from './setup_help';
import { randomRanking, Ranking, SelectedCharacters } from './bag';
import { CharacterContext } from './character_context';
import { parseState, serializeState } from './state';

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
  const [numPlayers, setNumPlayers] = useState<number | "">(8);
  const [ranking, setRanking] = useState(randomRanking(characters));
  const [selection, dispatch] = useReducer(selectionReducer, initialSelection(characters));

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
    s.selection.forEach(id => {
      dispatch({ "type": "set", "id": id });
    });
  }, []);

  useEffect(() => {
    window.localStorage.setItem("state",
      serializeState({
        scriptTitle: script.title,
        numPlayers, ranking, selection
      }));
  }, [numPlayers, ranking, selection]);

  return <CharacterContext.Provider value={characters}>
    <div>
      <h1>{script.title}</h1>
      <NumPlayerSelector {...{ numPlayers, setNumPlayers }} />
      <SetupModifiers numPlayers={numPlayers || 5} selection={selection} />
      <CharacterSelection selection={selection} dispatch={dispatch} />
      <hr className="separator" />
      <SelectedCharacters {...{ selection, ranking, setRanking, dispatch }} />
    </div>
  </CharacterContext.Provider>;
}

export function App(props: { script: Script }): JSX.Element {
  return <Randomizer {...props} />
}
