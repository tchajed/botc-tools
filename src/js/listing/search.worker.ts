import scriptFile from "../../../assets/static/scripts.json" with { type: "json" };
import type { ScriptData, ScriptsFile } from "botc/script";
import type Fuse from "fuse.js";
import type {
  SearchWorkerRequest,
  SearchWorkerResponse,
} from "listing/SearchWorker";
import { makeCharacterSearcher, makeTitleAuthorSearcher } from "listing/search";

let cachedCharacterSearcher: [Fuse<ScriptData>, boolean] | undefined =
  undefined;
let cachedTitleAuthorSearcher: [Fuse<ScriptData>, boolean] | undefined =
  undefined;

/**
 * Remove the All Amnesiacs script if the user hasn't input the password correctly.
 *
 * @param allScripts The list of all our scripts
 * @param authenticated Whether the user has correctly entered a password
 * @returns Either all the scripts, or all the scripts except the secret All Amnesiacs script.
 */
function filterScripts(
  allScripts: ScriptData[],
  authenticated: boolean,
): ScriptData[] {
  return authenticated ? allScripts : allScripts.filter((s) => !s.allAmne);
}

/**
 * Return an index of all scripts by characters.
 *
 * @param allScripts A list of scripts to index
 * @param authenticated Whether the user has correctly entered a password
 * @returns
 */
function getCharacterSearcher(
  allScripts: ScriptData[],
  authenticated: boolean,
): Fuse<ScriptData> {
  if (cachedCharacterSearcher) {
    const [characterSearcher, isAuthenticated] = cachedCharacterSearcher;
    if (isAuthenticated === authenticated) {
      return characterSearcher;
    }
  }

  const timeLabel = "Creating character searcher";
  console.time(timeLabel);
  cachedCharacterSearcher = [
    makeCharacterSearcher(filterScripts(allScripts, authenticated)),
    authenticated,
  ];
  console.timeEnd(timeLabel);
  return cachedCharacterSearcher[0];
}

/**
 * Return an index of all scripts by title or author
 * @param allScripts
 * @param authenticated
 * @returns
 */
function getTitleAuthorSearcher(
  allScripts: ScriptData[],
  authenticated: boolean,
): Fuse<ScriptData> {
  if (cachedTitleAuthorSearcher) {
    const [titleAuthorSearcher, isAuthenticated] = cachedTitleAuthorSearcher;
    if (isAuthenticated === authenticated) {
      return titleAuthorSearcher;
    }
  }

  const timeLabel = "Creating title and author searcher";
  console.time(timeLabel);
  cachedTitleAuthorSearcher = [
    makeTitleAuthorSearcher(filterScripts(allScripts, authenticated)),
    authenticated,
  ];
  console.timeEnd(timeLabel);
  return cachedTitleAuthorSearcher[0];
}

/**
 * Queue up one incoming request, overwriting it whenever the user sends us new data
 */
let incomingRequest: SearchWorkerRequest | undefined = undefined;
onmessage = ({ data }: MessageEvent<SearchWorkerRequest>) => {
  incomingRequest = data;
};

setInterval(function handleIncomingRequest() {
  if (incomingRequest) {
    const response = runSearch(incomingRequest);
    postMessage(response);
  }
  incomingRequest = undefined;
});

function runSearch({
  query,
  authenticated,
  limit,
}: SearchWorkerRequest): SearchWorkerResponse {
  const allScripts = (scriptFile as ScriptsFile).scripts;
  const matches = new Map<number, ScriptData>();

  // Start with a search by title and author
  const titleAuthorSearcher = getTitleAuthorSearcher(allScripts, authenticated);
  const titleAuthorSearchTimeLabel = "Searching by title and author";
  console.time(titleAuthorSearchTimeLabel);
  const titleAndAuthorMatches = titleAuthorSearcher.search(
    query,
    limit ? { limit } : undefined,
  );
  console.timeEnd(titleAuthorSearchTimeLabel);

  for (const matchResult of titleAndAuthorMatches) {
    const script = matchResult.item;
    matches.set(script.pk, script);
  }

  if (matches.size < 10) {
    // If not enough, fill in results with character-based search
    const characterSearcher = getCharacterSearcher(allScripts, authenticated);
    const characterSearchTimeLabel = "Searching by character";
    console.time(characterSearchTimeLabel);
    const characterMatches = characterSearcher.search(
      query,
      limit ? { limit } : undefined,
    );
    console.timeEnd(characterSearchTimeLabel);

    for (const matchResult of characterMatches) {
      const script = matchResult.item;
      matches.set(script.pk, script);
    }
  }

  return {
    scriptData: Array.from(matches.values()),
  };
}
