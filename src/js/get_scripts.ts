import axios from "axios";
import { ScriptData } from "./botc/script";

export async function getScripts(): Promise<ScriptData[]> {
  const { data: scripts } = await axios.get("./scripts.json");
  return scripts;
}
