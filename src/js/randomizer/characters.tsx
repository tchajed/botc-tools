import React, { useContext } from "react";
import { CharacterInfo, RoleType } from "../botc/roles";
import { Columns } from "./columns";
import classnames from "classnames";
import { CharacterContext } from "./character_context";
import { actualDistribution } from "../botc/setup";
import { CharacterIconElement, characterClass } from "../views";

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

/** Get the characters that should be initially selected.
 *
 * If the script has a lone demon, it is automatically added.
 */
export function initialSelection(characters: CharacterInfo[]): Set<string> {
  const sel = new Set<string>();
  const totalDistribution = actualDistribution(characters);
  if (totalDistribution.demon == 1) {
    for (const c of characters) {
      if (c.roleType == "demon") {
        sel.add(c.id);
      }
    }
  }
  for (const c of characters) {
    if (c.roleType == "fabled") {
      sel.add(c.id);
    }
  }
  return sel;
}

function addToSet<T>(s: Set<T>, toAdd: Set<T>) {
  toAdd.forEach((x) => s.add(x));
}

export function createSelectionReducer(
  characters: CharacterInfo[]
): (selection: Selection, action: SelAction) => Selection {
  const fabled = new Set<string>();
  for (const c of characters) {
    if (c.roleType == "fabled") {
      fabled.add(c.id);
    }
  }
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
        addToSet(newSelection, fabled);
        return newSelection;
      }
      case "set all": {
        const newSelection = new Set(action.ids);
        addToSet(newSelection, fabled);
        return newSelection;
      }
      case "clear": {
        return new Set(fabled);
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
