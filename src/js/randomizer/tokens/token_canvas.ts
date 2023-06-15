import { BagCharacter } from "../../botc/setup";
import { iconPath } from "../../components/character_icon";
import { splitLines } from "./token_svg";
import React, { useEffect, useRef } from "react";

// inspired by https://codepen.io/acharyaharsh/pen/nQdmMy but heavily tweaked
function drawTextAlongArc(
  ctx: CanvasRenderingContext2D,
  str: string,
  centerX: number,
  centerY: number,
  radius: number,
  angle: number
) {
  ctx.save();
  ctx.translate(centerX, centerY);
  // ctx.rotate((2 * Math.PI) / 4);
  const sweepAngle = (angle / str.length) * (str.length - 1);
  // center the arc of the text
  ctx.rotate(sweepAngle / 2);
  for (const char of str) {
    ctx.save();
    // go straight up in the current rotation
    ctx.translate(0, radius);
    // center text at (0, 0) in the new coordinate system
    ctx.fillText(char, -ctx.measureText(char).width / 2, 0);
    ctx.restore();
    // rotate the whole canvas (persistently across loop iterations)
    ctx.rotate(-angle / str.length);
  }
  ctx.restore();
}

function setCanvasResolution(
  can: HTMLCanvasElement,
  w: number,
  h: number,
  ratio?: number
) {
  const pixelRatio = ratio || window.devicePixelRatio || 1;
  can.width = w * pixelRatio;
  can.height = h * pixelRatio;
  can.style.width = w + "px";
  can.style.height = h + "px";
  can.getContext("2d")?.scale(pixelRatio, pixelRatio);
}

function drawToken(ctx: CanvasRenderingContext2D, character: BagCharacter) {
  ctx.clearRect(0, 0, 245, 245);

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
  // TODO: split based on measured text width and circle width
  const abilityLines = splitLines(ability || "");
  ctx.save();
  ctx.font = "13px Barlow";
  abilityLines.forEach((line, i) => {
    const width = ctx.measureText(line).width;
    ctx.fillText(line, 120 - width / 2, 50 + 20 * i);
  });
  ctx.restore();

  // create an image with the icon and draw to ctx when ready
  const img = new Image();
  img.src = iconPath(character.id);
  img.onload = () => {
    const size = 60;
    ctx.drawImage(img, 120 - size / 2, 125, size, size);
  };

  // draw the character name
  ctx.font = "bold 24px Barlow";
  const name = character.name.toUpperCase();
  // the fraction of the circumference the text will take
  const circumference = 2 * Math.PI * 120;
  const portionOfCircumference = ctx.measureText(name).width / circumference;
  // convert to an angle, and add some padding for space between letters
  const angle = portionOfCircumference * 2 * Math.PI * 1.3;
  drawTextAlongArc(ctx, name, 120, 120, 110, angle);
}

export function TokenCanvas(props: { character: BagCharacter }): JSX.Element {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    const canvas = ref.current;
    // don't rely on devicePixelRatio since we want a high-resolution image for
    // export
    setCanvasResolution(canvas, 240, 240, 2);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    drawToken(ctx, props.character);
  }, []);

  return React.createElement("canvas", { ref });
}
