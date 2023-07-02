import "../../icons";
import { CharacterContext } from "../character_context";
import {
  History,
  SetHistory,
  historyApply,
  pureHistoryApply,
} from "../history";
import { CharacterSelectionVars, SelAction } from "../selection";
import { ScriptState } from "../state";
import { Button } from "./button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Ranking, randomRanking } from "randomizer/ranking";
import React, { Dispatch, PropsWithChildren, useContext } from "react";

function ShuffleBagBtn(
  props: PropsWithChildren<{
    ranking: Ranking;
    bagSize: number;
    setRanking: (r: Ranking) => void;
    setHistory: SetHistory;
  }>,
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
    <Button
      id="shuffle-btn"
      className="btn"
      disabled={props.bagSize <= 1}
      onClick={handleClick}
      title="Shuffle"
    >
      {props.children}
    </Button>
  );
}

function ClearSelectionBtn(
  props: PropsWithChildren<{
    sels: CharacterSelectionVars;
    ranking: Ranking;
    setRanking: Dispatch<Ranking>;
    setHistory: SetHistory;
  }>,
): JSX.Element {
  const characters = useContext(CharacterContext);
  const { selection, bluffs } = props.sels;

  function handleClick() {
    pureHistoryApply(props.setHistory, {
      type: "replace",
      state: {
        selection: [...selection.chars],
        bluffs: [...bluffs.chars],
        ranking: { ...props.ranking },
      },
    });
    selection.dispatch({ type: "clear" });
    bluffs.dispatch({ type: "clear" });

    // also shuffle the ranking (in case we're setting up a new game)
    const newRanking = randomRanking(characters);
    props.setRanking(newRanking);

    pureHistoryApply(props.setHistory, {
      type: "push",
      state: { selection: [], bluffs: [], ranking: { ...newRanking } },
    });
  }
  return (
    <Button
      id="clear-btn"
      className="btn"
      disabled={selection.chars.size + bluffs.chars.size == 0}
      onClick={handleClick}
      title="Clear"
    >
      {props.children}
    </Button>
  );
}

function HistoryBtns(props: {
  setRanking: (r: Ranking) => void;
  selDispatch: Dispatch<SelAction>;
  bluffsDispatch: Dispatch<SelAction>;
  history: History<Partial<ScriptState>>;
  setHistory: SetHistory;
}): JSX.Element {
  const { history, setHistory } = props;

  const histUndoRedo = (direction: "undo" | "redo") => {
    historyApply(
      props.setRanking,
      props.selDispatch,
      props.bluffsDispatch,
      history,
      setHistory,
      { type: direction == "undo" ? "pop" : "forward" },
    );
  };

  const canUndo = history.back.length > 0;
  const canRedo = history.forward.length > 0;

  return (
    <>
      <label htmlFor="undo-btn" className="visuallyhidden">
        Undo
      </label>
      <Button
        id="undo-btn"
        className="btn"
        disabled={!canUndo}
        onClick={() => histUndoRedo("undo")}
        title="Undo"
      >
        <FontAwesomeIcon icon="undo" />
      </Button>
      <label htmlFor="redo-btn" className="visuallyhidden">
        Redo
      </label>
      <Button
        id="redo-btn"
        className="btn"
        disabled={!canRedo}
        onClick={() => histUndoRedo("redo")}
        title="Redo"
      >
        <FontAwesomeIcon icon="redo" />
      </Button>
    </>
  );
}

export function RankingBtns(props: {
  sels: CharacterSelectionVars;
  ranking: Ranking;
  bagSize: number;
  setRanking: (r: Ranking) => void;
  setFsRole: (r: string) => void;
  history: History<Partial<ScriptState>>;
  setHistory: SetHistory;
}): JSX.Element {
  const { ranking, sels } = props;
  return (
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
        sels={sels}
        ranking={ranking}
        setRanking={props.setRanking}
        setHistory={props.setHistory}
      >
        <FontAwesomeIcon icon="trash" />
      </ClearSelectionBtn>
      <HistoryBtns
        {...props}
        selDispatch={sels.selection.dispatch}
        bluffsDispatch={sels.bluffs.dispatch}
      />
    </div>
  );
}
