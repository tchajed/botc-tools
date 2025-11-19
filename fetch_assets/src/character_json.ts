import axios from "axios";
import fs from "fs";

/** Download JSON files with character metadata and text. */
export async function downloadCharacterData(assetsPath: string) {
  // we no longer get any data from
  // https://script.bloodontheclocktower.com/data/${file}.json, preferring the
  // unofficial but well-maintained nicholas-eden/townsquare data
  //
  // see https://github.com/nicholas-eden/townsquare/tree/develop/src
  const downloads: { url: string; name: string }[] = [];
  for (const { name, dest } of [
    { name: "characters.json", dest: "roles.json" },
    { name: "nightsheet.json", dest: "nightsheet.json" },
    { name: "jinxes.json", dest: "jinx.json" },
    { name: "non_player_characters.json", dest: "fabled.json" },
  ]) {
    downloads.push({
      url: `https://raw.githubusercontent.com/nicholas-eden/townsquare/refs/heads/develop/src/${name}`,
      name: dest,
    });
  }
  await Promise.all(
    downloads.map(async (file) => {
      const destFile = `${assetsPath}/${file.name}`;
      if (fs.existsSync(destFile)) {
        console.log(`already have ${file.name}`);
        return;
      }
      const { data } = await axios.get(file.url, {
        responseType: "arraybuffer",
        responseEncoding: "binary",
      });
      return fs.promises.writeFile(destFile, data);
    }),
  );
}
