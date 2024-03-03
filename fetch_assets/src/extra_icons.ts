import { IMAGE_SIZE, makeSquare } from "./script_tool_images";
import AdmZip from "adm-zip";
import axios from "axios";
import fs from "fs";

export async function downloadRepo(
  slug: string,
  branch: string,
): Promise<AdmZip> {
  const repo_url = `https://github.com/${slug}/archive/refs/heads/${branch}.zip`;
  const { data } = await axios.get(repo_url, {
    responseType: "arraybuffer",
    responseEncoding: "binary",
    maxRate: 3000 * 1024, // 3MB/s
  });
  return new AdmZip(data);
}

export interface Icon {
  entry: AdmZip.IZipEntry;
  destPath: string;
}

/** Identify all icon extraction tasks for extra icons. */
function iconEntries(zip: AdmZip, iconsDir: string): Icon[] {
  const icons: Icon[] = [];
  for (const entry of zip.getEntries()) {
    if (!entry.entryName.endsWith(".png")) {
      continue;
    }
    const id = entry.name.replace(/\.png$/, "").replaceAll(/[-'_]/g, "");
    const destPath = `${iconsDir}/Icon_${id}.webp`;
    if (fs.existsSync(destPath)) {
      continue;
    }
    icons.push({
      entry,
      destPath,
    });
  }
  return icons;
}

export async function extractIconFiles(icons: Icon[]) {
  await Promise.all(
    icons.map(async (icon) => {
      const data: Buffer = icon.entry.getData();
      const img = await makeSquare(data, IMAGE_SIZE);
      await img.toFile(icon.destPath);
    }),
  );
}

export async function downloadExtraIcons(iconsDir: string) {
  console.log("downloading extra icons");
  const zip = await downloadRepo("tchajed/botc-icons", "secret");
  const icons = iconEntries(zip, iconsDir);
  if (icons.length == 0) {
    console.log("no extra icons to extract");
    return;
  }
  console.log(`extracting ${icons.length} extra icons`);
  extractIconFiles(icons);
}
