import { ScriptList } from "./script_list";
import { queryMatches, searchNormalize } from "./search";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ScriptData } from "botc/script";
import { isSafari } from "detect";

export function SearchResults(props: {
  scripts: ScriptData[];
  query: string;
  setQuery: (q: string) => void;
}): JSX.Element {
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
      <div id="search">
        <input
          id="search-query"
          type="search"
          placeholder="search"
          value={query}
          onChange={queryChange}
        />
        {showSearchIcon && (
          <>
            &nbsp;
            <span className="icon">
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
