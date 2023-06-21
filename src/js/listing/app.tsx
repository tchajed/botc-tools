import { nameToId } from "../botc/roles";
import {
  ScriptData,
  getCharacterList,
  isTeensyville,
  onlyBaseThree,
} from "../botc/script";
import { isSafari } from "../detect";
import "../icons";
import { ScriptState, initStorage, latestScript } from "../randomizer/state";
import { clearSavedScroll, pageUrl } from "../routing";
import { queryMatches, searchNormalize } from "./search";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";

const BaseThree = [178, 180, 181];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function UpdateBar(): JSX.Element {
  // Set disabled class to hide the bar.
  //
  // Need to hook up to service worker events, and offer a refresh button.
  return (
    <div id="update">
      <div className="main">
        A new version is available. Close all tabs to restart.
      </div>
    </div>
  );
}

function HelpText(): JSX.Element {
  const buttonHelp = [
    <li key="roles">
      <span className="btn-link">
        <span className="btn">
          <FontAwesomeIcon icon="list" />
          &nbsp; Roles
        </span>
      </span>
      &nbsp; is a character sheet
    </li>,
    <li key="night">
      <span className="btn-link">
        <span className="btn">
          <FontAwesomeIcon icon="moon" />
          &nbsp; Night
        </span>
      </span>
      &nbsp; has the night sheets
    </li>,
    <li key="assign">
      <span className="btn-link">
        <span className="btn">
          <FontAwesomeIcon icon="dice" />
          &nbsp; Assign
        </span>
      </span>
      &nbsp; helps the ST select & assign roles
    </li>,
  ];
  // disable button help for now
  return (
    <ul className="help">
      <li>Each script has these tools:</li>
      {buttonHelp}
      <li>These tools are meant to support in-person games.</li>
    </ul>
  );
}

function ScriptTitleTags({ script }: { script: ScriptData }): JSX.Element {
  // TODO: normalizing these ids is an ugly hack, we should standardize on
  // script tool IDs
  const chars = getCharacterList(script.characters.map((id) => nameToId(id)));
  return (
    <>
      <a href={pageUrl("roles", script.pk)}>{script.title}</a>
      {isTeensyville(chars) && (
        <>
          &nbsp;<span className="script-label">teensy</span>
        </>
      )}
      {onlyBaseThree(chars) && !BaseThree.includes(script.pk) && (
        <>
          &nbsp;<span className="script-label">base3</span>
        </>
      )}
    </>
  );
}

function ScriptRow(props: { script: ScriptData }): JSX.Element {
  const { pk } = props.script;
  return (
    <tr>
      <td className="title-cell">
        <ScriptTitleTags script={props.script} />
      </td>
      <td className="roles-cell">
        <a className="btn-link" href={pageUrl("roles", pk)}>
          <div className="btn">
            <FontAwesomeIcon icon="list" />
            &nbsp; Roles
          </div>
        </a>
      </td>
      <td className="nightsheet-cell">
        <a className="btn-link" href={pageUrl("night", pk)}>
          <div className="btn">
            <FontAwesomeIcon icon="moon" />
            &nbsp; Night
          </div>
        </a>
      </td>
      <td className="randomizer-cell">
        <a className="btn-link" href={pageUrl("assign", pk)}>
          <div className="btn">
            <FontAwesomeIcon icon="dice" />
            &nbsp; Assign
          </div>
        </a>
      </td>
    </tr>
  );
}

// the old table format (with buttons for each page)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ScriptTable(props: { scripts: ScriptData[] }): JSX.Element {
  return (
    <table>
      <tbody>
        {props.scripts.map((script) => (
          <ScriptRow script={script} key={script.pk} />
        ))}
      </tbody>
    </table>
  );
}

function ScriptList(props: { scripts: ScriptData[] }): JSX.Element {
  return (
    <ul className="script">
      {props.scripts.map((script) => {
        return (
          <li key={script.pk}>
            <FontAwesomeIcon icon="table-list" />
            &nbsp;
            <ScriptTitleTags script={script} />
          </li>
        );
      })}
    </ul>
  );
}

function GitHubLink(): JSX.Element {
  return (
    <a
      className="github-link"
      href="https://github.com/tchajed/botc-tools"
      target="_blank"
    >
      <FontAwesomeIcon icon={["fab", "github"]} />
      &nbsp; GitHub source
    </a>
  );
}

export function App(props: { scripts: ScriptData[] }): JSX.Element {
  const baseThree = props.scripts.filter((s) => BaseThree.includes(s.pk));
  baseThree.sort((s1, s2) => s1.pk - s2.pk);
  const custom = props.scripts.filter((s) => !BaseThree.includes(s.pk));

  function removePrefix(s: string, prefix: string): string {
    if (s.startsWith(prefix)) {
      return s.substring(prefix.length);
    }
    return s;
  }

  function hashQuery(): string {
    return decodeURI(removePrefix(window.location.hash, "#"));
  }

  const [query, setQuery] = useState(hashQuery());
  const [lastScript, setLastScript] = useState<ScriptState | null>(null);

  // arbitrary state that changes periodically, to force a re-render
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  useEffect(() => {
    const i = setInterval(() => {
      setElapsedMinutes((m) => m + 1);
    }, 1 * 60 * 1000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    initStorage();
    latestScript().then((s) => {
      if (!s) {
        return;
      }
      const elapsedMs: number = new Date().getDate() - s.lastSave.getDate();
      if (elapsedMs <= 30 /* minutes */ * 60 * 1000) {
        setLastScript(s);
      }
    });
  }, [elapsedMinutes]);

  useEffect(() => {
    // explicit typecast since we want a dynamic global property to communicate
    // with service worker
    (window as { reloadSafe?: boolean })["reloadSafe"] = true;
  }, []);

  useEffect(() => {
    // clear saved scroll position on the assumption we're changing scripts (we
    // could remember which script it's for and invalidate more conservatively
    // but this is a minor bit of state)
    clearSavedScroll();
  }, []);

  useEffect(() => {
    window.onhashchange = () => {
      const newQuery = hashQuery();
      if (
        newQuery != "" &&
        searchNormalize(newQuery) != searchNormalize(query)
      ) {
        setQuery(newQuery);
      }
    };
  }, [query]);

  function queryChange(v: React.ChangeEvent<HTMLInputElement>) {
    const newQuery = v.target.value;
    setQuery(newQuery);
    window.location.hash = searchNormalize(newQuery);
  }

  const allResults = queryMatches(custom, query);
  const results = allResults.slice(0, 20);
  const extraResults = allResults.slice(20);

  // on Safari the search box already has a magnifying glass icon so avoid
  // adding a redundant one
  const showSearchIcon = !isSafari();

  return (
    <div>
      <div className="main">
        {lastScript && (
          <div className="forward-link">
            <a
              className="btn-link"
              href={pageUrl("assign", lastScript.id.toString())}
            >
              <div className="btn">
                <span className="script-title">{lastScript.scriptTitle}</span>
                &nbsp; <FontAwesomeIcon icon="chevron-right" />
              </div>
            </a>
          </div>
        )}
        <h1>BotC tools</h1>

        <h2>Base 3</h2>
        <ScriptList scripts={baseThree} />
        <h2>Custom</h2>
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

        <HelpText />
        <footer>
          <div className="link-block">
            <GitHubLink />
          </div>
          <p>
            This is an unofficial app not affiliated with The Pandamonium
            Institute.
          </p>
        </footer>
      </div>
    </div>
  );
}
