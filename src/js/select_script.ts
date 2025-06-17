import { ScriptData, ScriptsFile } from "./botc/script";
import { getScripts } from "./get_scripts";
import { getAuthenticated } from "state";

function selectedScriptId(): string {
  if (window.location.hash != "") {
    const id = window.location.hash.substring(1);
    return id;
  }
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (id) {
    return id;
  }
  // default to Trouble Brewing
  return "178";
}

interface ScriptMeta {
  id: string;
  name: string;
  author: string;
}

interface ScriptCharacter {
  id: string;
}

function parseJson(json: string): ScriptData {
  const parsed: (ScriptMeta | ScriptCharacter | string)[] = JSON.parse(json);
  const meta = parsed.find(
    (item): item is ScriptMeta =>
      typeof item === "object" && item.id === "_meta",
  )!;
  const characters = parsed
    .filter((item): item is ScriptCharacter | string => item !== meta)
    .map((item) => (typeof item === "string" ? item : item.id));

  return {
    pk: 0,
    title: meta ? meta.name : "Unknown Title",
    author: meta ? meta.author : "Unknown Author",
    characters: characters,
    allAmne: false,
  };
}

function getJson(): ScriptData | null {
  const params = new URLSearchParams(window.location.search);
  const json = params.get("json");
  if (json === null) {
    return null;
  }
  return parseJson(json);
}

export async function getScriptById(
  scriptFile: ScriptsFile,
  id: number,
): Promise<ScriptData> {
  const script = scriptFile.scripts.find((s) => s.pk == id);
  if (!script) {
    throw new Error(`unknown script id ${id}`);
  }
  if (script.allAmne) {
    if (await getAuthenticated()) {
      return script;
    } else {
      throw new Error(`script ${id} requires authentication`);
    }
  }
  return script;
}

export async function selectedScript(): Promise<ScriptData> {
  const json = getJson();
  if (json != null) {
    return json;
  }
  const id = selectedScriptId();
  const scripts = (await getScripts()).scripts;
  const script = scripts.find((s) => s.pk.toString() == id);
  if (!script) {
    throw new Error(`unknown script id ${id}`);
  }
  if (script.allAmne) {
    if (await getAuthenticated()) {
      return script;
    } else {
      throw new Error(`script ${id} requires authentication`);
    }
  }
  return script;
}
