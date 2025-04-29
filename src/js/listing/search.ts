import { type ScriptData } from "../../../common/src/script";
import {
  makeCharacterSearcher,
  makeTitleSearcher,
} from "../../../common/src/search";
import { roles } from "../botc/roles";
import type { DebouncedFunc } from "lodash";
import debounce from "lodash.debounce";
import React from "react";

const FAVORITE_TITLES: Set<string> = new Set([
  "Reptiles II: Lizard in the City",
  "Catfishing",
  "No Roles Barred",
  // "Whose Cult Is It Anyway?",
  "Creme De La Creme",
  // "Laissez un Faire",
  // "High Stakes Betting",
  "Race to the Bottom",
  "Magical Onion Pies",
  "Our Mutual Friend",
]);

/**
 * Fuzzily search through scripts by title, author, and characters
 *
 * @param scripts A corpus of scripts to search through
 * @param query A user-provided search query
 * @returns A Map from primary key to script, sorted with most relevant results first
 */
export function useQueryMatches(
  scripts: ScriptData[],
  query: string,
): Map<number, ScriptData> {
  const favorite_scripts = React.useMemo(
    () =>
      new Map(
        scripts
          .filter((s) => FAVORITE_TITLES.has(s.title))
          .map((s) => [s.pk, s]),
      ),
    [scripts],
  );

  const title_searcher = React.useMemo(
    () => makeTitleSearcher(scripts),
    [scripts],
  );

  const character_searcher = React.useMemo(
    () => makeCharacterSearcher(roles, scripts),
    [roles, scripts],
  );

  const [matches, setMatches] = React.useState(favorite_scripts);

  // Wait for the user to stop typing before searching
  const debounceSearchRef =
    React.useRef<DebouncedFunc<(query: string) => void>>();
  React.useEffect(() => {
    const debounceSearch = debounce((query: string) => {
      if (query === "") {
        setMatches(favorite_scripts);
        return;
      }

      const matches = new Map<number, ScriptData>();
      const scripts_with_titles_or_authors = title_searcher.search(query);
      for (const match_result of scripts_with_titles_or_authors) {
        const script = match_result.item;
        matches.set(script.pk, script);
      }
      if (matches.size < 10) {
        // fill in results with character-based search
        const scripts_with_characters = character_searcher.search(query);
        for (const match_result of scripts_with_characters) {
          const script = match_result.item;
          matches.set(script.pk, script);
        }
      }

      setMatches(matches);
    }, 300);
    debounceSearchRef.current = debounceSearch;
    return () => {
      debounceSearchRef.current = undefined;
      debounceSearch.cancel();
    };
  }, [favorite_scripts, title_searcher, character_searcher]);

  // Run the debounced search when the query changes
  React.useEffect(() => {
    debounceSearchRef.current?.(query);
  }, [query]);

  return matches;
}

export function searchNormalize(query: string): string {
  return query.toLowerCase().replaceAll(/ +/g, " ").replaceAll(/[']/g, "");
}
