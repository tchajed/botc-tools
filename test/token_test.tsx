import { CharacterInfo, roles } from "../src/js/botc/roles";
import { TokenCanvas } from "../src/js/randomizer/tokens/token_canvas";
import React from "react";

/** An SVG with all character tokens, rendered in a nice grid. */
function TokenGrid(props: {
  characters: CharacterInfo[];
  numColumns: number;
}): JSX.Element {
  const { characters, numColumns: _ } = props;
  return (
    <div>
      {characters.map((char) => {
        return <TokenCanvas character={char} key={char.id} size={100} />;
      })}
    </div>
  );
}

export function AllTokens(): JSX.Element {
  const characters = [...roles.entries()].map(([_, character]) => character);
  return (
    <div className="main">
      <TokenGrid characters={characters} numColumns={6} />
    </div>
  );
}
