import React, { useEffect, useRef } from 'react';
import { iconPath } from '../../views';
import { CardInfo } from '../characters';
import { renderToString } from 'react-dom/server';
import { Canvg } from 'canvg';
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

export function Townsquare(props: { bag: BagCharacter[] }): JSX.Element {
  const { bag } = props;

  const n = bag.length;
  if (n == 1) {
    return <svg>
      <TokenSvg x={0} y={0} character={bag[0]} />
    </svg>
  }

  var usableDeg = 270;
  if (n <= 6) {
    usableDeg = 180;
  }
  if (n == 7) {
    usableDeg = 230;
  }
  var radius = 0;
  if (2 <= n && n < 9) {
    radius = 500;
  } else if (9 <= n && n <= 11) {
    radius = 600;
  } else if (n > 11) {
    radius = 750;
  }
  const positions = [...Array(n).keys()].map(i =>
    playerPosition(usableDeg, radius, n, i)
  );
  const bounds = boundingRect(positions);
  const width = bounds.xmax - bounds.xmin + 230;
  const height = bounds.ymax - bounds.ymin + 230;
  return <svg id="townsquare" width={3000} height={3000} viewBox={`${bounds.xmin} ${bounds.ymin} ${width} ${height}`}>
    {bag.map((c, i) => {
      const { x, y } = positions[i];
      return <TokenSvg key={charKey(c)} x={x} y={y} character={c} />;
    })}
  </svg>
}

async function svgToPng(svgText: string): Promise<string> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext('2d');
  const v = Canvg.fromString(ctx, svgText);
  v.start();
  await v.ready();
  const dataURL = canvas.toDataURL("image/png");
  v.stop();
  return dataURL;
}

export function TownsquareImage(props: { bag: BagCharacter[] }): JSX.Element {
  const svgText = renderToString(<Townsquare {...props} />);

  // TODO: can't figure out the type argument here
  const img: React.MutableRefObject<any> = useRef();

  // This component returns an empty <img> and then asynchronously runs svgToPng
  // to convert it to PNG data (this uses a hidden canvas which isn't relevant
  // to React). Here we take the result of that conversion when it's complete
  // and attach it to the empty image. In order to make this work we need a ref
  // so that this effect can reference the generated HTML element directly.
  useEffect(() => {
    svgToPng(svgText).then((pngData) => {
      if (img.current !== undefined && 'src' in img.current) {
        img.current.src = pngData;
      }
    });
  }, [svgText]);

  return <img className="townsquare" height={300} width={300} ref={img}></img>;
}
