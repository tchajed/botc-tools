export type RenderingContext2D =
  | CanvasRenderingContext2D
  | OffscreenCanvasRenderingContext2D;

// inspired by https://codepen.io/acharyaharsh/pen/nQdmMy but heavily tweaked
export function drawTextAlongArc(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  str: string,
  centerX: number,
  centerY: number,
  radius: number,
  angle: number,
  top?: boolean,
) {
  ctx.save();
  ctx.translate(centerX, centerY);
  const totalWidth = ctx.measureText(str).width;
  // center the arc of the text
  if (top) {
    ctx.rotate(-angle / 2 + Math.PI);
  } else {
    ctx.rotate(angle / 2);
  }
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    ctx.save();
    // rotate to this character's position, with a compensation for its
    // halfwidth since it is rendered in the center
    const charCompensation = ctx.measureText(char).width / 2;
    ctx.rotate(
      (top ? 1 : -1) *
        ((angle * ctx.measureText(str.slice(0, i)).width) / totalWidth +
          charCompensation / radius),
    );
    // go straight up in the current rotation
    ctx.translate(0, radius);
    if (top) {
      ctx.rotate(Math.PI);
    }
    ctx.textAlign = "center";
    ctx.fillText(char, 0, 0);
    ctx.restore();
  }
  ctx.restore();
}

export function setCanvasResolution(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  w: number,
  h: number,
  ratio?: number,
) {
  const pixelRatio = ratio || window.devicePixelRatio || 1;
  canvas.width = w * pixelRatio;
  canvas.height = h * pixelRatio;
  if (canvas instanceof HTMLCanvasElement) {
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
  }
  // NOTE: yarn tsc needs this type ascription, but it works in VS Code
  const ctx = canvas.getContext("2d") as RenderingContext2D | null;
  ctx?.scale(pixelRatio, pixelRatio);
}

// angle is interpreted counter-clockwise relative to the usual (1, 0) vector
export function moveToAngle(
  ctx: RenderingContext2D,
  radius: number,
  angle_deg: number,
) {
  ctx.rotate((-angle_deg * Math.PI) / 180);
  ctx.translate(radius, 0);
  ctx.rotate((angle_deg * Math.PI) / 180);
}

/** Width of a circle at an offset from the center. Use `radius-outsideOffset` for
 * an outsideOffset measured from the circle edge rather than the center. */
export function circleWidthAt(radius: number, offset: number) {
  return 2 * Math.sqrt(radius * radius - offset * offset);
}
