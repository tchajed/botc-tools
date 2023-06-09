import React from "react";
import classnames from "classnames";
import { CharacterIconElement, characterClass } from "../views";
import { getCharacter } from "../botc/roles";

export function FullscreenRole(props: {
  fsRole: string | null;
  setFsRole: (r: null) => void;
}): JSX.Element {
  const id = props.fsRole;
  if (id == null) {
    return <div className="fullscreen hidden"></div>;
  }
  const char = getCharacter(id);

  function handleClick() {
    props.setFsRole(null);
  }

  return (
    <div className="fullscreen" onClick={handleClick}>
      <div className={classnames(characterClass(char), "character")}>
        <CharacterIconElement {...char} />
        <span className="name">{char.name}</span>
      </div>
    </div>
  );
}
