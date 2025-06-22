import type { ScriptData } from "botc/script";

export interface SearchWorkerRequest {
  authenticated: boolean;
  query: string;
  limit?: number;
}

export interface SearchWorkerResponse {
  scriptData: ScriptData[];
}

export interface SearchWorker extends Worker {
  onmessage: (event: MessageEvent<SearchWorkerResponse>) => void;
  postMessage: (request: SearchWorkerRequest) => void;
}
