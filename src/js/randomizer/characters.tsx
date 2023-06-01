import React from "react";
import { CharacterInfo } from "../botc/roles";
import { Columns } from "./columns";
import classnames from "classnames";
import { iconPath } from "../views";

function RoleLabel(props: { roleType: string }): JSX.Element {
  var letter = props.roleType.charAt(0).toUpperCase();
  return <span className='role-label'>{letter}</span>;
}

function CharacterIconElement(props: { name: string, id: string }): JSX.Element {
  let { id } = props;
  if (!iconPath(id)) {
    return <></>;
  }
  return <div className="img-container">
    <img className="char-icon"
      src={iconPath(id)} alt={props.name} />
  </div>;
}

export function CharacterCard(props: {
  character: CharacterInfo,
  onClick?: React.MouseEventHandler<HTMLElement>,
  selected: boolean
}): JSX.Element {
  let { character } = props;
  let { roleType } = character;
  let needsLabel = ["outsider", "minion"].includes(roleType);
  return <div
    className={classnames(
      character.evil ? "evil" : "good",
      "character",
      { "selected": props.selected })}
    onClick={props.onClick}>
    {needsLabel && <RoleLabel roleType={roleType} />}
    <CharacterIconElement {...character} />
    <span className='name'>{character.name}</span>
  </div>;
}

export type Selection = Set<string>;

export type SelAction = {
  type: "toggle",
  id: string,
}

export function selectionReducer(selection: Selection, action: SelAction): Selection {
  var newSelection = new Set(selection);
  switch (action.type) {
    case "toggle": {
      if (newSelection.has(action.id)) {
        newSelection.delete(action.id);
      } else {
        newSelection.add(action.id);
      }
      return newSelection;
    }
  }
}

interface SelectionVar {
  selection: Selection,
  dispatch: (a: SelAction) => void,
}

export function CharacterSelection(props:
  { characters: CharacterInfo[], } &
  SelectionVar): JSX.Element {
  let chars = props.characters;
  let { selection, dispatch } = props;

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
