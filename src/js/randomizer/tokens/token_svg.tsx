import React from 'react';
import { iconPath } from '../../views';
import { charKey } from '../bag';
import { BagCharacter } from '../../botc/setup';

const LINE_MAX = [22, 32, 32, 35, 35];

function splitLines(ability: string): string[] {
  var lines: string[] = [];
  var line = "";
  var rest = ability;
  while (rest.length > 0) {
    const match = /[,: ]/.exec(rest);
    if (match == null) {
      line += rest;
      break;
    }
    const m = rest.substring(0, match.index + match[0].length);
    if ((line + m).length > LINE_MAX[lines.length]) {
      // finish this line, start new one
      lines.push(line);
      line = "";
    }
    line += m;
    rest = rest.substring(m.length);
  }
  if (line != "") {
    lines.push(line);
  }
  return lines.map(l => l.trimEnd());
}

export function TokenSvg(props: { character: BagCharacter, x: number, y: number }): JSX.Element {
  const { character } = props;
  const { name, ability } = character;
  // let startOffset = 285 - 70 / 13 * name.length;

  const abilityLines = splitLines(ability || "");

  var firstYoff = "0";
  if (abilityLines.length <= 2) {
    firstYoff = "1.2em";
  }

  return <g transform={`translate(${props.x}, ${props.y - 35})`}>
    <circle
      style={{ fill: "#e0e0e0", stroke: "none", "strokeWidth": 2 }}
      cx="113.38607"
      cy="147.34323"
      r="110.615341" />
    <text style={{ "fontSize": "13px", "fontFamily": "'Barlow'" }} x="113" y="80" textAnchor="middle" >
      {abilityLines.map((line, i) => {
        return <tspan x="113" dy={i == 0 ? firstYoff : "1.2em"} key={i}>{line}</tspan>;
      })}
    </text>
    <image href={iconPath(character.id)} height="90" width="90" transform="translate(-45, -45)" x="113" y="180" > </image>
    <path
      visibility="hidden"
      style={{ "stroke": "#ff0000" }}
      d="m 103.38607,54.264131 c -51.081237,0 -92.499999,41.68376 -92.499999,93.080069 0,51.39632 41.418762,93.07813 92.499999,93.07813 51.08123,0 92.5,-41.68181 92.5,-93.07813 0,-51.396309 -41.41877,-93.080069 -92.5,-93.080069 z m 0,1.283203 c 50.38347,0 91.21679,41.089618 91.21679,91.796866 0,50.70726 -40.83332,91.79493 -91.21679,91.79493 -50.38347,0 -91.218749,-41.08767 -91.218749,-91.79493 0,-50.707248 40.835279,-91.796866 91.218749,-91.796866 z"
      transform="translate(10, 10)"
      id={`innerCircle-${charKey(character)}`} />
    <text style={{ "fontSize": "24px", "fontWeight": 700, "fontFamily": "'Barlow'" }} x="113" y="245" textAnchor='middle'>
      {name.toUpperCase()}
    </text>
  </g>
  // <textPath href={`#innerCircle-${charKey(character)}`} startOffset={startOffset}>
  // </textPath>
}
