import React, { Children, ReactNode, useReducer, useState } from 'react';
import { Distribution, SetupChanges, SetupModification, actualDistribution, differentRoleTypes, distributionForCount, goesInBag, modifiedDistribution, zeroDistribution } from '../botc/setup';
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
      <button onClick={handleIncDec(-1)}>&#x2212;</button>
      <input value={numPlayers} readOnly={true}></input>
      <button onClick={handleIncDec(+1)}>+</button>
    </div>
    <div>
      <BaseDistr numPlayers={numPlayers} />
    </div>
  </div>;
}

function ModificationExplanation(props: { mod: SetupModification }): JSX.Element {
  let { mod } = props;
  switch (mod.type) {
    case "outsider_count": {
      const change = Math.abs(mod.delta);
      const sign = mod.delta > 0 ? <>+</> : <>&#x2212;</>;
      const plural = change == 1 ? "" : "s";
      return <span>({sign}{change} outsider{plural})</span>;
    }
    case "drunk": {
      return <span>(+1 townsfolk, not added to bag)</span>;
    }
    case "godfather": {
      return <span>(+1 or &#x2212;1 outsider)</span>;
    }
    case "lilmonsta": {
      return <span>(+1 minion, not added to bag)</span>;
    }
  }
}

function SetupModifiers(props: {
  numPlayers: number,
  characters: CharacterInfo[],
  selection: Selection
}) {
  let { characters, selection } = props;
  var modified: CharacterInfo[] = [];
  selection.forEach(id => {
    if (id in SetupChanges) {
      const c = characters.find(c => c.id == id);
      if (c) { modified.push(c); }
    }
  })
  modified.sort();

  const baseDistribution = distributionForCount(props.numPlayers);
  const newDistributions = modifiedDistribution(
    baseDistribution,
    modified.map(c => SetupChanges[c.id]),
    characters,
  );

  const selected = characters.filter(c => selection.has(c.id));
  let actual = actualDistribution(selected);
  let distributionCorrect = newDistributions.some(dist =>
    differentRoleTypes(dist, actual).length == 0);

  return <div className="modifiers">
    <br />
    {modified.map(char => {
      return <div>
        <span className={classnames(char.good ? "good" : "evil", "bold")}>
          {char.name}
        </span>
        <span> {<ModificationExplanation mod={SetupChanges[char.id]} />}</span>
      </div>;
    })}
    {modified.length > 0 && <div>
      <span className="label">target: </span>
      {newDistributions
        .map(dist => <Distr dist={dist} />)
        .reduce((acc, x) => acc === null ? x : <>{acc} or {x}</>)}
    </div>}
    <div>
      <span className="label">actual: </span> <Distr dist={actual} />
      {distributionCorrect && <span className="bold">&#x2713;</span>}
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

interface SelectionVar {
  selection: Selection,
  dispatch: (a: SelAction) => void,
}

function CharacterSelection(props:
  { characters: CharacterInfo[], } &
  SelectionVar): JSX.Element {
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
  var bag = selected.filter(c => goesInBag(c.id));
  bag.sort(() => Math.random() - 0.5);
  var selectedOutsideBag = selected.filter(char => !goesInBag(char.id));
  return <div className="selected-characters">
    <div className="column">
      {bag.map(char =>
        <CharacterCard
          character={char}
          key={char.id}
          selected={false}
        />
      )}
    </div>
    <div className="column">
      {selectedOutsideBag.length > 0 && <p><span className="bold">Outside bag:</span></p>}
      {selectedOutsideBag.map(char =>
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
  var initialSelection = new Set<string>();
  const totalDistribution = actualDistribution(script.characters);
  if (totalDistribution.demon == 1) {
    for (const c of script.characters) {
      if (c.roleType == "demon") { initialSelection.add(c.id); }
    }
  }
  const [selection, dispatch] = useReducer(selectionReducer, initialSelection);
  return <div>
    <h1>{script.title}</h1>
    <NumPlayerSelector {...{ numPlayers, setNumPlayers }} />
    <SetupModifiers numPlayers={numPlayers || 5} characters={script.characters} selection={selection} />
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
