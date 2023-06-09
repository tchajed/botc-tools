import React from 'react';
import { iconPath } from '../../views';
import { BagCharacter } from '../../botc/setup';


/** Split an ability text into multiple lines. The algorithm is a simple greedy
 * one, with hard-coded constants for how many characters should go on each line
 * (since this fits into a circle, these numbers aren't all the same).
 *
 * This isn't perfect, since it doesn't take into account the actual text size.
 * More seriously the text should really be vertically centered to accomodate
 * really long ability texts.
 */
function splitLines(ability: string): string[] {
  const LINE_MAX = [25, 29, 29, 32, 35];
  const lines: string[] = [];
  let line = "";
  let rest = ability;
  while (rest.length > 0) {
    const match = /[ \n]/.exec(rest);
    if (match == null) {
      line += rest;
      break;
    }
    const m = rest.substring(0, match.index);
    if ((line + m).length > LINE_MAX[lines.length]) {
      // finish this line, start new one
      lines.push(line);
      line = "";
    }
    line += m + match[0];
    rest = rest.substring(m.length + match[0].length);
  }
  if (line != "") {
    lines.push(line);
  }
  return lines.map(l => l.trimEnd());
}

export function TokenSvg(props: { character: BagCharacter, x: number, y: number }): JSX.Element {
  const { character } = props;
  const { name, ability } = character;

  const abilityLines = splitLines(ability || "");

  let firstYoff = "0";
  if (abilityLines.length <= 2) {
    firstYoff = "1.2em";
  } else if (abilityLines.length >= 5) {
    firstYoff = "-1.2em";
  }

  // icon is placed first so text goes on top
  return <g transform={`translate(${props.x}, ${props.y})`}>
    <circle
      style={{ fill: "#e0e0e0", stroke: "none", "strokeWidth": 2 }}
      cx="120"
      cy="120"
      r="120" />
    <image href={iconPath(character.id)}
      x="120" y="150"
      height="90" width="90" transform="translate(-45, -45)"></image>
    <text style={{ "fontSize": "13px", "fontFamily": "'Barlow'" }}
      x="120" y="50" textAnchor="middle" >
      {abilityLines.map((line, i) => {
        return <tspan x="120" dy={i == 0 ? firstYoff : "1.2em"} key={i}>{line}</tspan>;
      })}
    </text>
    <text style={{ "fontSize": "24px", "fontWeight": 700, "fontFamily": "'Barlow'" }}
      x="120" y="215" textAnchor='middle'>
      {name.toUpperCase()}
    </text>
  </g>
}
