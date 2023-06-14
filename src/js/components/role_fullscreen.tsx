import { getCharacter } from "../botc/roles";
import { CharacterIconElement, characterClass } from "./character_icon";
import { Fullscreen } from "./fullscreen_modal";
import classnames from "classnames";
import React from "react";

export function FullscreenRole(props: {
  fsRole: string | null;
  setFsRole: (r: null) => void;
}): JSX.Element {
  return (
    <Fullscreen
      data={props.fsRole}
      setData={props.setFsRole}
      render={(id) => {
        const char = getCharacter(id);
        return (
          <div className={classnames(characterClass(char), "character")}>
            <CharacterIconElement {...char} />
            &nbsp;&nbsp;
            <span className="name">{char.name}</span>
          </div>
        );
      }}
    />
  );
}
