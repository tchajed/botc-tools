/**
 * Create a canvas. If supported, an OffscreenCanvas is created, otherwise we
 * create a DOM element.
 *
 * On iOS, OffscreenCanvas support was only added in Safari 16.4:
 * https://caniuse.com/?search=OffscreenCanvas (at time of writing this comment
 * the data on caniuse.com is wrong, it says 16.2 has support).
 */
export function createCanvas(
  width: number,
  height: number,
): OffscreenCanvas | HTMLCanvasElement {
  if (typeof OffscreenCanvas !== "undefined") {
    return new OffscreenCanvas(width, height);
  } else {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }
}

// Convert a canvas to a blob, handling both OffscreenCanvas and
// HTMLCanvasElement.
export function canvasToBlob(
  canvas: OffscreenCanvas | HTMLCanvasElement,
): Promise<Blob> {
  if (canvas instanceof HTMLCanvasElement) {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob === null) {
          reject("could not convert canvas to blob");
          return;
        }
        resolve(blob);
      });
    });
  } else {
    return canvas.convertToBlob();
  }
}
