import { CharacterInfo, NightAction, RoleType } from "../../botc/roles";
import {
  CharacterIconElement,
  characterClass,
} from "../../components/character_icon";
import { CharacterContext } from "../character_context";
import { Columns } from "../columns";
import { CharacterSelectionVars } from "../selection";
import classnames from "classnames";
import React, { useContext } from "react";

function RoleLabel(props: { roleType: string }): JSX.Element {
  const letter = props.roleType.charAt(0).toUpperCase();
  return <span className="role-label">{letter}</span>;
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

export function CharacterCard(props: {
  character: CardInfo;
  onClick?: React.MouseEventHandler<HTMLElement>;
  selected?: boolean;
  bluffSelected?: boolean;
  notNeeded?: boolean;
}): JSX.Element {
  const { character } = props;
  const { roleType } = character;
  const needsLabel = ["outsider", "minion"].includes(roleType);
  return (
    <div
      className={classnames(
        characterClass(character),
        "character",
        { selected: props.selected },
        { "bluff-selected": props.bluffSelected },
        { "not-needed": props.notNeeded }
      )}
      onClick={props.onClick}
    >
      {needsLabel && <RoleLabel roleType={roleType} />}
      <CharacterIconElement {...character} />
      &nbsp;&nbsp;
      <span className="name">{character.name}</span>
    </div>
  );
}

export function CharacterSelection(
  props: CharacterSelectionVars & { doneRoles: string[] } & {
    selectBluffs: boolean;
  }
): JSX.Element {
  const chars = useContext(CharacterContext);
  const { selection, bluffs } = props;

  function handleClick(
    char: CharacterInfo
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
    <div>
      {["townsfolk", "outsider", "minion", "demon"].map((roleType) => (
        <div className="columns" key={`${roleType}-roles`}>
          <Columns numColumns={2}>
            {chars
              .filter((char) => char.roleType == roleType)
              .map((char) => {
                const selected = selection.chars.has(char.id);
                const notNeeded =
                  !selected && props.doneRoles.includes(roleType);
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
        </div>
      ))}
    </div>
  );
}
