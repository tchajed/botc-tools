import { BagCharacter } from "../../botc/setup";
import { RenderingContext2D, setCanvasResolution } from "./canvas";
import { drawToken } from "./token_canvas";
import React, { useRef, useEffect } from "react";

const TWOPI = 2 * Math.PI;

export async function drawCharactersArc(
  ctx: RenderingContext2D,
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
  const desiredTokenGap = 2 * 120 + 30;
  // the gap between tokens is perPlayerArc * radius; this inverts that
  // formula
  const radius = desiredTokenGap / perPlayerArc;
  return radius;
}

async function drawTownsquare(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  bag: BagCharacter[],
  title?: string
): Promise<void> {
  const numPlayers = bag.length;
  const arcAngle = townsquareArcAngle(numPlayers);
  const radius = townsquareRadius(numPlayers);

  // set up a high-resolution canvas
  const margin = 10;
  // remove some whitespace due to a missing part of the arc
  const unneededHeight = radius * (1 - Math.cos((TWOPI - arcAngle) / 2)) - 100;
  setCanvasResolution(
    canvas,
    radius * 2 + margin * 2,
    radius * 2 + margin * 2 - unneededHeight,
    2
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
  ctx.translate(radius + margin, radius + margin);
  ctx.scale(0.75, 0.75);
  await drawCharactersArc(ctx, bag, arcAngle, radius);

  // draw the title
  const titleY = radius * Math.cos((TWOPI - arcAngle) / 2) + 120;
  if (title) {
    drawTitle(ctx, title, 0, titleY);
  }
}

export function TownsquareCanvas(props: {
  title: string;
  bag: BagCharacter[];
}): JSX.Element {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    const canvas = ref.current;
    drawTownsquare(canvas, props.bag, props.title);
  }, []);

  return React.createElement("canvas", { ref });
}

export function TownsquareImage(props: {
  title: string;
  bag: BagCharacter[];
}): JSX.Element {
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
    drawTownsquare(canvas, props.bag, props.title).then(() => {
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
  }, [props.bag, props.title]);

  return React.createElement("img", {
    className: "townsquare",
    width: "70%",
    ref: img,
  });
}
