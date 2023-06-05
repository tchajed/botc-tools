import React from "react";
import { roles } from "../src/js/botc/roles";
import { TokenSvg } from "../src/js/randomizer/tokens/token_svg";

export function AllTokens(): JSX.Element {
  const characters = [...roles.entries()].map(([_, character]) => character);
  const numColumns = 6;
  const numRows = Math.ceil(characters.length / numColumns);
  return <div className="main">
    <svg width="100%" viewBox={`0 0 ${240 * numColumns} ${240 * numRows}`} scale="0.2">
      {characters.map((char, i) => {
        const column = i % numColumns;
        const row = Math.floor(i / numColumns);
        return <TokenSvg character={char} x={column * 240} y={row * 240} key={char.id} />
      })}
    </svg>
  </div>
}
