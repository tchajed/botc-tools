import { roles } from "../src/js/botc/roles";
import { TokenCanvas } from "../src/js/randomizer/tokens/token_canvas";
import { Global, css } from "@emotion/react";
import { GlobalStyle } from "styles/global_style";

/** All the tokens */
export function AllTokens(): JSX.Element {
  const characters = [...roles.entries()].map(([_, character]) => character);
  return (
    <div className="main">
      <Global
        styles={[
          GlobalStyle,
          css`
            .main {
              max-width: calc(5 * 120px);
              margin: auto;
            }
          `,
        ]}
      />
      {characters.map((char) => {
        return <TokenCanvas character={char} key={char.id} size={"120px"} />;
      })}
    </div>
  );
}
