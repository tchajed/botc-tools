import React from "react";
import { iconPath } from "./views";

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
