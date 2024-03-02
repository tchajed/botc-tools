import { ScriptsFile } from "./botc/script";
import axios from "axios";

export async function getScripts(): Promise<ScriptsFile> {
  const { data: scripts } = await axios.get("./scripts.json");
  return scripts;
}
