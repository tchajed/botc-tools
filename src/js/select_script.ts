import axios from "axios";
import { ScriptData } from "./botc/script";

function selectedScriptId(): string {
  if (window.location.hash != "") {
    const id = window.location.hash.substring(1);
    return id;
  }
  return "19";
}

export async function selectedScript(): Promise<ScriptData> {
  let id = selectedScriptId();
  let script = await axios.get(`./scripts/${id}.json`);
  return script.data;
}
