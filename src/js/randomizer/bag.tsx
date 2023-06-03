import React, { Dispatch, PropsWithChildren, useContext, } from "react";
import { CharacterInfo } from "../botc/roles";
import { splitSelectedChars } from "../botc/setup";
import { CharacterCard, SelAction, Selection } from "./characters";
import { CharacterContext } from "./character_context";
import { State } from "./state";
import { History, SetHistory, historyApply, pureHistoryApply } from "./history";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShuffle, faBan, faUndo, faRedo } from '@fortawesome/free-solid-svg-icons'
import { BagSetupHelp } from "./setup_help";

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

function ShuffleBagBtn(props: PropsWithChildren<{
  ranking: Ranking,
  bagSize: number,
  setRanking: (r: Ranking) => void,
  setHistory: SetHistory,
}>): JSX.Element {
  const characters = useContext(CharacterContext);

  function handleClick() {
    // save the old state
    pureHistoryApply(props.setHistory, {
      type: 'replace',
      state: { ranking: { ...props.ranking } },
    });

    // create and set a new ranking...
    const newRanking = randomRanking(characters);
    props.setRanking(newRanking);

    // ...and save it to history
    pureHistoryApply(props.setHistory, {
      type: 'push',
      state: { ranking: { ...newRanking } }
    });
  }
  return <button id="shuffle-btn" className="btn"
    disabled={props.bagSize <= 1}
    onClick={handleClick}
    title="Shuffle">{props.children}</button>;
}

function ClearSelectionBtn(props: PropsWithChildren<{
  selection: Selection,
  selDispatch: Dispatch<SelAction>,
  setHistory: SetHistory,
}>): JSX.Element {
  function handleClick() {
    pureHistoryApply(props.setHistory, {
      type: 'replace',
      state: { selection: [...props.selection] },
    });
    props.selDispatch({ type: "clear" });
    pureHistoryApply(props.setHistory, {
      type: 'push',
      state: { selection: [] },
    });
  }
  return <button id="clear-btn" className="btn"
    disabled={props.selection.size == 0}
    onClick={handleClick}
    title="Clear">{props.children}</button>;
}

function HistoryBtns(props: {
  setRanking: (r: Ranking) => void,
  selDispatch: Dispatch<SelAction>,
  history: History<Partial<State>>,
  setHistory: SetHistory,
}): JSX.Element {
  const { history, setHistory } = props;

  function handleUndo() {
    historyApply(props.setRanking, props.selDispatch, history, setHistory,
      { type: 'pop' });
  }

  function handleRedo() {
    historyApply(props.setRanking, props.selDispatch, history, setHistory,
      { type: 'forward' });
  }

  const canUndo = history.back.length > 0;
  const canRedo = history.forward.length > 0;

  return <>
    <label htmlFor="undo-btn" className="visuallyhidden">Undo</label>
    <button id="undo-btn"
      className="btn" disabled={!canUndo} onClick={handleUndo}
      title="Undo">
      <FontAwesomeIcon icon={faUndo} />
    </button>
    <label htmlFor="redo-btn" className="visuallyhidden">Redo</label>
    <button id="redo-btn"
      className="btn" disabled={!canRedo} onClick={handleRedo}
      title="Redo">
      <FontAwesomeIcon icon={faRedo} />
    </button>
  </>
}

function BagHeader(props: {
  selection: Selection,
  ranking: Ranking,
  bagSize: number,
  selDispatch: Dispatch<SelAction>,
  setRanking: (r: Ranking) => void,
  setFsRole: (r: string) => void,
  history: History<Partial<State>>,
  setHistory: SetHistory,
}): JSX.Element {
  let { ranking, selection } = props;
  return <div className="bag-header">
    <h2>Bag</h2>
    <div className="bag-btns">
      <label htmlFor="shuffle-btn" className="visuallyhidden">Shuffle</label>
      <ShuffleBagBtn bagSize={props.bagSize} ranking={ranking} setRanking={props.setRanking}
        setHistory={props.setHistory}>
        <FontAwesomeIcon icon={faShuffle} />
      </ShuffleBagBtn>
      <label htmlFor="clear-btn" className="visuallyhidden">Clear</label>
      <ClearSelectionBtn selection={selection} selDispatch={props.selDispatch}
        setHistory={props.setHistory}>
        <FontAwesomeIcon icon={faBan} />
      </ClearSelectionBtn>
      <HistoryBtns {...props} />
    </div>
  </div>
}

export function SelectedCharacters(props: {
  selection: Selection,
  ranking: Ranking,
  numPlayers: number,
  selDispatch: Dispatch<SelAction>,
  setRanking: (r: Ranking) => void,
  setFsRole: (r: string) => void,
  history: History<Partial<State>>,
  setHistory: SetHistory,
}): JSX.Element {
  const characters = useContext(CharacterContext);
  const { selection, ranking, setFsRole } = props;

  const { bag, outsideBag } = splitSelectedChars(characters, selection, props.numPlayers);

  // an extended identifier to disambiguate riots
  function charKey(char: { id: string, riotNum?: number }): string {
    if (char.id == "riot" && char.riotNum !== undefined) {
      return `riot-${char.riotNum}`;
    }
    return char.id;
  }

  bag.sort((c1, c2) => ranking[charKey(c1)] - ranking[charKey(c2)]);

  function handleClick(id: string): () => void {
    return () => {
      setFsRole(id);
    };
  }

  return <div>
    <div className="selected-characters">
      <div className="column">
        <BagHeader bagSize={bag.length} {...props} />
        <div><BagSetupHelp numPlayers={props.numPlayers} selection={selection} /></div>
        {bag.map(char =>
          <CharacterCard
            character={char}
            key={charKey(char)}
            onClick={handleClick(char.id)}
          />
        )}
      </div>
      <div className="column-smaller">
        {outsideBag.length > 0 && <h2>Others</h2>}
        {outsideBag.map(char =>
          <CharacterCard
            character={char}
            key={char.id}
          />
        )}
      </div>
    </div>
  </div>;
}
