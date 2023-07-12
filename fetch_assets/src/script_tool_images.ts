import axios from "axios";
import fs from "fs";
import sharp from "sharp";

interface Role {
  id: string; // actually is the name
  icon: string;
  version: string; // Extras for fabled
}

const BASE_URL = "https://script.bloodontheclocktower.com";

/** Make an icon square by adding padding.
 *
 * This is done in two steps: first we remove any existing border and only then
 * do we fit it into a 177x177 square.
 *
 */
export async function makeSquare(data: ArrayBuffer): Promise<sharp.Sharp> {
  let img = sharp(Buffer.from(data));
  // remove existing border
  img = img.trim();
  // contain puts the image into exactly these dimensions, filling with a
  // background image
  img = img.resize({
    width: 177,
    height: 177,
    fit: "contain",
    position: "centre",
    // fill with transparent background
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  });
  return img;
}

async function downloadRole(r: Role): Promise<ArrayBuffer> {
  const { data } = await axios.get(`${BASE_URL}/${r.icon}`, {
    responseType: "arraybuffer",
    responseEncoding: "binary",
    maxRate: 3000 * 1024, // 3MB/s
  });
  return data;
}

function roleIconFile(r: Role): string {
  const name = r.id;
  const id = name.toLowerCase().replaceAll(/['\- ]/g, "");
  return `Icon_${id}.webp`;
}

export function findNotDownloadedIcons(rs: Role[], imgDir: string): Role[] {
  return rs.filter((r) => !fs.existsSync(`${imgDir}/${roleIconFile(r)}`));
}

export async function downloadRoles(
  rs: Role[],
  imgDir: string,
  progressCb: (inc: number) => void,
) {
  const promises: Promise<sharp.OutputInfo>[] = [];
  for (const r of rs) {
    const img = await makeSquare(await downloadRole(r));
    progressCb(1);
    const path = `${imgDir}/${roleIconFile(r)}`;
    promises.push(img.toFile(path));
  }
  await Promise.all(promises);
}

export async function getRoles(dataDir: string): Promise<Role[]> {
  const rolesFile = await fs.promises.readFile(`${dataDir}/roles.json`);
  const roles: Role[] = JSON.parse(rolesFile.toString());
  return roles;
}
