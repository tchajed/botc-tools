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
  angle: number
) {
  ctx.save();
  ctx.translate(centerX, centerY);
  const totalWidth = ctx.measureText(str).width;
  // center the arc of the text
  ctx.rotate(angle / 2);
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    ctx.save();
    // rotate to this character's position, with a compensation for its
    // halfwidth since it is rendered in the center
    const charCompensation = ctx.measureText(char).width / 2;
    ctx.rotate(
      (-angle * ctx.measureText(str.slice(0, i)).width) / totalWidth -
        charCompensation / radius
    );
    // go straight up in the current rotation
    ctx.translate(0, radius);
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
  ratio?: number
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
