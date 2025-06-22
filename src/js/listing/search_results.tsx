import { ScriptList } from "./script_list";
import { searchNormalize } from "./search";
import { css } from "@emotion/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ScriptData } from "botc/script";
import { isSafari } from "detect";
import type { SearchWorker } from "listing/SearchWorker";
import { useEffect, useMemo, useState } from "react";

function useQueryMatches(
  authenticated: boolean,
  query: string,
  limit?: number,
): ScriptData[] {
  const [worker, setWorker] = useState<SearchWorker | undefined>();
  const [scriptData, setScriptData] = useState<ScriptData[]>([]);

  useEffect(function searchWorkerLifecycle() {
    const worker = new Worker(new URL("./search.worker.ts", import.meta.url), {
      name: "Script searcher",
      type: "module",
    }) as SearchWorker;

    worker.onmessage = ({ data }) => {
      setScriptData(data.scriptData);
    };

    setWorker(worker);

    return () => {
      worker.terminate();
      setWorker(undefined);
    };
  }, []);

  useEffect(
    function dispatchSearchQuery() {
      worker?.postMessage({ authenticated, query, limit });
    },
    [worker, authenticated, query],
  );

  return scriptData;
}

export function SearchResults(props: {
  authenticated: boolean;
  query: string;
  setQuery: (q: string) => void;
}): React.JSX.Element {
  const { authenticated, query, setQuery } = props;

  // on Safari the search box already has a magnifying glass icon so avoid
  // adding a redundant one
  const showSearchIcon = !isSafari();

  function queryChange(v: React.ChangeEvent<HTMLInputElement>) {
    const newQuery = v.target.value;
    setQuery(newQuery);
    window.location.hash = searchNormalize(newQuery);
  }

  const limit = 20;

  const allResults = useQueryMatches(authenticated, query);
  const results = useMemo(
    () => allResults.slice(0, limit),
    [allResults, limit],
  );
  const numExtraResults = useMemo(
    () => allResults.length - limit,
    [allResults, limit],
  );

  return (
    <>
      <div
        id="search"
        css={{
          fontSize: "120%",
          marginBottom: "0.5rem",
        }}
      >
        <input
          id="search-query"
          type="search"
          placeholder="search"
          value={query}
          onChange={queryChange}
          css={css`
            font-size: inherit;
            width: 8rem;
            transition: width 0.3s;
            &:focus {
              width: 15rem;
            }
          `}
        />
        {showSearchIcon && (
          <>
            &nbsp;
            <span
              css={{
                color: "gray",
              }}
            >
              <FontAwesomeIcon icon="search" />
            </span>
          </>
        )}
      </div>
      {allResults.length == 0 && query != "" && <span>No results</span>}
      <ScriptList scripts={results} />
      {numExtraResults > 0 && <span>... plus {numExtraResults} more</span>}
    </>
  );
}
