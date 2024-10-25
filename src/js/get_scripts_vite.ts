import type { ScriptsFile } from "./botc/script";
import scripts from "../../assets/static/scripts.json";

export async function getScripts(): Promise<ScriptsFile> {
  return scripts;
}
