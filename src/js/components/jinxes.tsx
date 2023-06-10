import { getCharacter } from "../botc/roles";
import { Script } from "../botc/script";
import { CharacterIconElement } from "./character_icon";
import React from "react";

export function Jinxes({ script }: { script: Script }): JSX.Element {
  if (script.jinxes.length == 0) {
    return <></>;
  }
  return (
    <div className="jinxes details">
      {script.jinxes.map((jinx) => {
        return (
          <div className="jinx" key={`${jinx.character1}-${jinx.character2}`}>
            {[jinx.character1, jinx.character2].map((id) => {
              const name = getCharacter(id).name;
              return <CharacterIconElement id={id} name={name} key={id} />;
            })}
            {jinx.description}
          </div>
        );
      })}
    </div>
  );
}
