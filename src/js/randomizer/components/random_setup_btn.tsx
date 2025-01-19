import { randomBluffs, randomCompleteSelection } from "../../botc/random_setup";
import { CharacterContext } from "../character_context";
import { SetHistory, pureHistoryApply } from "../history";
import { Selection, SelAction } from "../selection";
import { Button } from "./button";
import { css, useTheme } from "@emotion/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext } from "react";

export function RandomSetupButton(props: {
  numPlayers: number;
  selection: Selection;
  selDispatch: React.Dispatch<SelAction>;
  bluffs: Selection;
  bluffsDispatch: React.Dispatch<SelAction>;
  setHistory: SetHistory;
}): React.JSX.Element {
  const theme = useTheme();
  const characters = useContext(CharacterContext);
  const { numPlayers, selection, selDispatch, bluffs, bluffsDispatch } = props;

  const randomSelection = randomCompleteSelection(
    numPlayers,
    characters,
    selection,
  );
  const newBluffs = randomSelection
    ? randomBluffs(characters, randomSelection, bluffs)
    : bluffs;
  const haveNewSelection =
    (randomSelection != null && randomSelection.size != selection.size) ||
    newBluffs.size != bluffs.size;

  const handleClick = () => {
    if (!haveNewSelection) {
      return;
    }
    pureHistoryApply(props.setHistory, {
      type: "replace",
      state: {
        selection: [...selection.values()],
        bluffs: [...bluffs.values()],
      },
    });
    if (randomSelection) {
      selDispatch({ type: "set all", ids: [...randomSelection.values()] });
    }
    bluffsDispatch({ type: "set all", ids: [...newBluffs.values()] });
    pureHistoryApply(props.setHistory, {
      type: "push",
      state: {
        selection: randomSelection ? [...randomSelection.values()] : undefined,
        bluffs: [...bluffs.values()],
      },
    });
  };

  return (
    <Button
      onClick={handleClick}
      disabled={!haveNewSelection}
      color="white"
      backgroundColor={theme.color.primary}
      css={css`
        border: none;
        padding: 0.5rem;
        font-size: 14pt;
      `}
    >
      <FontAwesomeIcon icon="magic-wand-sparkles" />
      &nbsp; random setup
    </Button>
  );
}
