import images from '../../assets/icons/*.webp';
import React from "react";

export function iconPath(id: string): string {
  return images[`Icon_${id}`];
}

export function characterClass(character: { roleType: string }): string {
  switch (character.roleType) {
    case "townsfolk":
    case "outsider":
      return "good";
    case "minion":
    case "demon":
      return "evil";
    case "fabled":
      return "fabled";
    default:
      return "";
  }
}
export function CharacterIconElement(props: {
  name: string,
  id: string
}): JSX.Element {
  let { id } = props;
  if (!iconPath(id)) {
    return <></>;
  }
  return <div className="img-container">
    <img className="char-icon"
      src={iconPath(id)} alt={props.name} />
  </div>;
}
