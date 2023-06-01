import React, { useContext } from "react";
import { CharacterInfo } from "../botc/roles";
import { goesInBag } from "../botc/setup";
import { CharacterCard, SelAction, Selection } from "./characters";
import { CharacterContext } from "./character_context";

export type Ranking = { [key: string]: number };

export function randomRanking(characters: CharacterInfo[]): Ranking {
  const randomOrder = [...characters];
  randomOrder.sort(() => Math.random() - 0.5);
  return Object.fromEntries(randomOrder.map((c, i) => [c.id, i]));
}

function ShuffleBagBtn(props: {
  ranking: Ranking,
  setRanking: (r: Ranking) => void,
}): JSX.Element {
  const characters = useContext(CharacterContext);
  function handleClick() {
    window.history.replaceState({ ranking: { ...props.ranking } }, "");
    const newRanking = randomRanking(characters);
    props.setRanking(newRanking);
    window.history.pushState({ ranking: { ...newRanking } }, "");
  }
  return <button className="btn" onClick={handleClick}>shuffle</button>;
}

function ClearSelectionBtn(props: {
  selection: Selection,
  dispatch: (a: SelAction) => void,
}): JSX.Element {
  function handleClick() {
    window.history.replaceState({ selection: [...props.selection] }, "");
    props.dispatch({ type: "clear" });
    window.history.pushState({ selection: [] }, "no selection");
  }
  return <button className="btn" onClick={handleClick}>clear</button>;
}

export function SelectedCharacters(props: {
  selection: Selection,
  ranking: Ranking,
  dispatch: (a: SelAction) => void,
  setRanking: (r: Ranking) => void,
}): JSX.Element {
  const characters = useContext(CharacterContext);
  const { selection, ranking, dispatch, setRanking } = props;
  var selected = characters.filter(char => selection.has(char.id));

  var bag = selected.filter(c => goesInBag(c.id));
  bag.sort((c1, c2) => ranking[c1.id] - ranking[c2.id]);
  var selectedOutsideBag = selected.filter(char => !goesInBag(char.id));
  return <div>
    <div className="selected-characters">
      <div className="column">
        <h2>Bag:
          <div className="spacer"></div>
          <ShuffleBagBtn ranking={ranking} setRanking={setRanking}></ShuffleBagBtn>
          <ClearSelectionBtn selection={selection} dispatch={dispatch}></ClearSelectionBtn>
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
