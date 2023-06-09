import axios from 'axios';
import { ungzip } from 'node-gzip';
import { ScriptData } from './botc/script';

export async function getScripts(): Promise<ScriptData[]> {
  let { data: data_compressed } = await axios.get('./scripts.json.gz', {
    responseType: 'arraybuffer',
  });
  let json = await ungzip(Buffer.from(data_compressed));
  let scripts = JSON.parse(json);
  return scripts;
}
