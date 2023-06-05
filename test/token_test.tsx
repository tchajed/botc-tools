import React from "react";
import { CharacterInfo, roles } from "../src/js/botc/roles";
import { TokenSvg } from "../src/js/randomizer/tokens/token_svg";

/** An SVG with all character tokens, rendered in a nice grid. */
function TokenGrid(props: {
  characters: CharacterInfo[],
  numColumns: number
}): JSX.Element {
  const { characters, numColumns } = props;
  const numRows = Math.ceil(characters.length / numColumns);
  return <svg
    width="100%"
    viewBox={`0 0 ${240 * numColumns} ${240 * numRows}`}>
    {characters.map((char, i) => {
      const column = i % numColumns;
      const row = Math.floor(i / numColumns);
      return <TokenSvg character={char} x={column * 240} y={row * 240} key={char.id} />
    })}
  </svg>
}

export function AllTokens(): JSX.Element {
  const characters = [...roles.entries()].map(([_, character]) => character);
  return <div className="main">
    <TokenGrid characters={characters} numColumns={6} />
  </div>
}
