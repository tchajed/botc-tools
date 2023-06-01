import React, { useReducer, useState } from 'react';
import {
  actualDistribution, distributionForCount, goesInBag, zeroDistribution
} from '../botc/setup';
import { CharacterInfo } from '../botc/roles';
import { Script } from '../botc/script';
import {
  Selection, CharacterCard, selectionReducer, CharacterSelection
} from './characters';
import { Distr, SetupModifiers } from './setup_help';

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

function ShuffleBag(props: {
  characters: CharacterInfo[],
  setRanking: (r: Ranking) => void,
}): JSX.Element {
  function handleClick() {
    props.setRanking(randomRanking(props.characters));
  }
  return <button className="shuffle" onClick={handleClick}>shuffle</button>;
}

function SelectedCharacters(props: {
  characters: CharacterInfo[],
  selection: Selection,
  ranking: Ranking,
  setRanking: (r: Ranking) => void,
}): JSX.Element {
  const { characters, selection, ranking } = props;
  var selected = characters.filter(char => selection.has(char.id));

  var bag = selected.filter(c => goesInBag(c.id));
  bag.sort((c1, c2) => ranking[c1.id] - ranking[c2.id]);
  var selectedOutsideBag = selected.filter(char => !goesInBag(char.id));
  return <div>
    <div className="selected-characters">
      <div className="column">
        <h2>Bag:
          <div className="spacer"></div>
          <ShuffleBag characters={characters} setRanking={props.setRanking}></ShuffleBag>
        </h2>
        {bag.length == 0 && <span>No roles</span>}
        {bag.map(char =>
          <CharacterCard
            character={char}
            key={char.id}
            selected={false}
          />
        )}
      </div>
      <div className="column">
        {selectedOutsideBag.length > 0 && <h2>Outside bag:</h2>}
        {selectedOutsideBag.map(char =>
          <CharacterCard
            character={char}
            key={char.id}
            selected={false}
          />
        )}
      </div>
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

type Ranking = { [key: string]: number };

function randomRanking(characters: CharacterInfo[]): Ranking {
  var r: Ranking = {};
  for (const c of characters) {
    r[c.id] = Math.random();
  }
  return r;
}

export function App(props: { script: Script }) {
  const { script } = props;
  const { characters } = script;
  const [numPlayers, setNumPlayers] = useState<number | "">(8);
  const [ranking, setRanking] = useState(randomRanking(characters));
  const [selection, dispatch] = useReducer(selectionReducer, initialSelection(characters));
  return <div>
    <h1>{script.title}</h1>
    <NumPlayerSelector {...{ numPlayers, setNumPlayers }} />
    <SetupModifiers
      numPlayers={numPlayers || 5}
      {...{ characters, selection }} />
    <CharacterSelection
      {...{ characters, selection }}
      dispatch={dispatch} />
    <hr className="separator" />
    <SelectedCharacters
      {...{ characters, selection, ranking, setRanking }} />
  </div>;
}
