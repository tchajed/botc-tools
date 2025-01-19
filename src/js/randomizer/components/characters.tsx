import { CharacterInfo, NightAction, RoleType } from "../../botc/roles";
import {
  CharacterIconElement,
  characterClass,
} from "../../components/character_icon";
import { CharacterContext } from "../character_context";
import { Columns } from "../columns";
import { CharacterSelectionVars } from "../selection";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import classnames from "classnames";
import React, { useContext } from "react";

/** A label in the upper left of a container */
const SmallLabel = styled.span`
  position: absolute;
  top: 1px;
  left: 1px;
  font-size: 90%;
`;

function RoleLabel(props: { roleType: string }): React.JSX.Element {
  const letter = props.roleType.charAt(0).toUpperCase();
  return <SmallLabel>{letter}</SmallLabel>;
}

// like CharacterInfo but not a class
export interface CardInfo {
  id: string;
  name: string;
  ability: string | null;
  roleType: RoleType;
  firstNight: NightAction | null;
  otherNights: NightAction | null;
}

const cardStyle = css`
  display: flex;
  position: relative;
  width: fit-content;
  align-items: center;
  border: 2px solid #eee;
  background: #eee;
  border-radius: 0.25rem;
  padding: 0.5rem;
  margin: 0.5rem 0;
  cursor: pointer;
  user-select: none;

  &:hover {
    @media (hover: hover) {
      border-color: rgb(0, 170, 255);
    }
  }

  &.selected {
    border-color: rgb(153, 0, 255);
  }

  &.bluff-selected {
    border-color: rgb(255, 0, 81);
  }

  &.not-needed {
    opacity: 60%;
  }
`;

export function CharacterCard(props: {
  character: CardInfo;
  onClick?: React.MouseEventHandler<HTMLElement>;
  selected?: boolean;
  bluffSelected?: boolean;
  notNeeded?: boolean;
}): React.JSX.Element {
  const { character } = props;
  const { roleType } = character;
  const needsLabel = ["outsider", "minion"].includes(roleType);
  return (
    <div
      css={cardStyle}
      className={classnames(
        { selected: props.selected },
        { "bluff-selected": props.bluffSelected },
        { "not-needed": props.notNeeded },
      )}
      onClick={props.onClick}
    >
      {needsLabel && <RoleLabel roleType={roleType} />}
      <CharacterIconElement {...character} />
      &nbsp;&nbsp;
      <span className={characterClass(character)}>{character.name}</span>
    </div>
  );
}

export function CharacterSelection(
  props: CharacterSelectionVars & { doneRoles: string[] } & {
    selectBluffs: boolean;
  },
): React.JSX.Element {
  const chars = useContext(CharacterContext);
  const { selection, bluffs } = props;

  function handleClick(
    char: CharacterInfo,
  ): (ev: React.MouseEvent<HTMLElement>) => void {
    return () => {
      if (props.selectBluffs) {
        bluffs.dispatch({ type: "toggle", id: char.id });
        selection.dispatch({ type: "deselect", id: char.id });
      } else {
        selection.dispatch({ type: "toggle", id: char.id });
        bluffs.dispatch({ type: "deselect", id: char.id });
      }
    };
  }

  return (
    <div id="characters">
      {["townsfolk", "outsider", "minion", "demon"].map((roleType) => (
        <Columns key={`${roleType}-roles`} numColumns={2}>
          {chars
            .filter((char) => char.roleType == roleType)
            .map((char) => {
              const selected = selection.chars.has(char.id);
              const notNeeded = !selected && props.doneRoles.includes(roleType);
              return (
                <CharacterCard
                  character={char}
                  key={char.id}
                  selected={selected}
                  bluffSelected={bluffs.chars.has(char.id)}
                  notNeeded={notNeeded}
                  onClick={handleClick(char)}
                />
              );
            })}
        </Columns>
      ))}
    </div>
  );
}
