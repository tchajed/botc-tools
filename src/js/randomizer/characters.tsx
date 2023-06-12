import { CharacterInfo, RoleType } from "../botc/roles";
import {
  CharacterIconElement,
  characterClass,
} from "../components/character_icon";
import { CharacterContext } from "./character_context";
import { Columns } from "./columns";
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

export type Selection = Set<string>;

export type SelAction =
  | {
      type: "toggle";
      id: string;
    }
  | {
      type: "set all";
      ids: string[];
    }
  | {
      type: "clear";
    };

/** Get the characters that must be selected.
 *
 * If the script has a lone demon, it is automatically added.
 */
export function requiredSelection(characters: CharacterInfo[]): Set<string> {
  const required = new Set<string>();
  const demons = characters.filter((c) => c.roleType == "demon");
  const hasAtheist = characters.some((c) => c.id == "atheist");
  if (demons.length == 1 && !hasAtheist) {
    required.add(demons[0].id);
  }
  for (const c of characters) {
    if (c.roleType == "fabled") {
      required.add(c.id);
    }
  }
  return required;
}

export function initialSelection(characters: CharacterInfo[]): Set<string> {
  return requiredSelection(characters);
}

function addToSet<T>(s: Set<T>, toAdd: Set<T>) {
  toAdd.forEach((x) => s.add(x));
}

export function createSelectionReducer(
  characters: CharacterInfo[]
): (selection: Selection, action: SelAction) => Selection {
  const required = requiredSelection(characters);
  return (selection: Selection, action: SelAction) => {
    const newSelection = new Set(selection);
    switch (action.type) {
      case "toggle": {
        if (newSelection.has(action.id)) {
          newSelection.delete(action.id);
        } else {
          newSelection.add(action.id);
          if (action.id == "huntsman") {
            newSelection.add("damsel");
          }
        }
        addToSet(newSelection, required);
        return newSelection;
      }
      case "set all": {
        const newSelection = new Set(action.ids);
        addToSet(newSelection, required);
        return newSelection;
      }
      case "clear": {
        return new Set(required);
      }
    }
  };
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
