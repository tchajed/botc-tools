import axios from 'axios';
import cliProgress from 'cli-progress';
import { ScriptData, ScriptInstanceResp, parseScriptInstance } from './get_script';

interface Resp {
  count: number,
  next?: string | null;
  results: ScriptInstanceResp[];
}

// give up after this
const MAX_PAGES = 300;

export async function fetchAllScripts(): Promise<ScriptData[]> {
  var results: ScriptData[] = [];
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
    for (const r of data.results) {
      results.push(parseScriptInstance(r));
    }

    if (page == 1) {
      bar.start(data.count, 0);
    }
    bar.update(results.length);

    if (!("next" in data && data.next)) {
      bar.stop();
      return results;
    }
  }
  bar.stop();
  console.warn("aborting early");
  return results;
}
