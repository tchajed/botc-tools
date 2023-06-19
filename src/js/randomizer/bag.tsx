import { CharacterInfo } from "../botc/roles";
import { BagCharacter, splitSelectedChars } from "../botc/setup";
import "../icons";
import { BluffList } from "./bluffs";
import { CharacterContext } from "./character_context";
import { CardInfo, CharacterCard } from "./characters";
import { History, SetHistory, historyApply, pureHistoryApply } from "./history";
import {
  CharacterSelectionVars,
  SelAction,
  Selection,
  SelectionVar,
} from "./selection";
import { BagSetupHelp } from "./setup_help";
import { State } from "./state";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { Dispatch, PropsWithChildren, useContext } from "react";

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
    selection: SelectionVar;
    ranking: Ranking;
    setRanking: Dispatch<Ranking>;
    setHistory: SetHistory;
  }>
): JSX.Element {
  const characters = useContext(CharacterContext);
  const { selection } = props;

  function handleClick() {
    pureHistoryApply(props.setHistory, {
      type: "replace",
      state: {
        selection: [...selection.chars],
        ranking: { ...props.ranking },
      },
    });
    selection.dispatch({ type: "clear" });

    // also shuffle the ranking (in case we're setting up a new game)
    const newRanking = randomRanking(characters);
    props.setRanking(newRanking);

    pureHistoryApply(props.setHistory, {
      type: "push",
      state: { selection: [], ranking: { ...newRanking } },
    });
  }
  return (
    <button
      id="clear-btn"
      className="btn"
      disabled={selection.chars.size == 0}
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
  selection: SelectionVar;
  ranking: Ranking;
  bagSize: number;
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
          ranking={ranking}
          setRanking={props.setRanking}
          setHistory={props.setHistory}
        >
          <FontAwesomeIcon icon="trash" />
        </ClearSelectionBtn>
        <HistoryBtns {...props} selDispatch={selection.dispatch} />
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

export function SelectedCharacters(
  props: CharacterSelectionVars & {
    ranking: Ranking;
    numPlayers: number;
    setRanking: (r: Ranking) => void;
    setFsRole: (r: string) => void;
    history: History<Partial<State>>;
    setHistory: SetHistory;
  }
): JSX.Element {
  const characters = useContext(CharacterContext);
  const { selection, bluffs, ranking, setFsRole } = props;

  const { bag, outsideBag } = splitSelectedChars(
    characters,
    selection.chars,
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
            <BagSetupHelp
              numPlayers={props.numPlayers}
              selection={selection.chars}
            />
          </div>
          {bag.map((char) => (
            <CharacterCard
              character={char}
              key={charKey(char)}
              onClick={handleClick(char.id)}
            />
          ))}
        </div>
        <OtherCharacters characters={outsideBag} bluffs={bluffs.chars} />
      </div>
    </div>
  );
}
function OtherCharacters(props: { characters: CardInfo[]; bluffs: Selection }) {
  const { characters } = props;
  return (
    <div className="column-smaller">
      {characters.length > 0 && <h2>Others</h2>}
      {characters.map((char) => (
        <CharacterCard character={char} key={char.id} />
      ))}
      <BluffList bluffs={props.bluffs} />
    </div>
  );
}
