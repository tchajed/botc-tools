import axios from 'axios';
import fs from 'fs';
import sharp from 'sharp';

const query_api = axios.create({
  baseURL: 'https://wiki.bloodontheclocktower.com/',
  maxRate: 100 * 1024,
  params: {
    action: "query",
    format: "json",
  }
});

function completeQuery(params: any, continueParam: string, continueVal: string | null = null): Promise<any[]> {
  if (continueVal !== null) {
    params[continueParam] = continueVal;
  }
  return query_api.get("api.php", { params }).then((response) => {
    var r = response.data;
    if (!('continue' in r)) {
      // terminated
      return [r.query];
    }
    // need to recursively get remaining results
    return completeQuery(params, continueParam, r.continue[continueParam]).then((rest: any[]) => {
      rest.unshift(r.query);
      return rest;
    })
  });
}

interface Icon {
  // like Icon_pithag.png
  name: string,
  // like https://wiki.bloodontheclocktower.com/images/6/6b/Icon_pithag.png
  url: string,
}

function allIcons(): Promise<Icon[]> {
  return completeQuery({
    list: "allimages",
    ailimit: 20,
    aifrom: "Icon_",
    aito: "J",
  }, "aicontinue").then((results) => {
    var images = [];
    for (const r of results) {
      images.push(...r.allimages);
    }
    return images;
  });
}

async function downloadIcon(icon: Icon): Promise<ArrayBuffer> {
  let { data } = await axios.get(icon.url, {
    responseType: "arraybuffer",
    responseEncoding: "binary",
    maxRate: 1000 * 1024, // 1MB/s
  });
  return data;
}

async function rescaleIcon(data: ArrayBuffer): Promise<sharp.Sharp> {
  // need two resizes, which can't be in the same pipeline:
  // first removes some of the empty space around each icon,
  // second scales the icon down
  let resized = await sharp(data).resize({
    width: 451,
    height: 451,
    fit: 'cover',
  }).toBuffer();
  return sharp(resized).resize({
    width: 250,
    height: 250,
    fit: 'inside',
  });
}

function iconPath(icon: Icon): string {
  const restOfName = icon.name.slice("Icon_".length);
  const cleanedName = restOfName.replace(/_/g, "");
  return `assets/img/Icon_${cleanedName}`;
}

async function main() {
  console.log("fetching list of icons");

  const icons = await allIcons();

  console.log(`downloading ${icons.length} images`);

  fs.mkdirSync("assets/img", {
    "recursive": true,
  });

  var processed = 0;
  while (icons.length > 0) {
    var nextBatch = icons.splice(0, 5);
    await Promise.all(nextBatch.map(icon =>
      downloadIcon(icon).then((data) =>
        rescaleIcon(data).then((img) =>
          img.toFile(iconPath(icon))
        ))
    ));
    processed += nextBatch.length;
    if (processed % 50 == 0) {
      console.log(`done with ${processed}`);
    }
  }
}

main();
