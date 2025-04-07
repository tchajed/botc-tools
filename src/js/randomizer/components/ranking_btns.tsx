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
import styled from "@emotion/styled";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Ranking, randomRanking } from "randomizer/ranking";
import { Dispatch, PropsWithChildren, useContext } from "react";

const IconButton = styled(Button)`
  width: 2.5rem;
  height: 2.5rem;
  font-size: 120%;
  &:not(:first-of-type) {
    margin-left: 0.25rem;
  }
`;

function ShuffleBagBtn(
  props: PropsWithChildren<{
    ranking: Ranking;
    bagSize: number;
    setRanking: (r: Ranking) => void;
    setHistory: SetHistory;
  }>,
): React.JSX.Element {
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
    <IconButton
      id="shuffle-btn"
      disabled={props.bagSize <= 1}
      onClick={handleClick}
      title="Shuffle"
    >
      {props.children}
    </IconButton>
  );
}

function ClearSelectionBtn(
  props: PropsWithChildren<{
    sels: CharacterSelectionVars;
    ranking: Ranking;
    setRanking: Dispatch<Ranking>;
    setHistory: SetHistory;
  }>,
): React.JSX.Element {
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
    <IconButton
      id="clear-btn"
      disabled={selection.chars.size + bluffs.chars.size == 0}
      onClick={handleClick}
      title="Clear"
    >
      {props.children}
    </IconButton>
  );
}

function HistoryBtns(props: {
  setRanking: (r: Ranking) => void;
  selDispatch: Dispatch<SelAction>;
  bluffsDispatch: Dispatch<SelAction>;
  history: History<Partial<ScriptState>>;
  setHistory: SetHistory;
}): React.JSX.Element {
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
      <IconButton
        id="undo-btn"
        disabled={!canUndo}
        onClick={() => histUndoRedo("undo")}
        title="Undo"
      >
        <FontAwesomeIcon icon="undo" />
      </IconButton>
      <label htmlFor="redo-btn" className="visuallyhidden">
        Redo
      </label>
      <IconButton
        id="redo-btn"
        disabled={!canRedo}
        onClick={() => histUndoRedo("redo")}
        title="Redo"
      >
        <FontAwesomeIcon icon="redo" />
      </IconButton>
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
}): React.JSX.Element {
  const { ranking, sels } = props;
  return (
    <div id="bag-btns">
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
