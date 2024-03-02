import {
  ScriptData,
  ScriptInstanceResp,
  parseScriptInstance,
} from "./get_script";
import axios from "axios";
import cliProgress from "cli-progress";
import { readFile, readdir } from "fs/promises";

interface Resp {
  count: number;
  next?: string | null;
  results: ScriptInstanceResp[];
}

async function getPage(
  page: number,
): Promise<{ count: number; data: ScriptData[]; next: boolean }> {
  const resp = await axios.get(
    "https://botc-scripts.azurewebsites.net/api/scripts/",
    {
      maxRate: 3000 * 1024, // 3MB/s
      params: {
        format: "json",
        page,
      },
    },
  );
  const data: Resp = resp.data;
  return {
    count: data.count,
    data: data.results.map((r) => parseScriptInstance(r)),
    next: data.next ? true : false,
  };
}

const DEBUG_FETCH = false;

export async function fetchAllScripts(): Promise<ScriptData[]> {
  const results: ScriptData[] = [];
  const bar = new cliProgress.SingleBar(
    // noTTYOutput and notTTYSchedule enable output in GitHub Actions (every 5s)
    { noTTYOutput: true, notTTYSchedule: 5000, etaBuffer: 20 },
    cliProgress.Presets.rect,
  );

  const { count, data, next } = await getPage(1);
  results.push(...data);
  // for debugging quickly return just one page of results
  if (DEBUG_FETCH) {
    return results;
  }
  // if there's one page of results we're done
  if (!next) {
    return results;
  }
  bar.start(count, results.length);

  const numPages = Math.ceil(count / data.length);
  const pageNums: number[] = [];
  // we already fetched page 1
  for (let pageNum = 2; pageNum <= numPages; pageNum++) {
    pageNums.push(pageNum);
  }
  let done = false;
  const updateInterval = setInterval(() => {
    bar.updateETA();
  }, 2000);
  while (pageNums.length > 0 && !done) {
    const nextGroup = pageNums.splice(0, 5);
    const allPages = await Promise.all(
      nextGroup.map(async (page) => {
        const r = await getPage(page);
        bar.increment(r.data.length);
        return r;
      }),
    );
    for (const { data, next } of allPages) {
      results.push(...data);
      done = done || !next;
    }
  }
  clearInterval(updateInterval);
  bar.stop();
  // order by descending pk order
  results.sort((a, b) => b.pk - a.pk);
  return results;
}

// Generator for all files in a directory, recursively.
//
// Copilot half-write this but also it linked to this answer, which explains async generators:
// https://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search/45130990#45130990
async function* readdirRecursive(dir: string): AsyncGenerator<string> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const fullPath = `${dir}/${entry.name}`;
    if (entry.isDirectory()) {
      yield fullPath;
      yield* readdirRecursive(fullPath);
    } else {
      yield fullPath;
    }
  }
}

export async function readScripts(dir: string): Promise<ScriptData[]> {
  const scripts: ScriptData[] = [];
  for await (const file of readdirRecursive(dir)) {
    if (!file.endsWith(".json")) {
      continue;
    }
    const data = await readFile(file, { encoding: "utf8" });
    scripts.push(JSON.parse(data));
  }
  return scripts;
}
