import React, { useContext, useState } from "react";
import { CharacterInfo } from "../botc/roles";
import { distributionForCount, goesInBag } from "../botc/setup";
import { CardInfo, CharacterCard, SelAction, Selection } from "./characters";
import { CharacterContext } from "./character_context";

export type Ranking = { [key: string]: number };

function shuffleArray<T>(array: T[]) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

export function randomRanking(characters: CharacterInfo[]): Ranking {
  const randomOrder = characters.map(c => c.id);
  for (var i = 0; i < 3; i++) {
    // assign copies of riot different rankings
    randomOrder.push(`riot-${i}`);
  }
  shuffleArray(randomOrder);
  var r = Object.fromEntries(randomOrder.map((id, i) => [id, i]));
  return r;
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

function HistoryBtns(): JSX.Element {
  const [forwardCount, setForwardCount] = useState(0);

  function handleBack() {
    if (forwardCount < 0) {
      setForwardCount(1);
    } else {
      setForwardCount(forwardCount + 1);
    }
    window.history.back();
  }

  function handleForward() {
    if (forwardCount > 0) {
      setForwardCount(forwardCount - 1);
    } else {
      setForwardCount(0);
    }
    window.history.forward();
  }

  return <>
    <button className="btn" onClick={handleBack}>undo</button>
    {forwardCount > 0 &&
      <button className="btn" onClick={handleForward}>redo</button>}
  </>
}

export function SelectedCharacters(props: {
  selection: Selection,
  ranking: Ranking,
  numPlayers: number | "",
  dispatch: (a: SelAction) => void,
  setRanking: (r: Ranking) => void,
  setFsRole: (r: string) => void,
}): JSX.Element {
  const characters = useContext(CharacterContext);
  const { selection, ranking, dispatch, setRanking, setFsRole } = props;
  var selected = characters.filter(char => selection.has(char.id));

  function handleClick(id: string): () => void {
    return () => {
      setFsRole(id);
    };
  }

  var bag: (CardInfo & { riotNum?: number })[] = selected.filter(c => goesInBag(c));
  const numMinions = distributionForCount(props.numPlayers || 5).minion;
  const riot = bag.find(c => c.id == "riot");
  if (riot) {
    for (var i = 0; i < numMinions; i++) {
      const thisRiot = { riotNum: i, ...riot };
      bag.push(thisRiot);
    }
  }

  // an extended identifier to disambiguate riots
  function charKey(char: { id: string, riotNum?: number }): string {
    if (char.id == "riot" && char.riotNum !== undefined) {
      return `riot-${char.riotNum}`;
    }
    return char.id;
  }

  bag.sort((c1, c2) => ranking[charKey(c1)] - ranking[charKey(c2)]);

  var selectedOutsideBag = selected.filter(char => !goesInBag(char));
  return <div>
    <div className="selected-characters">
      <div className="column">
        <div className="bag-header">
          <h2>Bag</h2>
          {bag.length > 0 &&
            <><div>
              <ShuffleBagBtn ranking={ranking} setRanking={setRanking}></ShuffleBagBtn>
              <ClearSelectionBtn selection={selection} dispatch={dispatch}></ClearSelectionBtn>
            </div>
              <div><HistoryBtns /></div>
            </>}
        </div>
        {bag.length == 0 && <span>No roles</span>}
        {bag.map(char =>
          <CharacterCard
            character={char}
            key={charKey(char)}
            selected={false}
            onClick={handleClick(char.id)}
          />
        )}
      </div>
      <div className="column">
        {selectedOutsideBag.length > 0 && <h2>Outside bag</h2>}
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
