import { ScriptList } from "./script_list";
import { queryMatches, searchNormalize } from "./search";
import { css } from "@emotion/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ScriptData } from "botc/script";
import { isSafari } from "detect";

export function SearchResults(props: {
  scripts: ScriptData[];
  query: string;
  setQuery: (q: string) => void;
}): React.JSX.Element {
  const { scripts, query, setQuery } = props;

  // on Safari the search box already has a magnifying glass icon so avoid
  // adding a redundant one
  const showSearchIcon = !isSafari();

  function queryChange(v: React.ChangeEvent<HTMLInputElement>) {
    const newQuery = v.target.value;
    setQuery(newQuery);
    window.location.hash = searchNormalize(newQuery);
  }

  const allResults = queryMatches(scripts, query);
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
      {allResults.length == 0 && query != "" && <span>No results</span>}
      <ScriptList scripts={results} />
      {extraResults.length > 0 && (
        <span>... plus {extraResults.length} more</span>
      )}
    </>
  );
}
