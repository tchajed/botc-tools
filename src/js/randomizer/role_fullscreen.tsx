import { useContext } from "react";
import { CharacterContext } from "./character_context";
import React from "react";
import classnames from "classnames";
import { characterClass } from "../views";
import { CharacterIconElement } from "../views_react";

export function FullscreenRole(props: {
  fsRole: string | null,
  setFsRole: (r: null) => void,
}): JSX.Element {
  const characters = useContext(CharacterContext);
  const id = props.fsRole;
  if (id == null) {
    return <div className="fullscreen hidden"></div>;
  }
  const char = characters.find(c => c.id == id);
  if (!char) {
    console.error(`invalid character ${id} for fullscreen`);
    return <div></div>;
  }

  function handleClick() {
    props.setFsRole(null);
  }

  return <div className="fullscreen" onClick={handleClick}>
    <div className={classnames(characterClass(char), 'character')}>
      <CharacterIconElement {...char} />
      <span className='name'>{char.name}</span>
    </div>
  </div>;
}
