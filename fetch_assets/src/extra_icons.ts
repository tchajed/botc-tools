import { makeSquare } from "./script_tool_images";
import AdmZip from "adm-zip";
import axios from "axios";
import fs from "fs";

const REPO_URL =
  "https://github.com/tchajed/botc-icons/archive/refs/heads/secret.zip";

async function downloadRepo(): Promise<AdmZip> {
  const { data } = await axios.get(REPO_URL, {
    responseType: "arraybuffer",
    responseEncoding: "binary",
    maxRate: 3000 * 1024, // 3MB/s
  });
  return new AdmZip(data);
}

interface Icon {
  entry: AdmZip.IZipEntry;
  destPath: string;
}

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

async function extractIconFiles(icons: Icon[]) {
  await Promise.all(
    icons.map(async (icon) => {
      const data: Buffer = icon.entry.getData();
      const img = await makeSquare(data);
      await img.toFile(icon.destPath);
    }),
  );
}

export async function downloadExtraIcons(iconsDir: string) {
  console.log("downloading extra icons");
  const zip = await downloadRepo();
  const icons = iconEntries(zip, iconsDir);
  if (icons.length == 0) {
    console.log("no extra icons to extract");
    return;
  }
  console.log(`extracting ${icons.length} extra icons`);
  extractIconFiles(icons);
}
