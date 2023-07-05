import { ScriptData } from "../botc/script";
import "../icons";
import { ScriptState, initStorage, latestScript } from "../randomizer/state";
import { clearSavedScroll, pageUrl } from "../routing";
import { BaseThree, ScriptList } from "./script_list";
import { searchNormalize } from "./search";
import { SearchResults } from "./search_results";
import { Global, css } from "@emotion/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { lighten } from "polished";
import { useEffect, useState } from "react";
import { GlobalStyle } from "styles/global_style";
import { IndexStyles } from "styles/index_style";

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

function GitHubLink(): JSX.Element {
  return (
    <a
      href="https://github.com/tchajed/botc-tools"
      target="_blank"
      css={css`
        &,
        &:visited {
          color: white;
          background-color: black;
          border-radius: 0.25rem;
          padding: 0.25rem;
          &:hover {
            background-color: ${lighten(0.3, "black")};
            text-decoration: none;
          }
        }
      `}
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
      if (elapsedMs <= 90 /* minutes */ * 60 * 1000) {
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

  return (
    <div>
      <Global styles={[GlobalStyle, IndexStyles]} />
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
        <SearchResults scripts={custom} query={query} setQuery={setQuery} />
        <HelpText />
        <footer
          css={css`
            margin-top: 3em;
            font-size: 90%;
            max-width: 10rem;
            float: right;
          `}
        >
          <GitHubLink />
          <p css={{ textAlign: "justify" }}>
            This is an unofficial app not affiliated with The Pandamonium
            Institute.
          </p>
        </footer>
      </div>
    </div>
  );
}
