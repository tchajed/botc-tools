import { BagCharacter } from "../../botc/setup";
import { iconPath } from "../../components/character_icon";
import { drawTextAlongArc, setCanvasResolution } from "./canvas";
import React, { useEffect, useRef } from "react";

function splitLinesCircle(
  // measure the width of some text
  width: (text: string) => number,
  abilityText: string,
  radius: number,
  yStart: number,
  yDelta: number
): string[] {
  let text = abilityText;
  let y = yStart - 1.5 * yDelta;
  const lines: string[] = [];
  while (text.length > 0) {
    const lineWidth =
      2 * Math.sqrt(radius * radius - (radius - y) * (radius - y)) * 0.9;
    // the current line is text.slice(0, i);
    let i = -1;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const nextSplit = text.indexOf(" ", i + 1);
      // if there are no more spaces, just use the rest of the text
      if (nextSplit < 0) {
        if (width(text) >= lineWidth) {
          // don't change i
          break;
        } else {
          i = text.length;
          break;
        }
      }
      // we are proposing to set i to nextSplit + 1; if that would overflow the
      // current line, then just take up to i
      if (width(text.slice(0, nextSplit + 1)) >= lineWidth) {
        break;
      } else {
        i = nextSplit + 1;
      }
    }
    if (width(text.slice(0, i)) >= lineWidth) {
      console.warn(`${text.slice(0, i)} overflows ${i}`);
    }
    lines.push(text.slice(0, i).trim());
    text = text.slice(i);
    y += yDelta;
  }
  return lines;
}

function decideAbilitySplit(
  width: (text: string) => number,
  abilityText: string,
  radius: number,
  yStart: number,
  yDelta: number
): { lines: string[]; yStart: number; yDelta: number } {
  function tryStart(yStart: number): {
    lines: string[];
    yStart: number;
    yDelta: number;
  } {
    const lines = splitLinesCircle(width, abilityText, radius, yStart, yDelta);
    return { lines, yStart, yDelta };
  }
  let s = tryStart(yStart + yDelta);
  if (s.lines.length <= 2) {
    return s;
  }
  s = tryStart(yStart);
  if (s.lines.length <= 4) {
    return s;
  }
  s = tryStart(yStart - yDelta);
  return s;
}

export function drawToken(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  character: BagCharacter
): Promise<void> {
  // clear just the circle we're going to draw to
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(120, 120, 122, 0, 2 * Math.PI);
  ctx.fill();
  ctx.restore();

  // draw the circle
  ctx.save();
  ctx.fillStyle = "2px #000000";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(120, 120, 118, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.fillStyle = "#f0f0f0";
  ctx.fill();
  ctx.restore();

  // draw the ability text
  const { ability } = character;
  const {
    lines: abilityLines,
    yStart,
    yDelta,
  } = decideAbilitySplit(
    (text) => ctx.measureText(text).width,
    ability || "",
    120,
    50,
    20
  );
  ctx.save();
  ctx.font = "13px Barlow";
  abilityLines.forEach((line, i) => {
    const width = ctx.measureText(line).width;
    ctx.fillText(line, 120 - width / 2, yStart + yDelta * i);
  });
  ctx.restore();

  // create an image with the icon and draw to ctx when ready
  const img = new Image();
  img.src = iconPath(character.id);
  // make sure asynchronous draw uses the current transform
  const tform = ctx.getTransform();
  const r = new Promise<void>((resolve) => {
    img.onload = () => {
      const size = 60;
      ctx.save();
      ctx.setTransform(tform);
      ctx.drawImage(img, 120 - size / 2, 125, size, size);
      ctx.restore();
      resolve();
    };
  });

  // draw the character name
  ctx.font = "bold 24px Barlow";
  const name = character.name.toUpperCase();
  // the fraction of the circumference the text will take
  const circumference = 2 * Math.PI * 120;
  const portionOfCircumference = ctx.measureText(name).width / circumference;
  // convert to an angle, and add some padding for space between letters
  const angle = portionOfCircumference * 2 * Math.PI * 1.3;
  drawTextAlongArc(ctx, name, 120, 120, 110, angle);

  return r;
}

export function TokenCanvas(props: {
  character: BagCharacter;
  size: number;
}): JSX.Element {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    const canvas = ref.current;
    // don't rely on devicePixelRatio since we want a high-resolution image for
    // export
    setCanvasResolution(canvas, 240, 240, 2);
    canvas.style.width = `${props.size}px`;
    canvas.style.height = `${props.size}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    drawToken(ctx, props.character);
  }, []);

  return React.createElement("canvas", { ref });
}
