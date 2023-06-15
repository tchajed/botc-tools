// inspired by https://codepen.io/acharyaharsh/pen/nQdmMy but heavily tweaked
export function drawTextAlongArc(
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

export function setCanvasResolution(
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
