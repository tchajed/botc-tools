import React, { useEffect, useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import '../icons';
import { pageUrl } from '../routing';
import { ScriptData } from '../botc/script';
import { queryMatches, searchNormalize } from './search';

function UpdateBar(): JSX.Element {
  // Set disabled class to hide the bar.
  //
  // Need to hook up to service worker events, and offer a refresh button.
  return <div id="update">
    <div className="main">
      A new version is available. Close all tabs to restart.
    </div>
  </div>
}

function HelpText(): JSX.Element {
  return <ul className="help">
    <li>
      <span className="btn-link">
        <span className="btn"><FontAwesomeIcon
          icon="list" />&nbsp; Roles</span></span>
      &nbsp; is a character sheet
    </li>
    <li><span className="btn-link"> <span className="btn"><FontAwesomeIcon
      icon="moon" />&nbsp; Night</span></span> &nbsp; is the night order
    </li>
    <li><span className="btn-link"> <span className="btn"><FontAwesomeIcon
      icon="dice" />&nbsp; Assign</span></span> &nbsp; helps the Storyteller
      select & assign roles
    </li>
  </ul>
}

function ScriptTable(props: { scripts: ScriptData[] }): JSX.Element {
  return <table>
    <tbody>
      {props.scripts.map(script =>
        <ScriptRow script={script} key={script.pk} />)}
    </tbody>
  </table>
}

function ScriptRow(props: { script: ScriptData }): JSX.Element {
  const { pk, title } = props.script;
  let id = (pk || 0).toString();
  return <tr>
    <td className="title-cell">
      <a href={pageUrl("roles", id)}>
        {title}
      </a>
    </td>
    <td className="roles-cell">
      <a className="btn-link" href={pageUrl("roles", id)}>
        <div className="btn">
          <FontAwesomeIcon icon="list" />&nbsp;
          Roles
        </div>
      </a>
    </td>
    <td className="nightsheet-cell">
      <a className="btn-link" href={pageUrl("nightsheet", id)}>
        <div className="btn">
          <FontAwesomeIcon icon="moon" />&nbsp;
          Night
        </div>
      </a>
    </td>
    <td className="randomizer-cell">
      <a className="btn-link" href={pageUrl("randomize", id)}>
        <div className="btn">
          <FontAwesomeIcon icon="dice" />&nbsp;
          Assign
        </div>
      </a>
    </td>
  </tr>
}

function GitHubLink(): JSX.Element {
  return <a className="github-link" href="https://github.com/tchajed/botc-tools" target="_blank">
    <FontAwesomeIcon icon={['fab', 'github']} />&nbsp;
    GitHub source
  </a>
}

export function App(props: { scripts: ScriptData[] }): JSX.Element {
  const baseThree = props.scripts.filter(s => [178, 180, 181].includes(s.pk));
  const custom = props.scripts.filter(s => ![178, 180, 181].includes(s.pk));

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

  useEffect(() => {
    window['reloadSafe'] = true;
  }, []);

  useEffect(() => {
    window.onhashchange = () => {
      var newQuery = hashQuery();
      if (newQuery != "" && searchNormalize(newQuery) != searchNormalize(query)) {
        setQuery(newQuery);
      }
    }
  }, [query]);

  function queryChange(v: React.ChangeEvent<any>) {
    const newQuery = v.target.value;
    setQuery(newQuery);
    window.location.hash = searchNormalize(newQuery);
  }

  return <div>
    <div className="main">
      <h1>BotC tools</h1>

      <h2>Base 3</h2>
      <ScriptTable scripts={baseThree} />
      <h2>Custom</h2>
      <div id="search">
        <input id="search-query" type="search" placeholder="search" value={query} onChange={queryChange} />
        &nbsp;<span className="icon">
          <FontAwesomeIcon icon="search" />
        </span>
        &nbsp;
      </div>
      <ScriptTable scripts={queryMatches(custom, query)} />

      <br /><br />
      <HelpText />
      <p>These tools are meant to support in-person games.</p>
      <footer>
        <div className="link-block"><GitHubLink /></div>
        <p>This is an unofficial app not affiliated with The
          Pandamonium Institute.</p>
      </footer>
    </div>
  </div>
}
