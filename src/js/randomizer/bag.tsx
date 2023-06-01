import React, { useContext } from "react";
import { CharacterInfo } from "../botc/roles";
import { goesInBag } from "../botc/setup";
import { CharacterCard, Selection } from "./characters";
import { CharacterContext } from "./character_context";

export type Ranking = { [key: string]: number };

export function randomRanking(characters: CharacterInfo[]): Ranking {
  var r: Ranking = {};
  for (const c of characters) {
    r[c.id] = Math.random();
  }
  return r;
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

export function SelectedCharacters(props: {
  selection: Selection,
  ranking: Ranking,
  setRanking: (r: Ranking) => void,
}): JSX.Element {
  const characters = useContext(CharacterContext);
  const { selection, ranking } = props;
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
