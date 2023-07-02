import { randomCompleteSelection } from "../../botc/random_setup";
import { CharacterContext } from "../character_context";
import { SetHistory, pureHistoryApply } from "../history";
import { Selection, SelAction } from "../selection";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext } from "react";

export function RandomSetupButton(props: {
  numPlayers: number;
  selection: Selection;
  selDispatch: React.Dispatch<SelAction>;
  setHistory: SetHistory;
}): JSX.Element {
  const characters = useContext(CharacterContext);
  const { numPlayers, selection, selDispatch } = props;

  const randomSelection = randomCompleteSelection(
    numPlayers,
    characters,
    selection,
  );
  const haveNewSelection =
    randomSelection != null && randomSelection.size != selection.size;

  const handleClick = () => {
    if (!haveNewSelection) {
      return;
    }
    pureHistoryApply(props.setHistory, {
      type: "replace",
      state: { selection: [...selection.values()] },
    });
    selDispatch({ type: "set all", ids: [...randomSelection.values()] });
    pureHistoryApply(props.setHistory, {
      type: "push",
      state: { selection: [...randomSelection.values()] },
    });
  };

  return (
    <button
      className="button setup-btn"
      onClick={handleClick}
      disabled={!haveNewSelection}
    >
      <FontAwesomeIcon icon="magic-wand-sparkles" />
      &nbsp; random setup
    </button>
  );
}
