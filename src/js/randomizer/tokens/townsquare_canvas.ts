import { BagCharacter } from "../../botc/setup";
import {
  RenderingContext2D,
  drawTextAlongArc,
  moveToAngle,
  setCanvasResolution,
} from "./canvas";
import { drawToken } from "./token_canvas";
import classnames from "classnames";
import React, { useRef, useEffect, useState } from "react";

const TWOPI = 2 * Math.PI;

// Draw n circled at (0, 0). The circle accommodates two digits.
function drawCircledNumber(
  ctx: RenderingContext2D,
  n: number,
  bgColor: string
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
  radius: number
) {
  const startAngle = (TWOPI - arcAngle) / 2;
  const anglePerChar = arcAngle / (characters.length - 1);
  const firstNightOrder = characters.filter((c) => c.firstNight != null);
  firstNightOrder.sort((c1, c2) =>
    c1.firstNight == null || c2.firstNight == null
      ? 0
      : c1.firstNight.index - c2.firstNight.index
  );
  const otherNightsOrder = characters.filter((c) => c.otherNights != null);
  otherNightsOrder.sort((c1, c2) =>
    c1.otherNights == null || c2.otherNights == null
      ? 0
      : c1.otherNights.index - c2.otherNights.index
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
      const angle = 45;

      let idx = firstNightOrder.findIndex((c) => c.id === char.id);
      if (idx >= 0) {
        ctx.save();
        // move to center of circle first
        ctx.translate(120, 120);
        moveToAngle(ctx, numberRadius, angle);
        drawCircledNumber(ctx, idx + 1, "#ffd876");
        ctx.restore();
      }

      idx = otherNightsOrder.findIndex((c) => c.id === char.id);
      if (idx >= 0) {
        ctx.save();
        // move to center of circle first
        ctx.translate(120, 120);
        moveToAngle(ctx, numberRadius, 180 - angle);
        drawCircledNumber(ctx, idx + 1, "#ffd876");
        ctx.restore();
      }
      ctx.restore();
      return r;
    })
  );
  return;
}

function drawTitle(
  ctx: RenderingContext2D,
  title: string,
  x: number,
  y: number
) {
  ctx.save();
  ctx.font = "24pt Barlow";
  ctx.fillStyle = "#606060";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(title, x, y);
  ctx.restore();
}

async function drawBluffs(
  ctx: RenderingContext2D,
  bluffs: BagCharacter[]
): Promise<void> {
  if (bluffs.length == 0) {
    return;
  }
  // draw Bluffs heading
  ctx.save();
  ctx.font = "bold 20pt Barlow";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#404040";
  ctx.fillText("Bluffs", 0, 0);
  const metrics = ctx.measureText("M");
  const height = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
  const deltaY = height * 1.5;
  ctx.restore();

  const gapBetween = 10;
  await Promise.all(
    bluffs.map((bluff, i) => {
      ctx.save();
      ctx.translate(i * (120 * 2 + gapBetween), deltaY);
      const r = drawToken(ctx, bluff);
      ctx.restore();
      return r;
    })
  );
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

interface TownsquareData {
  bag: BagCharacter[];
  players: string[];
  title: string;
  outsideBag: BagCharacter[];
  bluffs: BagCharacter[];
}

async function drawTownsquare(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  data: TownsquareData
): Promise<void> {
  const { bag, players, title } = data;
  const numPlayers = bag.length;
  const arcAngle = townsquareArcAngle(numPlayers);
  const radius = townsquareRadius(numPlayers);

  // set up a high-resolution canvas
  const margin = 10;
  // remove some whitespace due to a missing part of the arc
  // const unneededHeight = radius * (1 - Math.cos((TWOPI - arcAngle) / 2)) - 100;
  setCanvasResolution(
    canvas,
    radius * 2 + margin * 2,
    radius * 2 + margin * 2 + 100,
    3
  );
  const aspectRatio = canvas.height / canvas.width;
  // set a fixed, small display size
  if (canvas instanceof HTMLCanvasElement) {
    canvas.style.width = "600px";
    canvas.style.height = `${600 * aspectRatio}`;
  }

  // draw the tokens
  const ctx: RenderingContext2D | null = canvas.getContext(
    "2d"
  ) as RenderingContext2D | null;
  if (!ctx) {
    return;
  }
  ctx.save();
  ctx.translate(radius + margin, radius + margin);
  ctx.scale(0.75, 0.75);
  await drawCharactersArc(ctx, bag, players, arcAngle, radius);

  // draw the title
  const titleY = radius * Math.cos((TWOPI - arcAngle) / 2) + 120;
  drawTitle(ctx, title, 0, titleY);

  // draw other characters
  ctx.save();
  ctx.translate(-radius - 60, titleY + 100);
  await drawBluffs(ctx, data.bluffs);
  ctx.restore();

  ctx.restore();
}

export function TownsquareCanvas(props: TownsquareData): JSX.Element {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    const canvas = ref.current;
    drawTownsquare(canvas, props);
  }, []);

  return React.createElement("canvas", { ref });
}

export function TownsquareImage(props: TownsquareData): JSX.Element {
  // dummy width and height will be set by drawTownsquare
  const canvas = new OffscreenCanvas(0, 0);

  const [img, setImg] = useState<{ dataURL: string; blob: Blob } | null>(null);

  function copyImageToClipboard() {
    if (!img) {
      return;
    }
    // not supported by Firefox
    if ("ClipboardItem" in window) {
      const data = [new ClipboardItem({ [img.blob.type]: img.blob })];
      window.navigator.clipboard.write(data).then(
        () => {
          // TODO: would be nice to have a toast here
        },
        (err) => {
          console.warn(`could not copy to clipboard: ${err}`);
        }
      );
    } else {
      console.warn("image copy not supported by browser");
    }
  }

  useEffect(() => {
    drawTownsquare(canvas, props).then(() => {
      canvas.convertToBlob().then((blob) => {
        const dataURL = URL.createObjectURL(blob);
        setImg({ dataURL, blob });
      });
    });
  }, [props]);

  return React.createElement("img", {
    className: classnames("townsquare", { hidden: !img }),
    width: "80%",
    src: img ? img.dataURL : "",
    onClick: () => copyImageToClipboard(),
  });
}
