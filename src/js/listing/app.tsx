import { ScriptData } from "../botc/script";
import "../icons";
import { ScriptState, initStorage, latestScript } from "../randomizer/state";
import { clearSavedScroll, pageUrl } from "../routing";
import { BaseThree, ScriptList } from "./script_list";
import { searchNormalize } from "./search";
import { SearchResults } from "./search_results";
import { Global, ThemeProvider, css } from "@emotion/react";
import styled from "@emotion/styled";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { lighten } from "polished";
import { useEffect, useState } from "react";
import { GlobalStyle } from "styles/global_style";
import { IndexStyles } from "styles/index_style";
import { theme } from "theme";

const BtnSpan = styled.span`
  padding: 0.4rem 0.5rem;
  border-radius: 0.25rem;
  background-color: ${(props) => props.theme.color.primary};
  color: white;
`;

const BtnLink = styled(BtnSpan.withComponent("a"))`
  &:hover {
    background-color: ${(props) => lighten(0.2, props.theme.color.primary)};
  }

  &:hover,
  &:visited {
    color: white;
    text-decoration: none;
  }
`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function UpdateBar(): JSX.Element {
  // Set disabled class to hide the bar.
  //
  // Need to hook up to service worker events, and offer a refresh button.
  return (
    <div
      css={css`
        &.disabled {
          display: none;
        }

        background-color: lightgreen;
        color: black;
        line-height: 2rem;
        margin-bottom: 1rem;
      `}
    >
      <div className="main">
        A new version is available. Close all tabs to restart.
      </div>
    </div>
  );
}

function HelpText(): JSX.Element {
  const buttonHelp = [
    <li key="roles">
      <BtnSpan>
        <FontAwesomeIcon icon="list" />
        &nbsp; Roles
      </BtnSpan>
      &nbsp; is a character sheet
    </li>,
    <li key="night">
      <BtnSpan>
        <FontAwesomeIcon icon="moon" />
        &nbsp; Night
      </BtnSpan>
      &nbsp; lists the night order
    </li>,
    <li key="assign">
      <BtnSpan>
        <FontAwesomeIcon icon="dice" />
        &nbsp; Assign
      </BtnSpan>
      &nbsp; helps the ST select & assign roles
    </li>,
  ];
  return (
    <ul
      className="help"
      css={[
        {
          marginTop: "3rem",
        },
        css`
          li:not(:last-of-type) {
            padding-bottom: 1rem;
          }
        `,
      ]}
    >
      <li>Each script has these tools:</li>
      {buttonHelp}
      <li>These tools are meant to support in-person games.</li>
    </ul>
  );
}

const BlackBtn = styled.a`
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
`;

function GitHubLink(): JSX.Element {
  return (
    <BlackBtn href="https://github.com/tchajed/botc-tools" target="_blank">
      <FontAwesomeIcon icon={["fab", "github"]} />
      &nbsp; GitHub source
    </BlackBtn>
  );
}

function Footer(): JSX.Element {
  return (
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
        This is an unofficial app not affiliated with The Pandamonium Institute.
      </p>
    </footer>
  );
}

const scriptLinkStyle = {
  link: css`
    float: right;
    margin-top: 1rem;
    font-size: 90%;
  `,
  title: css`
    display: inline-block;
    vertical-align: bottom;
    max-width: 8rem;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  `,
};

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
    <ThemeProvider theme={theme}>
      <div>
        <Global styles={[GlobalStyle, IndexStyles]} />
        <div className="main">
          {lastScript && (
            <div css={scriptLinkStyle.link}>
              <BtnLink href={pageUrl("assign", lastScript.id.toString())}>
                <span css={scriptLinkStyle.title}>
                  {lastScript.scriptTitle}
                </span>
                &nbsp; <FontAwesomeIcon icon="chevron-right" />
              </BtnLink>
            </div>
          )}
          <h1>BotC tools</h1>
          <h2>Base 3</h2>
          <ScriptList scripts={baseThree} />
          <h2>Custom</h2>
          <SearchResults scripts={custom} query={query} setQuery={setQuery} />
          <HelpText />
          <Footer />
        </div>
      </div>
    </ThemeProvider>
  );
}
