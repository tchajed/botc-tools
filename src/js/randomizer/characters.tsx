import { RoleType } from "../botc/roles";
import {
  CharacterIconElement,
  characterClass,
} from "../components/character_icon";
import { CharacterContext } from "./character_context";
import { Columns } from "./columns";
import { Selection, SelAction } from "./selection";
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
  good: boolean;
  roleType: RoleType;
}

export function CharacterCard(props: {
  character: CardInfo;
  onClick?: React.MouseEventHandler<HTMLElement>;
  selected?: boolean;
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

interface SelectionVar {
  selection: Selection;
  selDispatch: (a: SelAction) => void;
}

export function CharacterSelection(
  props: SelectionVar & { doneRoles: string[] }
): JSX.Element {
  const chars = useContext(CharacterContext);
  const { selection, selDispatch: dispatch } = props;

  return (
    <div>
      {["townsfolk", "outsider", "minion", "demon"].map((roleType) => (
        <div className="characters" key={`${roleType}-roles`}>
          <Columns numColumns={2}>
            {chars
              .filter((char) => char.roleType == roleType)
              .map((char) => {
                const selected = selection.has(char.id);
                const notNeeded =
                  !selected && props.doneRoles.includes(roleType);
                return (
                  <CharacterCard
                    character={char}
                    key={char.id}
                    selected={selected}
                    notNeeded={notNeeded}
                    onClick={() => dispatch({ type: "toggle", id: char.id })}
                  />
                );
              })}
          </Columns>
        </div>
      ))}
    </div>
  );
}
