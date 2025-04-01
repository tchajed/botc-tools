import { ScriptsFile } from "../botc/script";
import "../icons";
import {
  ScriptState,
  getPassword,
  latestScript,
  storePassword,
} from "../randomizer/state";
import { clearSavedScroll, pageUrl } from "../routing";
import { BaseThree, ScriptList } from "./script_list";
import { searchNormalize } from "./search";
import { SearchResults } from "./search_results";
import { Global, ThemeProvider, css } from "@emotion/react";
import styled from "@emotion/styled";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { differenceInDays } from "date-fns";
import { isCorrectPassword } from "password";
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
function UpdateBar(): React.JSX.Element {
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

function HelpText(): React.JSX.Element {
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
      <li>
        The wiki has a{" "}
        <a href="https://wiki.bloodontheclocktower.com/Rules_Explanation">
          rules explanation
        </a>{" "}
        for new players.
      </li>
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
    line-height: 1.7rem;
    &:hover {
      background-color: ${lighten(0.3, "black")};
      text-decoration: none;
    }
  }
`;

function GitHubLink(): React.JSX.Element {
  return (
    <BlackBtn href="https://github.com/tchajed/botc-tools" target="_blank">
      <FontAwesomeIcon icon={["fab", "github"]} />
      &nbsp; GitHub source
    </BlackBtn>
  );
}

function EnterPasswordButton(props: {
  password: string;
  setPassword: (password: string) => void;
}): React.JSX.Element {
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    isCorrectPassword(props.password).then((correct) => {
      setIsCorrect(correct);
    });
  }, [props.password]);

  const onClick = () => {
    if (isCorrect) {
      props.setPassword("");
      return;
    }
    const password = prompt("Enter password");
    if (!password) {
      return;
    }
    isCorrectPassword(password).then((correct) => {
      if (correct) {
        props.setPassword(password);
        setIsCorrect(true);
      }
    });
  };

  const text = isCorrect ? "Clear password" : "Enter password";

  return <BlackBtn onClick={onClick}>{text}</BlackBtn>;
}

function showUpdateTime(date: Date): string {
  const dayDifference = differenceInDays(new Date(), date);
  if (dayDifference == 0) {
    return "today";
  }
  if (dayDifference == 1) {
    return "yesterday";
  }
  return date.toLocaleDateString();
  // TODO: couldn't get this to work with date-fns formatting
  /*
  if (dayDifference < 30) {
    return formatDate(date, "MMM d", { locale: enUS });
  }
  return formatDate(date, "MMM d, y", { locale: enUS });
  */
}

function Footer(props: {
  lastUpdate: Date;
  password: string;
  setPassword: (password: string) => void;
}): React.JSX.Element {
  return (
    <footer
      css={css`
        margin-top: 3em;
        font-size: 90%;
        max-width: 10rem;
        float: right;
      `}
    >
      <p>Scripts updated {showUpdateTime(props.lastUpdate)}</p>
      <GitHubLink />
      <br />
      <EnterPasswordButton {...props} />
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

export function App(props: { scriptsFile: ScriptsFile }): React.JSX.Element {
  const [password, setPassword] = useState<string>("");
  const [authenticated, setAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    isCorrectPassword(password).then((correct) => {
      setAuthenticated(correct);
    });
  }, [password]);

  const scripts = props.scriptsFile.scripts;
  const lastUpdate = new Date(Date.parse(props.scriptsFile.lastUpdate));
  const baseThree = scripts.filter((s) => BaseThree.includes(s.pk));
  baseThree.sort((s1, s2) => s1.pk - s2.pk);

  const custom = scripts.filter((s) => {
    if (BaseThree.includes(s.pk)) {
      return false;
    }
    return authenticated || !s.allAmne;
  });

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
    const i = setInterval(
      () => {
        setElapsedMinutes((m) => m + 1);
      },
      1 * 60 * 1000,
    );
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    latestScript().then((s) => {
      if (!s) {
        return;
      }
      const elapsedMs: number = new Date().getDate() - s.lastSave.getDate();
      if (elapsedMs <= 90 /* minutes */ * 60 * 1000) {
        setLastScript(s);
      }
    });
    getPassword().then((p) => {
      setPassword(p);
    });
  }, [elapsedMinutes]);

  const setAndStorePassword = (password: string) => {
    setPassword(password);
    storePassword(password);
  };

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
          <Footer
            lastUpdate={lastUpdate}
            password={password}
            setPassword={setAndStorePassword}
          />
        </div>
      </div>
    </ThemeProvider>
  );
}
