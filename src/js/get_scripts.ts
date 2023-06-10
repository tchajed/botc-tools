import { ScriptData } from "./botc/script";
import axios from "axios";

export async function getScripts(): Promise<ScriptData[]> {
  const { data: scripts } = await axios.get("./scripts.json");
  return scripts;
}
