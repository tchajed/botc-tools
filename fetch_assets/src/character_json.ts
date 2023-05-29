import axios from 'axios';
import fs from 'fs';

/** Download JSON files with character metadata and text. */
export async function downloadCharacterData(assetsPath: string) {
  // there's also tether.json and game-characters-restrictions.json which we don't download
  var downloads: { url: string; name: string; }[] = [];
  for (const file of ["roles", "jinx", "nightsheet"]) {
    downloads.push({
      url: `https://script.bloodontheclocktower.com/data/${file}.json`,
      name: `${file}.json`,
    })
  }
  downloads.push({
    url: "https://raw.githubusercontent.com/bra1n/townsquare/develop/src/roles.json",
    name: "botc_online_roles.json",
  });
  await Promise.all(downloads.map(async (file) => {
    let { data } = await axios.get(file.url, {
      responseType: "arraybuffer",
      responseEncoding: "binary",
    });
    return fs.promises.writeFile(`${assetsPath}/${file.name}`, data);
  }));
}
