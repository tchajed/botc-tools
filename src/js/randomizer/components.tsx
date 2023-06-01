import React, { Children, ReactNode, useReducer, useState } from 'react';
import { Distribution, distributionForCount, zeroDistribution } from '../botc/setup';
import { CharacterInfo } from '../botc/roles';
import classnames from 'classnames';
import { iconPath } from '../views';
import { Script } from '../botc/script';

function Distr({ dist }: { dist: Distribution }): JSX.Element {
  return <span className='distribution'>
    <span className='good'>{dist.townsfolk}</span>
    /
    <span className='good'>{dist.outsider}</span>
    /
    <span className='evil'>{dist.minion}</span>
    /
    <span className='evil'>{dist.demon}</span>
  </span>;
}

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
      <button onClick={handleIncDec(-1)}>-</button>
      <input value={numPlayers} readOnly={true}></input>
      <button onClick={handleIncDec(+1)}>+</button>
    </div>
    <div>
      <BaseDistr numPlayers={numPlayers} />
    </div>
  </div>;
}

function RoleLabel(props: { roleType: string }): JSX.Element {
  var letter = props.roleType.charAt(0).toUpperCase();
  return <span className='role-label'>{letter}</span>;
}

function CharacterIconElement(props: { name: string, id: string }): JSX.Element {
  let { id } = props;
  if (!iconPath(id)) {
    return <></>;
  }
  return <div className="img-container">
    <img className="char-icon"
      src={iconPath(id)} alt={props.name} />
  </div>;
}

function CharacterCard(props: {
  character: CharacterInfo,
  onClick?: React.MouseEventHandler<HTMLElement>,
  selected: boolean
}): JSX.Element {
  let { character } = props;
  let { roleType } = character;
  let needsLabel = ["outsider", "minion"].includes(roleType);
  return <div
    className={classnames(
      character.evil ? "evil" : "good",
      "character",
      { "selected": props.selected })}
    onClick={props.onClick}>
    {needsLabel && <RoleLabel roleType={roleType} />}
    <CharacterIconElement {...character} />
    <span className='name'>{character.name}</span>
  </div>;
}

function splitColumns<T>(xs: T[], numColumns: number): T[][] {
  const numPerColumn = Math.ceil(xs.length / numColumns);
  var columns: T[][] = [];
  while (xs.length > 0) {
    let col = xs.splice(0, numPerColumn);
    columns.push(col);
  }
  return columns;
}

function Columns(props: { numColumns: number, children: ReactNode[] }): JSX.Element {
  const cols = splitColumns(Children.toArray(props.children), props.numColumns);
  return <>
    {cols.map((col, i) =>
      <div className="column" key={i}>
        {col}
      </div>
    )}
  </>;
}

type Selection = Set<string>;

type SelAction = {
  type: "toggle",
  id: string,
}

function assertUnreachable(_value: never): never {
  throw new Error("should be unreachable");
}

function selectionReducer(selection: Selection, action: SelAction): Selection {
  var newSelection = new Set(selection);
  switch (action.type) {
    case "toggle": {
      if (newSelection.has(action.id)) {
        newSelection.delete(action.id);
      } else {
        newSelection.add(action.id);
      }
      return newSelection;
    }
    default:
      assertUnreachable(action.type);
  }
}

function CharacterSelection(props: {
  characters: CharacterInfo[],
  selection: Selection,
  dispatch: (a: SelAction) => void,
}): JSX.Element {
  let chars = props.characters;
  let { selection, dispatch } = props;

  return <div>
    {["townsfolk", "outsider", "minion", "demon"].map(roleType =>
      <div className="characters" key={`${roleType}-roles`}>
        <Columns numColumns={2}>
          {chars.filter(char => char.roleType == roleType).map(char =>
            <CharacterCard
              character={char}
              key={char.id}
              selected={selection.has(char.id)}
              onClick={() => dispatch({ type: "toggle", id: char.id })} />
          )}
        </Columns>
      </div>
    )}
  </div>;
}

function SelectedCharacters(props: {
  characters: CharacterInfo[],
  selection: Selection,
}): JSX.Element {
  const { characters, selection } = props;
  var selected = characters.filter(char => selection.has(char.id));
  selected.sort(() => Math.random() - 0.5);
  return <div className="selected-characters">
    <div className="column">
      {selected.map(char =>
        <CharacterCard
          character={char}
          key={char.id}
          selected={false}
        />
      )}
    </div>
  </div>;
}

export function App(props: { script: Script }) {
  const { script } = props;
  const [numPlayers, setNumPlayers] = useState<number | "">(8);
  const [selection, dispatch] = useReducer(selectionReducer, new Set() as Set<string>);
  return <div>
    <h1>{script.title}</h1>
    <NumPlayerSelector {...{ numPlayers, setNumPlayers }} />
    <CharacterSelection
      characters={script.characters}
      selection={selection}
      dispatch={dispatch} />
    <hr className="separator" />
    <SelectedCharacters
      characters={script.characters}
      selection={selection} />
  </div>;
}
