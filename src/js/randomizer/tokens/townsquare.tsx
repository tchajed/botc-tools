import React, { useEffect, useRef } from 'react';
import { renderToString } from 'react-dom/server';
import { Canvg } from 'canvg';
import { BagCharacter } from '../../botc/setup';
import { charKey } from '../bag';
import { TokenSvg } from './token_svg';

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

  const img: React.MutableRefObject<HTMLImageElement | null> = useRef(null);

  // This component returns an empty <img> and then asynchronously runs svgToPng
  // to convert it to PNG data (this uses a hidden canvas which isn't relevant
  // to React). Here we take the result of that conversion when it's complete
  // and attach it to the empty image. In order to make this work we need a ref
  // so that this effect can reference the generated HTML element directly.
  useEffect(() => {
    svgToPng(svgText).then((pngData) => {
      if (img.current) {
        img.current.src = pngData;
      }
    });
  }, [svgText]);

  return <img className="townsquare" height={300} width={300} ref={img}></img>;
}
