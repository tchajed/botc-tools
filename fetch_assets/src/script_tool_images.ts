import sharp from 'sharp';
import axios from 'axios';
import fs from 'fs';

interface Role {
  id: string; // actually is the name
  icon: string;
  version: string; // Extras for fabled
}

const BASE_URL = "https://script.bloodontheclocktower.com";

/** Make an icon square by adding padding.
 *
 * TODO: make this smarter by first truncating any extra fully-transparent
 * margin and only then padding to square. Currently most icons end up with a
 * border all the way around, but there are landscape icons (eg, for fabled)
 * that need exactly this treatment.
 */
async function makeSquare(data: ArrayBuffer): Promise<sharp.Sharp> {
  let img = sharp(data);
  const meta = await img.metadata();
  if (meta.width > meta.height) {
    const extra = (meta.width - meta.height) / 2;
    img = img.extend({
      top: Math.floor(extra),
      bottom: Math.ceil(extra),
      left: 0,
      right: 0,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
  }
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
  return rs.filter(r => !fs.existsSync(`${imgDir}/${roleIconFile(r)}`));
}

export async function downloadRoles(rs: Role[], imgDir: string, progressCb: (number) => void) {
  const promises: Promise<void>[] = [];
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
