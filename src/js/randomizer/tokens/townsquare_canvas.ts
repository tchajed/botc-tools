import { BagCharacter } from "../../botc/setup";
import {
  RenderingContext2D,
  drawTextAlongArc,
  moveToAngle,
  setCanvasResolution,
} from "./canvas";
import { drawToken } from "./token_canvas";
import React, { useRef, useEffect } from "react";

const TWOPI = 2 * Math.PI;

// Draw n circled at (0, 0). The circle accommodates two digits.
function drawCircledNumber(
  ctx: RenderingContext2D,
  n: number,
  bgColor: string,
) {
  ctx.save();

  // set text properties to measure the circle size
  ctx.font = "bold 18pt Barlow";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";

  ctx.save();
  ctx.beginPath();
  const r = ctx.measureText("88").width / 2;
  ctx.arc(0, 0, r * 1.1, 0, 2 * Math.PI);

  // add fill and stroke to this circle
  ctx.fillStyle = bgColor;
  ctx.strokeStyle = "1px dotted #000000";
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // hard-code black text
  ctx.fillText(`${n}`, 0, 0);
  ctx.restore();
}

function drawPlayerName(ctx: RenderingContext2D, name?: string) {
  if (!name) {
    return;
  }
  ctx.save();
  ctx.font = "16pt Barlow";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  // the fraction of the circumference the text will take
  const circumference = 2 * Math.PI * 120;
  const portionOfCircumference = ctx.measureText(name).width / circumference;
  // convert to an angle, and add some padding for space between letters
  const angle = portionOfCircumference * 2 * Math.PI * 1.1;
  drawTextAlongArc(ctx, name, 120, 120, 130, angle, true);
  ctx.restore();
}

export async function drawCharactersArc(
  ctx: RenderingContext2D,
  characters: BagCharacter[],
  players: string[],
  arcAngle: number,
  radius: number,
) {
  const startAngle = (TWOPI - arcAngle) / 2;
  const anglePerChar = arcAngle / (characters.length - 1);
  const firstNightOrder = characters.filter((c) => c.firstNight != null);
  firstNightOrder.sort((c1, c2) =>
    c1.firstNight == null || c2.firstNight == null
      ? 0
      : c1.firstNight.index - c2.firstNight.index,
  );
  const otherNightsOrder = characters.filter((c) => c.otherNights != null);
  otherNightsOrder.sort((c1, c2) =>
    c1.otherNights == null || c2.otherNights == null
      ? 0
      : c1.otherNights.index - c2.otherNights.index,
  );
  await Promise.all(
    characters.map((char, i) => {
      ctx.save();
      const theta = startAngle + i * anglePerChar;
      ctx.rotate(theta);
      ctx.translate(0, radius);
      ctx.rotate(-theta);
      ctx.translate(-120, -120);
      const r = drawToken(ctx, char);
      drawPlayerName(ctx, players[i]);

      const numberRadius = 124;
      const firstNightAngle = 90 + 45;
      const otherNightsAngle = 45;

      let idx = firstNightOrder.findIndex((c) => c.id === char.id);
      if (idx >= 0) {
        ctx.save();
        // move to center of circle first
        ctx.translate(120, 120);
        moveToAngle(ctx, numberRadius, firstNightAngle);
        drawCircledNumber(ctx, idx + 1, "#ffd876");
        ctx.restore();
      }

      idx = otherNightsOrder.findIndex((c) => c.id === char.id);
      if (idx >= 0) {
        ctx.save();
        // move to center of circle first
        ctx.translate(120, 120);
        moveToAngle(ctx, numberRadius, otherNightsAngle);
        drawCircledNumber(ctx, idx + 1, "#ffd876");
        ctx.restore();
      }
      ctx.restore();
      return r;
    }),
  );
  return;
}

function drawTitle(
  ctx: RenderingContext2D,
  title: string,
  x: number,
  y: number,
) {
  ctx.save();
  ctx.font = "24pt Barlow";
  ctx.fillStyle = "#606060";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(title, x, y);
  ctx.restore();
}

function setHeading(ctx: RenderingContext2D) {
  ctx.font = "bold 20pt Barlow";
  ctx.textBaseline = "top";
  ctx.textAlign = "center";
  ctx.fillStyle = "#404040";
}

function headingHeight(ctx: RenderingContext2D): number {
  ctx.save();
  setHeading(ctx);
  const metrics = ctx.measureText("M");
  const height = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
  ctx.restore();
  return height;
}

function drawHeading(ctx: RenderingContext2D, text: string) {
  ctx.save();
  setHeading(ctx);
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

async function drawCharactersRow(
  ctx: RenderingContext2D,
  characters: BagCharacter[],
): Promise<void> {
  const gapBetween = 10;
  await Promise.all(
    characters.map((char, i) => {
      ctx.save();
      ctx.translate(i * (120 * 2 + gapBetween), 0);
      const r = drawToken(ctx, char);
      ctx.restore();
      return r;
    }),
  );
}

async function drawBluffs(
  ctx: RenderingContext2D,
  bluffs: BagCharacter[],
): Promise<void> {
  if (bluffs.length == 0) {
    return;
  }
  // draw Bluffs heading
  ctx.save();
  ctx.translate(120, 0);
  drawHeading(ctx, "Bluffs");
  ctx.restore();
  const deltaY = headingHeight(ctx) * 1.2;

  ctx.save();
  ctx.translate(0, deltaY);
  await drawCharactersRow(ctx, bluffs);
  ctx.restore();
}

async function drawOutsideBag(
  ctx: RenderingContext2D,
  outsideBag: BagCharacter[],
): Promise<void> {
  if (outsideBag.length == 0) {
    return;
  }
  // draw heading
  ctx.save();
  ctx.translate(120, 0);
  drawHeading(ctx, "Others");
  ctx.restore();
  const deltaY = headingHeight(ctx) * 1.2;

  ctx.save();
  ctx.translate(0, deltaY);
  await drawCharactersRow(ctx, outsideBag);
  ctx.restore();
}

function townsquareArcAngle(numPlayers: number): number {
  let circleFraction = 0;
  if (numPlayers <= 5) {
    circleFraction = 1 / 2;
  } else if (numPlayers >= 10) {
    circleFraction = 3 / 4;
  } else {
    circleFraction = 1 / 2 + (1 / 4) * ((numPlayers - 5) / (10 - 5));
  }
  return circleFraction * TWOPI;
}

function townsquareRadius(numPlayers: number): number {
  const arcAngle = townsquareArcAngle(numPlayers);
  const perPlayerArc = arcAngle / (numPlayers - 1);

  // the gap between tokens should accommodate both radii plus a gap
  const desiredTokenGap = 2 * 120 + 40;
  // the gap between tokens is perPlayerArc * radius; this inverts that
  // formula
  const radius = desiredTokenGap / perPlayerArc;
  return radius;
}

export interface TownsquareData {
  bag: BagCharacter[];
  players: string[];
  title: string;
  outsideBag: BagCharacter[];
  bluffs: BagCharacter[];
}

const circleOtherGap = 100;
const othersBluffGap = 30;

export async function drawTownsquare(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  data: TownsquareData,
): Promise<void> {
  const { bag, players, title } = data;
  const numPlayers = bag.length;
  const arcAngle = townsquareArcAngle(numPlayers);
  const radius = townsquareRadius(numPlayers);

  // set up a high-resolution canvas
  const margin = 10;
  // remove some whitespace due to a missing part of the arc
  const unneededHeight = radius * (1 - Math.cos((TWOPI - arcAngle) / 2)) - 100;
  let heightAdjust = -unneededHeight;
  if (data.outsideBag.length > 0 || data.bluffs.length > 0) {
    heightAdjust = circleOtherGap + 60;
    if (data.outsideBag.length > 0 && data.bluffs.length > 0) {
      heightAdjust += othersBluffGap + 240;
    }
  }
  const width = radius * 2 + margin * 2;
  const height = radius * 2 + margin * 2 + heightAdjust;
  setCanvasResolution(canvas, width, height);
  const aspectRatio = canvas.height / canvas.width;
  // set a fixed, small display size
  if (canvas instanceof HTMLCanvasElement) {
    canvas.style.width = "600px";
    canvas.style.height = `${600 * aspectRatio}`;
  }

  const ctx: RenderingContext2D | null = canvas.getContext(
    "2d",
  ) as RenderingContext2D | null;
  if (!ctx) {
    return;
  }
  ctx.save();

  ctx.translate(radius + margin, radius + margin);
  ctx.scale(0.75, 0.75);

  const titleY = radius * Math.cos((TWOPI - arcAngle) / 2) + 120;
  drawTitle(ctx, title, 0, titleY);

  // draw the tokens
  await drawCharactersArc(ctx, bag, players, arcAngle, radius);

  // draw other characters
  ctx.save();
  ctx.translate(-radius - 120, titleY + circleOtherGap);
  if (data.outsideBag.length > 0) {
    await drawOutsideBag(ctx, data.outsideBag);
    ctx.translate(0, 1.2 * headingHeight(ctx) + 240 + othersBluffGap);
  }
  await drawBluffs(ctx, data.bluffs);
  ctx.restore();

  ctx.restore();
}

// Just an example, we actually use the image version so it can be dragged
// outside.
function _TownsquareCanvas(props: TownsquareData): JSX.Element {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    const canvas = ref.current;
    drawTownsquare(canvas, props);
  }, [props]);

  return React.createElement("canvas", { ref });
}
