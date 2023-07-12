import { makeSquare } from "./script_tool_images";
import AdmZip from "adm-zip";
import axios from "axios";

const REPO_URL =
  "https://github.com/tchajed/botc-icons/archive/refs/heads/main.zip";

async function downloadRepo(): Promise<AdmZip> {
  const { data } = await axios.get(REPO_URL, {
    responseType: "arraybuffer",
    responseEncoding: "binary",
    maxRate: 3000 * 1024, // 3MB/s
  });
  return new AdmZip(data);
}

function iconEntries(zip: AdmZip): AdmZip.IZipEntry[] {
  return zip.getEntries().filter((e) => e.entryName.endsWith(".png"));
}

async function extractIconFiles(entries: AdmZip.IZipEntry[], iconsDir: string) {
  await Promise.all(
    entries.map(async (zipEntry) => {
      const data: Buffer = zipEntry.getData();
      const img = await makeSquare(data);
      const id = zipEntry.name.replace(/\.png$/, "").replaceAll(/[-'_]/g, "");
      await img.toFile(`${iconsDir}/Icon_${id}.webp`);
    }),
  );
}

export async function downloadExtraIcons(iconsDir: string) {
  const zip = await downloadRepo();
  const icons = iconEntries(zip);
  console.log(`extracting ${icons.length} extra icons`);
  extractIconFiles(icons, iconsDir);
}
