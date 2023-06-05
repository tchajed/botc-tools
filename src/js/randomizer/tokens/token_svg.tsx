import React from 'react';
import { iconPath } from '../../views';
import { BagCharacter } from '../../botc/setup';

const LINE_MAX = [23, 29, 29, 35, 35];

function splitLines(ability: string): string[] {
  var lines: string[] = [];
  var line = "";
  var rest = ability;
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

  var firstYoff = "0";
  if (abilityLines.length <= 2) {
    firstYoff = "1.2em";
  }

  return <g transform={`translate(${props.x}, ${props.y})`}>
    <circle
      style={{ fill: "#e0e0e0", stroke: "none", "strokeWidth": 2 }}
      cx="120"
      cy="120"
      r="120" />
    <text style={{ "fontSize": "13px", "fontFamily": "'Barlow'" }}
      x="120" y="50" textAnchor="middle" >
      {abilityLines.map((line, i) => {
        return <tspan x="120" dy={i == 0 ? firstYoff : "1.2em"} key={i}>{line}</tspan>;
      })}
    </text>
    <image href={iconPath(character.id)} height="90" width="90" transform="translate(-45, -45)" x="120" y="150" > </image>
    <text style={{ "fontSize": "24px", "fontWeight": 700, "fontFamily": "'Barlow'" }}
      x="120" y="215" textAnchor='middle'>
      {name.toUpperCase()}
    </text>
  </g>
}
