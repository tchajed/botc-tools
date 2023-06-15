/* eslint-disable @typescript-eslint/no-unused-vars */
import { BagCharacter } from "../../botc/setup";
import { setCanvasResolution } from "./canvas";
import { drawToken } from "./token_canvas";
import React, { useRef, useEffect } from "react";

const TWOPI = 2 * Math.PI;

export function drawTownsquare(
  ctx: CanvasRenderingContext2D,
  characters: BagCharacter[],
  arcAngle: number,
  radius: number
) {
  const startAngle = (TWOPI - arcAngle) / 2;
  const anglePerChar = arcAngle / (characters.length - 1);
  characters.forEach((char, i) => {
    ctx.save();
    const theta = startAngle + i * anglePerChar;
    ctx.rotate(theta);
    ctx.translate(0, radius);
    ctx.rotate(-theta);
    ctx.translate(-120, -120);
    drawToken(ctx, char);
    ctx.restore();
  });
  return;
}

function townsquareArcAngle(numPlayers: number): number {
  let circleFraction = 0;
  if (numPlayers <= 6) {
    circleFraction = 1 / 2;
  } else if (numPlayers >= 10) {
    circleFraction = 3 / 4;
  } else {
    circleFraction = 1 / 2 + (1 / 4) * ((numPlayers - 6) / (10 - 6));
  }
  return circleFraction * TWOPI;
}

export function TownsquareCanvas(props: { bag: BagCharacter[] }): JSX.Element {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    const canvas = ref.current;

    const numPlayers = props.bag.length;
    const arcAngle = townsquareArcAngle(numPlayers);
    const perPlayerArc = arcAngle / (numPlayers - 1);

    // the gap between tokens should accommodate both radii plus a gap
    const desiredTokenGap = 2 * 120 + 30;
    // the gap between tokens is perPlayerArc * radius; this inverts that
    // formula
    const radius = desiredTokenGap / perPlayerArc;
    // draw at a high resolution
    setCanvasResolution(canvas, radius * 2 + 20, radius * 2 + 20, 2);
    canvas.style.width = "600px";
    canvas.style.height = "600px";
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    ctx.translate(radius + 10, radius + 10);
    ctx.scale(0.8, 0.8);
    drawTownsquare(ctx, props.bag, arcAngle, radius);
  }, []);

  return React.createElement("canvas", { ref });
}
