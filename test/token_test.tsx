import { roles } from "../src/js/botc/roles";
import { TokenCanvas } from "../src/js/randomizer/tokens/token_canvas";
import React from "react";

/** All the tokens */
export function AllTokens(): JSX.Element {
  const characters = [...roles.entries()].map(([_, character]) => character);
  return (
    <div className="main">
      {characters.map((char) => {
        return <TokenCanvas character={char} key={char.id} size={"120px"} />;
      })}
    </div>
  );
}
