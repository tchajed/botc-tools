import { getCharacter } from "../botc/roles";
import { Script } from "../botc/script";
import { CharacterIconElement } from "./character_icon";
import { css } from "@emotion/react";

export function Jinxes({ script }: { script: Script }): JSX.Element {
  if (script.jinxes.length == 0) {
    return <></>;
  }
  return (
    <div
      className="jinxes details"
      css={css`
        text-align: left;
        font-size: 8pt;
        max-width: 330px;
        margin-left: auto;
        margin-top: 2rem;
      `}
    >
      {script.jinxes.map((jinx) => {
        return (
          <div className="jinx" key={`${jinx.character1}-${jinx.character2}`}>
            {[jinx.character1, jinx.character2].map((id) => {
              const name = getCharacter(id).name;
              return (
                <CharacterIconElement
                  id={id}
                  name={name}
                  key={id}
                  css={css`
                    vertical-align: middle;
                  `}
                />
              );
            })}
            {jinx.description}
          </div>
        );
      })}
    </div>
  );
}
