import { downloadRepo, extractIconFiles, Icon } from "./extra_icons";
import AdmZip from "adm-zip";
import fs from "fs";

function iconEntries(zip: AdmZip, iconsDir: string): Icon[] {
  const icons: Icon[] = [];
  for (const entry of zip.getEntries()) {
    if (!entry.entryName.includes("assets/img/icons/")) {
      continue;
    }
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

export async function downloadPocketGrimoireIcons(iconsDir: string) {
  console.log("downloading icons from pocket-grimoire");
  const zip = await downloadRepo("Skateside/pocket-grimoire", "main");
  const icons = iconEntries(zip, iconsDir);
  if (icons.length == 0) {
    console.log("no new icons to extract");
    return;
  }
  fs.mkdirSync(iconsDir, { recursive: true });
  console.log(`extracting ${icons.length} icons`);
  extractIconFiles(icons);
}
