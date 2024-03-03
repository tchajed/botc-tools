import axios from "axios";
import fs from "fs";
import http from "http";
import sharp from "sharp";

/** Fetch official art from the wiki. Left here for historical purposes (and
 * using the WikiMedia API might still be useful for some other purpose in the
 * future).
 *
 * We don't use the official art any more (in compliance with TPI's legal
 * requirements). */

http.globalAgent.maxSockets = 10;

/** Recursively fetch a paged query with a continue parameter until it has no more results.
 *
 * @param params The query to run.
 * @param continueParam The name of the parameter that specifies how to resume queries.
 */
async function completeQuery(
  params: { [key: string]: string },
  continueParam: string,
  continueVal: string | null = null,
): Promise<object[]> {
  if (continueVal !== null) {
    params[continueParam] = continueVal;
  }
  const query_api = axios.create({
    baseURL: "https://wiki.bloodontheclocktower.com/",
    params: {
      action: "query",
      format: "json",
    },
  });
  const { data } = await query_api.get("api.php", { params });
  if (!("continue" in data)) {
    // terminated
    return [data.query];
  }
  // need to recursively get remaining results
  const rest = await completeQuery(
    params,
    continueParam,
    data.continue[continueParam],
  );
  // insert the original results at the front of the list
  rest.unshift(data.query);
  return rest;
}

interface Icon {
  // like Icon_pithag.png
  name: string;
  // like https://wiki.bloodontheclocktower.com/images/6/6b/Icon_pithag.png
  url: string;
}

/** Fetch the list of all icons on the wiki through the MediaWiki API. */
export function allIcons(): Promise<Icon[]> {
  // See https://www.mediawiki.org/wiki/API:Allimages for documentation
  //
  // Use curl to get an idea of the data format:
  // 'https://wiki.bloodontheclocktower.com/api.php?action=query&list=allimages&ailimit=10&aifrom=Icon_&aito=J&format=json'
  return completeQuery(
    {
      list: "allimages",
      ailimit: "max",
      aifrom: "Icon_",
      aito: "J",
    },
    "aicontinue",
  ).then((results) => {
    const images: Icon[] = [];
    for (const r of results) {
      if ("allimages" in r) {
        const newImages = r["allimages"];
        if (newImages instanceof Array) {
          images.push(...newImages);
        }
      }
    }
    return images;
  });
}

export function findNotDownloaded(icons: Icon[], imgDir: string): Icon[] {
  return icons.filter((icon) => {
    const fileName = iconFileName(icon);
    return !fs.existsSync(`${imgDir}/${fileName}`);
  });
}

interface DownloadedIcon {
  icon: Icon;
  data: ArrayBuffer;
}

/** Download a list of icons and return the raw data in memory.  */
export async function downloadIcons(
  icons: Icon[],
  progressCb: (inc: number) => void,
): Promise<DownloadedIcon[]> {
  async function downloadIcon(icon: Icon): Promise<ArrayBuffer> {
    const { data } = await axios.get(icon.url, {
      responseType: "arraybuffer",
      responseEncoding: "binary",
      maxRate: 3000 * 1024, // 3MB/s
    });
    return data;
  }

  const downloads: DownloadedIcon[] = [];
  while (icons.length > 0) {
    const nextBatch = await Promise.all(
      icons.splice(0, 10).map((icon) =>
        downloadIcon(icon).then((data) => {
          progressCb(1);
          return { icon, data };
        }),
      ),
    );
    downloads.push(...nextBatch);
  }
  return downloads;
}

async function rescaleIcon(data: ArrayBuffer): Promise<sharp.Sharp> {
  let img = sharp(Buffer.from(data));
  const meta = await img.metadata();
  const size = 401;
  if (meta.height && meta.width && meta.height > size) {
    img = img.extract({
      left: Math.round((meta.width - size) / 2),
      top: Math.round((meta.height - size) / 2),
      width: size,
      height: size,
    });
  }
  return img.resize({
    width: 200,
    height: 200,
    fit: "inside",
  });
}

function iconFileName(icon: Icon): string {
  const restOfName = icon.name.slice("Icon_".length);
  const cleanedName = restOfName.replaceAll(/_/g, "");
  const withWebp = cleanedName.replace(/\.png$/, ".webp");
  return `Icon_${withWebp}`;
}

/** Resize and save icons that are already in memory. */
export async function saveIcons(downloads: DownloadedIcon[], imgDir: string) {
  await Promise.all(
    downloads.map((dl) => {
      const path = `${imgDir}/${iconFileName(dl.icon)}`;
      return rescaleIcon(dl.data).then((img) => img.toFile(path));
    }),
  );
}
