import axios from "axios";
import { ScriptData } from "./botc/script";

function selectedScriptId(): string {
  let params = new URLSearchParams(window.location.search);
  if (params.has("id")) {
    return params.get("id");
  }
  // Laissez un Carnaval as a default
  return "19";
}

export async function selectedScript(): Promise<ScriptData> {
  let id = selectedScriptId();
  let script = await axios.get(`/scripts/${id}.json`);
  return script.data;
}
