import { createCanvas, canvasToBlob } from "./offscreen_canvas";
import { TownsquareData, drawTownsquare } from "./townsquare_canvas";
import { css } from "@emotion/react";
import { useState, useEffect } from "react";

export function TownsquareImage(props: TownsquareData): JSX.Element {
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
        },
      );
    } else {
      console.warn("image copy not supported by browser");
    }
  }

  useEffect(() => {
    // dummy width and height will be set by drawTownsquare
    const canvas: OffscreenCanvas | HTMLCanvasElement = createCanvas(0, 0);

    drawTownsquare(canvas, props).then(() => {
      canvasToBlob(canvas)
        .then((blob) => {
          const dataURL = URL.createObjectURL(blob);
          setImg({ dataURL, blob });
        })
        .catch((err) => {
          console.error(`could not draw town square: ${err}`);
        });
    });
    // TODO: the dependency on an object triggers too often, follow
    // https://www.benmvp.com/blog/object-array-dependencies-react-useEffect-hook/
    // and isDeepEqual to fix this
  }, [props]);

  return (
    <img
      id="townsquare"
      width="80%"
      css={css`
        border: 1px solid #444;
        border-radius: 0.5rem;
        box-shadow: 1px 5px 5px 0 #444;
        margin-bottom: 1rem;
      `}
      src={img ? img.dataURL : ""}
      onClick={() => copyImageToClipboard()}
    ></img>
  );
}
