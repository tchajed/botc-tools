import { BagCharacter } from "../../botc/setup";
import { setCanvasResolution } from "./canvas";
import { drawToken } from "./token_canvas";
import React, { useRef, useEffect } from "react";

const TWOPI = 2 * Math.PI;

export async function drawCharactersArc(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  characters: BagCharacter[],
  arcAngle: number,
  radius: number
) {
  const startAngle = (TWOPI - arcAngle) / 2;
  const anglePerChar = arcAngle / (characters.length - 1);
  await Promise.all(
    characters.map((char, i) => {
      ctx.save();
      const theta = startAngle + i * anglePerChar;
      ctx.rotate(theta);
      ctx.translate(0, radius);
      ctx.rotate(-theta);
      ctx.translate(-120, -120);
      const r = drawToken(ctx, char);
      ctx.restore();
      return r;
    })
  );
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

function townsquareRadius(numPlayers: number): number {
  const arcAngle = townsquareArcAngle(numPlayers);
  const perPlayerArc = arcAngle / (numPlayers - 1);

  // the gap between tokens should accommodate both radii plus a gap
  const desiredTokenGap = 2 * 120 + 30;
  // the gap between tokens is perPlayerArc * radius; this inverts that
  // formula
  const radius = desiredTokenGap / perPlayerArc;
  return radius;
}

async function drawTownsquare(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  bag: BagCharacter[]
): Promise<void> {
  const numPlayers = bag.length;
  const arcAngle = townsquareArcAngle(numPlayers);
  const radius = townsquareRadius(numPlayers);

  // set up a high-resolution canvas
  setCanvasResolution(canvas, radius * 2 + 20, radius * 2, 2);
  // set a fixed, small display size
  if (canvas instanceof HTMLCanvasElement) {
    canvas.style.width = "600px";
    canvas.style.height = "600px";
  }

  // draw the tokens
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }
  ctx.translate(radius + 10, radius + 10);
  ctx.scale(0.8, 0.8);
  await drawCharactersArc(ctx, bag, arcAngle, radius);
}

export function TownsquareCanvas(props: { bag: BagCharacter[] }): JSX.Element {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    const canvas = ref.current;
    drawTownsquare(canvas, props.bag);
  }, []);

  return React.createElement("canvas", { ref });
}

export function TownsquareImage(props: { bag: BagCharacter[] }): JSX.Element {
  // dummy width and height will be set by drawTownsquare
  const canvas = new OffscreenCanvas(0, 0);

  const img: React.MutableRefObject<HTMLImageElement | null> = useRef(null);

  function copyImageToClipboard(blob: Blob) {
    // not supported by Firefox
    if ("ClipboardItem" in window) {
      const data = [new ClipboardItem({ [blob.type]: blob })];
      window.navigator.clipboard.write(data).then(
        () => {
          // TODO: would be nice to have a toast here
        },
        (err) => {
          console.warn(`could not copy to clipboard: ${err}`);
        }
      );
    }
  }

  // This component returns an empty <img> and then asynchronously converts it
  // to a blob. In order to make this work we need a ref so that this effect can
  // reference the generated HTML element directly.
  useEffect(() => {
    drawTownsquare(canvas, props.bag).then(() => {
      canvas.convertToBlob().then((blob) => {
        const dataURL = URL.createObjectURL(blob);
        if (img.current) {
          img.current.src = dataURL;
          if (blob) {
            img.current.onclick = () => copyImageToClipboard(blob);
          }
        }
      });
    });
  }, []);

  return React.createElement("img", {
    className: "townsquare",
    height: 300,
    width: 300,
    ref: img,
  });
}
