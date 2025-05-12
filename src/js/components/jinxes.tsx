import { Script } from "../botc/script";
import { CharacterIconElement } from "./character_icon";
import { css } from "@emotion/react";

export function Jinxes({ script }: { script: Script }): React.JSX.Element {
  if (script.jinxes.length == 0) {
    return <></>;
  }

  return (
    <table
      css={css`
        max-width: 330px;
        font-size: 9pt;
        margin-left: auto;
        border-spacing: 2px;
      `}
    >
      <tbody>
        {script.jinxes.map((jinx) => {
          return (
            <tr key={`${jinx.character1}-${jinx.character2}`}>
              <td>
                <CharacterIconElement id={jinx.character1} />
              </td>
              <td
                css={css`
                  padding-left: 0.2rem;
                `}
              >
                <CharacterIconElement id={jinx.character2} />
              </td>
              <td
                css={css`
                  padding-left: 0.5rem;
                `}
              >
                {jinx.description}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
