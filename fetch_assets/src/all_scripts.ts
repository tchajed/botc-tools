import axios from 'axios';
import fs from 'fs';
import cliProgress from 'cli-progress';

interface Resp {
  count: number,
  next?: string | null;
  results: any[];
}

// give up after this
const MAX_PAGES = 300;

async function fetchAll(): Promise<any[]> {
  var results: any[] = [];
  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.rect);
  for (var page = 1; page < MAX_PAGES; page++) {
    let resp = await axios.get("https://botc-scripts.azurewebsites.net/api/scripts/",
      {
        maxRate: 3000 * 1024, // 3MB/s
        params: {
          format: "json",
          page,
        }
      });
    const data: Resp = resp.data;
    results.push(...data.results);

    if (page == 1) {
      bar.start(data.count, 0);
    }
    bar.update(results.length);

    if (!("next" in data && data.next)) {
      bar.stop();
      return results;
    }
  }
  return results;
}

async function main() {
  let results = await fetchAll();
  await fs.promises.writeFile("assets/all-scripts.json", JSON.stringify(results));
}

main();
