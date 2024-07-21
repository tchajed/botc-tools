import { ScriptList } from "./script_list";
import { queryMatches, searchNormalize } from "./search";
import { css } from "@emotion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ScriptData } from "botc/script";
import { isSafari } from "detect";
import debounce from "lodash.debounce";

// https://www.developerway.com/posts/debouncing-in-react
function useDebounce(callback: () => void, time_ms: number): () => void {
  const ref = useRef<() => void>();

  useEffect(() => {
    ref.current = callback;
  }, [callback]);

  const debouncedCallback = useMemo(() => {
    const f = () => {
      ref.current?.();
    };
    return debounce(f, time_ms);
  }, []);

  return debouncedCallback;
}

export function SearchResults(props: {
  scripts: ScriptData[];
  query: string;
  setQuery: (q: string) => void;
}): JSX.Element {
  const { scripts, query, setQuery } = props;
  const [allResults, setAllResults] = useState<ScriptData[]>(
    // do an initial search at component load (which can use a query from
    // window.location.hash)
    queryMatches(scripts, query),
  );

  // on Safari the search box already has a magnifying glass icon so avoid
  // adding a redundant one
  const showSearchIcon = !isSafari();

  const debouncedSearch = useDebounce(() => {
    setAllResults(queryMatches(scripts, query));
  }, 100);

  const queryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    window.location.hash = searchNormalize(newQuery);
    debouncedSearch();
  };

  const results = allResults.slice(0, 20);
  const extraResults = allResults.slice(20);

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
      {allResults.length == 0 && <span>No results</span>}
      <ScriptList scripts={results} />
      {extraResults.length > 0 && (
        <span>... plus {extraResults.length} more</span>
      )}
    </>
  );
}
