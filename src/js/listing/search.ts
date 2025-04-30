import { type ScriptData, type ScriptsFile } from "../../../common/src/script";
import {
  makeCharacterSearcher,
  makeTitleSearcher,
} from "../../../common/src/search";
import { roles } from "../botc/roles";
import { BaseThree } from "./script_list";
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
  scriptsFile: ScriptsFile,
  query: string,
  limit: number,
  authenticated: boolean,
): Map<number, ScriptData> {
  const favoriteScripts = React.useMemo(
    () =>
      new Map(
        scriptsFile.scripts
          .filter((s) => FAVORITE_TITLES.has(s.title))
          .map((s) => [s.pk, s]),
      ),
    [scriptsFile],
  );

  const titleSearcher = React.useMemo(
    () => makeTitleSearcher(scriptsFile.scripts, scriptsFile.titleFuseIndex),
    [scriptsFile],
  );

  const characterSearcher = React.useMemo(
    () =>
      makeCharacterSearcher(
        roles,
        scriptsFile.scripts,
        scriptsFile.characterFuseIndex,
      ),
    [scriptsFile],
  );

  const [matches, setMatches] = React.useState(favoriteScripts);

  // Wait for the user to stop typing before searching
  const debounceSearchRef =
    React.useRef<DebouncedFunc<(query: string) => void>>();
  React.useEffect(() => {
    const debounceSearch = debounce((query: string) => {
      if (query === "") {
        setMatches(favoriteScripts);
        return;
      }

      const matches = new Map<number, ScriptData>();
      console.time("title-search");
      const scriptsWithTitlesOrAuthors = titleSearcher.search(query, {
        limit,
      });
      for (const matchResult of scriptsWithTitlesOrAuthors) {
        const script = matchResult.item;
        if (BaseThree.includes(script.pk)) {
          // Filter the base three scripts from search results
          continue;
        } else if (!authenticated && script.allAmne) {
          // Filter the hidden script from search results
          continue;
        }
        matches.set(script.pk, script);
      }
      console.timeEnd("title-search");
      if (matches.size < 10 && query.length > 0) {
        console.time("char-search");
        // fill in results with character-based search
        const scriptsWithCharacters = characterSearcher.search(query, {
          limit,
        });
        for (const matchResult of scriptsWithCharacters) {
          const script = matchResult.item;
          matches.set(script.pk, script);
        }
        console.timeEnd("char-search");
      }

      setMatches(matches);
    }, 300);
    debounceSearchRef.current = debounceSearch;
    return () => {
      debounceSearchRef.current = undefined;
      debounceSearch.cancel();
    };
  }, [favoriteScripts, titleSearcher, characterSearcher]);

  // Run the debounced search when the query changes
  React.useEffect(() => {
    debounceSearchRef.current?.(query);
  }, [query]);

  return matches;
}

export function searchNormalize(query: string): string {
  return query.toLowerCase().replaceAll(/ +/g, " ").replaceAll(/[']/g, "");
}
