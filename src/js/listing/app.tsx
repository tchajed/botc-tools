import React, { useEffect, useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import '../icons';
import { pageUrl } from '../routing';
import { ScriptData, getCharacterList, isTeensyville, onlyBaseThree } from '../botc/script';
import { queryMatches, searchNormalize } from './search';
import { nameToId } from '../botc/roles';

const BaseThree = [178, 180, 181];

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
    <li>
      These tools are meant to support in-person games.
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
  // TODO: normalizing these ids is an ugly hack, we should standardize on
  // script tool IDs
  const chars = getCharacterList(props.script.characters.map(id => nameToId(id)));
  let id = (pk || 0).toString();
  return <tr>
    <td className="title-cell">
      <a href={pageUrl("roles", id)}>
        {title}
      </a>
      {isTeensyville(chars) &&
        <>&nbsp;<span className="script-label">teensy</span></>}
      {onlyBaseThree(chars) && !BaseThree.includes(pk) &&
        <>&nbsp;<span className="script-label">base3</span></>}
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
  const baseThree = props.scripts.filter(s => BaseThree.includes(s.pk));
  baseThree.sort((s1, s2) => s1.pk - s2.pk);
  const custom = props.scripts.filter(s => !BaseThree.includes(s.pk));

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

  const allResults = queryMatches(custom, query);
  const results = allResults.slice(0, 20);
  const extraResults = allResults.slice(20);

  // on Safari the search box already has a magnifying glass icon so avoid
  // adding a redundant one
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  return <div>
    <div className="main">
      <h1>BotC tools</h1>

      <h2>Base 3</h2>
      <ScriptTable scripts={baseThree} />
      <h2>Custom</h2>
      <div id="search">
        <input id="search-query" type="search" placeholder="search" value={query} onChange={queryChange} />
        {!isSafari && <>&nbsp;<span className="icon">
          <FontAwesomeIcon icon="search" />
        </span></>}
      </div>
      <ScriptTable scripts={results} />
      {extraResults.length > 0 && <span>... plus {extraResults.length} more</span>}

      <HelpText />
      <footer>
        <div className="link-block"><GitHubLink /></div>
        <p>This is an unofficial app not affiliated with The
          Pandamonium Institute.</p>
      </footer>
    </div>
  </div>
}
