import {
  ScriptData,
  ScriptInstanceResp,
  parseScriptInstance,
} from "./get_script";
import axios from "axios";
import cliProgress from "cli-progress";

interface Resp {
  count: number;
  next?: string | null;
  results: ScriptInstanceResp[];
}

// give up after this
const MAX_PAGES = 300;

async function getPage(
  page: number
): Promise<{ count: number; data: ScriptData[]; next: boolean }> {
  const resp = await axios.get(
    "https://botc-scripts.azurewebsites.net/api/scripts/",
    {
      maxRate: 3000 * 1024, // 3MB/s
      params: {
        format: "json",
        page,
      },
    }
  );
  const data: Resp = resp.data;
  return {
    count: data.count,
    data: data.results.map((r) => parseScriptInstance(r)),
    next: data.next ? true : false,
  };
}

export async function fetchAllScripts(): Promise<ScriptData[]> {
  const results: ScriptData[] = [];
  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.rect);
  for (let page = 1; page < MAX_PAGES; page++) {
    const { count, data, next } = await getPage(page);
    results.push(...data);

    if (page == 1) {
      bar.start(count, 0);
    }
    bar.update(results.length);

    if (!next) {
      bar.stop();
      return results;
    }
  }
  bar.stop();
  console.warn("aborting early");
  return results;
}
