import React, { useContext } from "react";
import { CharacterInfo, RoleType } from "../botc/roles";
import { Columns } from "./columns";
import classnames from "classnames";
import { characterClass } from "../views";
import { CharacterContext } from "./character_context";
import { actualDistribution } from "../botc/setup";
import { CharacterIconElement } from "../views_react";

function RoleLabel(props: { roleType: string }): JSX.Element {
  var letter = props.roleType.charAt(0).toUpperCase();
  return <span className='role-label'>{letter}</span>;
}

// like CharacterInfo but not a class
export interface CardInfo {
  id: string;
  name: string;
  good: boolean;
  roleType: RoleType,
}

export function CharacterCard(props: {
  character: CardInfo,
  onClick?: React.MouseEventHandler<HTMLElement>,
  selected: boolean
}): JSX.Element {
  let { character } = props;
  let { roleType } = character;
  let needsLabel = ["outsider", "minion"].includes(roleType);
  return <div
    className={classnames(
      characterClass(character),
      "character",
      { "selected": props.selected })}
    onClick={props.onClick}>
    {needsLabel && <RoleLabel roleType={roleType} />}
    <CharacterIconElement {...character} />
    <span className='name'>{character.name}</span>
  </div>;
}

export type Selection = Set<string>;

export type SelAction =
  {
    type: "toggle",
    id: string,
  } | {
    type: "set all",
    ids: string[],
  } | {
    type: "clear",
  }


/** Get the characters that should be initially selected.
 *
 * If the script has a lone demon, it is automatically added.
 */
export function initialSelection(characters: CharacterInfo[]): Set<string> {
  var sel = new Set<string>();
  const totalDistribution = actualDistribution(characters);
  if (totalDistribution.demon == 1) {
    for (const c of characters) {
      if (c.roleType == "demon") { sel.add(c.id); }
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
  toAdd.forEach(x => s.add(x));
}

export function createSelectionReducer(characters: CharacterInfo[])
  : (selection: Selection, action: SelAction) => Selection {
  const fabled = new Set<string>();
  for (const c of characters) {
    if (c.roleType == "fabled") {
      fabled.add(c.id);
    }
  }
  return (selection: Selection, action: SelAction) => {
    var newSelection = new Set(selection);
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
  }
}

interface SelectionVar {
  selection: Selection,
  selDispatch: (a: SelAction) => void,
}

export function CharacterSelection(props: SelectionVar): JSX.Element {
  const chars = useContext(CharacterContext);
  let { selection, selDispatch: dispatch } = props;

  return <div>
    {["townsfolk", "outsider", "minion", "demon"].map(roleType =>
      <div className="characters" key={`${roleType}-roles`}>
        <Columns numColumns={2}>
          {chars.filter(char => char.roleType == roleType).map(char =>
            <CharacterCard
              character={char}
              key={char.id}
              selected={selection.has(char.id)}
              onClick={() => dispatch({ type: "toggle", id: char.id })} />
          )}
        </Columns>
      </div>
    )}
  </div>;
}
