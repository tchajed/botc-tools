import React from 'react';
import { iconPath } from '../../views';
import { CharacterInfo } from '../../botc/roles';
import { splitSelectedChars } from '../../botc/setup';
import { CardInfo } from '../characters';
import { Ranking } from '../bag';

const LINE_MAX = [25, 32, 30, 35, 35];

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


function charKey(character: CardInfo & { riotNum?: number }): string {
  return character.riotNum ? `${character.id}-${character.riotNum}` : character.id;
}

export function TokenSvg(props: { character: CardInfo & { riotNum?: number }, x: number, y: number }): JSX.Element {
  const { character } = props;
  const { name, ability } = character;
  let startOffset = 285 - 70 / 13 * name.length;

  const abilityLines = splitLines(ability || "");

  return <g transform={`translate(${props.x}, ${props.y - 35})`}>
    <circle
      style={{ fill: "#e0e0e0", stroke: "#101010", "strokeWidth": 2 }}
      cx="113.38607"
      cy="147.34323"
      r="110.615341" />
    <text style={{ "fontSize": "13px" }} x="113" y="85" textAnchor="middle" >
      {abilityLines.map((line, i) => {
        return <tspan x="113" dy={i == 0 ? "0" : "1.2em"} key={i}>{line}</tspan>;
      })}
    </text>
    <image href={iconPath(character.id)} height="90" width="90" transform="translate(-45, -45)" x="113" y="180" > </image>
    <path
      visibility="hidden"
      style={{ "stroke": "#ff0000" }}
      d="m 103.38607,54.264131 c -51.081237,0 -92.499999,41.68376 -92.499999,93.080069 0,51.39632 41.418762,93.07813 92.499999,93.07813 51.08123,0 92.5,-41.68181 92.5,-93.07813 0,-51.396309 -41.41877,-93.080069 -92.5,-93.080069 z m 0,1.283203 c 50.38347,0 91.21679,41.089618 91.21679,91.796866 0,50.70726 -40.83332,91.79493 -91.21679,91.79493 -50.38347,0 -91.218749,-41.08767 -91.218749,-91.79493 0,-50.707248 40.835279,-91.796866 91.218749,-91.796866 z"
      transform="translate(10, 10)"
      id={`innerCircle-${charKey(character)}`} />
    <text style={{ "fontSize": "24px", "fontWeight": 700 }}>
      <textPath href={`#innerCircle-${charKey(character)}`} startOffset={startOffset}>
        {character.name.toUpperCase()}
      </textPath>
    </text>
  </g>
}

function degToRad(deg: number): number {
  return deg * Math.PI / 180;
}

function sinDeg(deg: number): number {
  return Math.sin(degToRad(deg));
}

function cosDeg(deg: number): number {
  return Math.cos(degToRad(deg));
}

function playerAngle(usableDeg: number, n: number, i: number): number {
  // + 270 is a rotation to start at the bottom
  const start = (360 - usableDeg) / 2 - 270;
  const increment = usableDeg / (n - 1);
  return start + increment * i;
}

function playerPosition(usableDeg: number, r: number, n: number, i: number): { x: number, y: number } {
  const theta = playerAngle(usableDeg, n, i);
  return { x: r * cosDeg(theta), y: r * sinDeg(theta) };
}

function boundingRect(poss: { x: number, y: number }[]): { xmin: number, xmax: number, ymin: number, ymax: number } {
  const xs = poss.map(p => p.x);
  const ys = poss.map(p => p.y);
  return {
    xmin: Math.min(...xs), xmax: Math.max(...xs),
    ymin: Math.min(...ys), ymax: Math.max(...ys)
  };
}

export function Townsquare(props: {
  characters: CharacterInfo[],
  numPlayers: number,
  ranking: Ranking,
  selection: Set<string>,
}): JSX.Element {
  const { characters, numPlayers, selection } = props;
  let { bag } = splitSelectedChars(characters, selection, numPlayers);
  bag.sort((c1, c2) => props.ranking[charKey(c1)] - props.ranking[charKey(c2)]);
  const n = bag.length;
  var usableDeg = 270;
  if (n <= 6) {
    usableDeg = 180;
  }
  if (n == 7) {
    usableDeg = 230;
  }
  if (n == 1) {
    return <svg>
      <TokenSvg x={0} y={0} character={bag[0]} />
    </svg>
  }
  var radius = 600;
  if (n > 11) {
    radius = 750;
  }
  const positions = [...Array(n).keys()].map(i =>
    playerPosition(usableDeg, radius, n, i)
  );
  const bounds = boundingRect(positions);
  const width = bounds.xmax - bounds.xmin + 230;
  const height = bounds.ymax - bounds.ymin + 230;
  return <svg width={500} height={500} viewBox={`${bounds.xmin} ${bounds.ymin} ${width} ${height}`}>
    {bag.map((c, i) => {
      const key = charKey(c);
      const { x, y } = positions[i];
      return <TokenSvg key={key} x={x} y={y} character={c} />;
    })}
  </svg>
}
