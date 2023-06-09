import React, { Dispatch, PropsWithChildren, useContext } from "react";
import { CharacterInfo } from "../botc/roles";
import { BagCharacter, splitSelectedChars } from "../botc/setup";
import { CharacterCard, SelAction, Selection } from "./characters";
import { CharacterContext } from "./character_context";
import { State } from "./state";
import { History, SetHistory, historyApply, pureHistoryApply } from "./history";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { BagSetupHelp } from "./setup_help";
import "../icons";

export type Ranking = { [key: string]: number };

// from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffleArray<T>(array: T[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export function randomRanking(characters: CharacterInfo[]): Ranking {
  const randomOrder = characters.map((c) => c.id);
  for (let i = 0; i < 3; i++) {
    // assign copies of riot different rankings
    randomOrder.push(`riot-${i}`);
  }
  for (let i = 0; i < 12; i++) {
    // assign copies of legion different rankings
    randomOrder.push(`legion-${i}`);
  }
  shuffleArray(randomOrder);
  const r = Object.fromEntries(randomOrder.map((id, i) => [id, i]));
  return r;
}

function ShuffleBagBtn(
  props: PropsWithChildren<{
    ranking: Ranking;
    bagSize: number;
    setRanking: (r: Ranking) => void;
    setHistory: SetHistory;
  }>
): JSX.Element {
  const characters = useContext(CharacterContext);

  function handleClick() {
    // save the old state
    pureHistoryApply(props.setHistory, {
      type: "replace",
      state: { ranking: { ...props.ranking } },
    });

    // create and set a new ranking...
    const newRanking = randomRanking(characters);
    props.setRanking(newRanking);

    // ...and save it to history
    pureHistoryApply(props.setHistory, {
      type: "push",
      state: { ranking: { ...newRanking } },
    });
  }
  return (
    <button
      id="shuffle-btn"
      className="btn"
      disabled={props.bagSize <= 1}
      onClick={handleClick}
      title="Shuffle"
    >
      {props.children}
    </button>
  );
}

function ClearSelectionBtn(
  props: PropsWithChildren<{
    selection: Selection;
    selDispatch: Dispatch<SelAction>;
    setHistory: SetHistory;
  }>
): JSX.Element {
  function handleClick() {
    pureHistoryApply(props.setHistory, {
      type: "replace",
      state: { selection: [...props.selection] },
    });
    props.selDispatch({ type: "clear" });
    pureHistoryApply(props.setHistory, {
      type: "push",
      state: { selection: [] },
    });
  }
  return (
    <button
      id="clear-btn"
      className="btn"
      disabled={props.selection.size == 0}
      onClick={handleClick}
      title="Clear"
    >
      {props.children}
    </button>
  );
}

function HistoryBtns(props: {
  setRanking: (r: Ranking) => void;
  selDispatch: Dispatch<SelAction>;
  history: History<Partial<State>>;
  setHistory: SetHistory;
}): JSX.Element {
  const { history, setHistory } = props;

  function handleUndo() {
    historyApply(props.setRanking, props.selDispatch, history, setHistory, {
      type: "pop",
    });
  }

  function handleRedo() {
    historyApply(props.setRanking, props.selDispatch, history, setHistory, {
      type: "forward",
    });
  }

  const canUndo = history.back.length > 0;
  const canRedo = history.forward.length > 0;

  return (
    <>
      <label htmlFor="undo-btn" className="visuallyhidden">
        Undo
      </label>
      <button
        id="undo-btn"
        className="btn"
        disabled={!canUndo}
        onClick={handleUndo}
        title="Undo"
      >
        <FontAwesomeIcon icon="undo" />
      </button>
      <label htmlFor="redo-btn" className="visuallyhidden">
        Redo
      </label>
      <button
        id="redo-btn"
        className="btn"
        disabled={!canRedo}
        onClick={handleRedo}
        title="Redo"
      >
        <FontAwesomeIcon icon="redo" />
      </button>
    </>
  );
}

function BagHeader(props: {
  selection: Selection;
  ranking: Ranking;
  bagSize: number;
  selDispatch: Dispatch<SelAction>;
  setRanking: (r: Ranking) => void;
  setFsRole: (r: string) => void;
  history: History<Partial<State>>;
  setHistory: SetHistory;
}): JSX.Element {
  const { ranking, selection } = props;
  return (
    <div className="bag-header">
      <h2>Bag</h2>
      <div className="bag-btns">
        <label htmlFor="shuffle-btn" className="visuallyhidden">
          Shuffle
        </label>
        <ShuffleBagBtn
          bagSize={props.bagSize}
          ranking={ranking}
          setRanking={props.setRanking}
          setHistory={props.setHistory}
        >
          <FontAwesomeIcon icon="shuffle" />
        </ShuffleBagBtn>
        <label htmlFor="clear-btn" className="visuallyhidden">
          Clear
        </label>
        <ClearSelectionBtn
          selection={selection}
          selDispatch={props.selDispatch}
          setHistory={props.setHistory}
        >
          <FontAwesomeIcon icon="trash" />
        </ClearSelectionBtn>
        <HistoryBtns {...props} />
      </div>
    </div>
  );
}

export function charKey(character: BagCharacter): string {
  return character.demonNum !== undefined
    ? `${character.id}-${character.demonNum}`
    : character.id;
}

export function sortBag(bag: BagCharacter[], ranking: Ranking) {
  bag.sort((c1, c2) => ranking[charKey(c1)] - ranking[charKey(c2)]);
}

export function SelectedCharacters(props: {
  selection: Selection;
  ranking: Ranking;
  numPlayers: number;
  selDispatch: Dispatch<SelAction>;
  setRanking: (r: Ranking) => void;
  setFsRole: (r: string) => void;
  history: History<Partial<State>>;
  setHistory: SetHistory;
}): JSX.Element {
  const characters = useContext(CharacterContext);
  const { selection, ranking, setFsRole } = props;

  const { bag, outsideBag } = splitSelectedChars(
    characters,
    selection,
    props.numPlayers
  );
  sortBag(bag, ranking);

  function handleClick(id: string): () => void {
    return () => {
      setFsRole(id);
    };
  }

  return (
    <div>
      <div className="selected-characters">
        <div className="column">
          <BagHeader bagSize={bag.length} {...props} />
          <div>
            <BagSetupHelp numPlayers={props.numPlayers} selection={selection} />
          </div>
          {bag.map((char) => (
            <CharacterCard
              character={char}
              key={charKey(char)}
              onClick={handleClick(char.id)}
            />
          ))}
        </div>
        <div className="column-smaller">
          {outsideBag.length > 0 && <h2>Others</h2>}
          {outsideBag.map((char) => (
            <CharacterCard character={char} key={char.id} />
          ))}
        </div>
      </div>
    </div>
  );
}
