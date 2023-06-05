import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import '../icons';

interface Script {
  id: string,
  title: string,
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

function ScriptTable(props: { scripts: Script[] }): JSX.Element {
  return <table>
    <tbody>
      {props.scripts.map(script =>
        <ScriptRow script={script} key={script.id} />)}
    </tbody>
  </table>
}

function ScriptRow(props: { script: Script }): JSX.Element {
  const { id, title } = props.script;
  return <tr>
    <td className="title-cell">
      <a href={`./roles.html#${id}`}>
        {title}
      </a>
    </td>
    <td className="roles-cell">
      <a className="btn-link" href={`./roles.html#${id}`}>
        <div className="btn">
          <FontAwesomeIcon icon="list" />&nbsp;
          Roles
        </div>
      </a>
    </td>
    <td className="nightsheet-cell">
      <a className="btn-link" href={`./nightsheet.html#${id}`}>
        <div className="btn">
          <FontAwesomeIcon icon="moon" />&nbsp;
          Night
        </div>
      </a>
    </td>
    <td className="randomizer-cell">
      <a className="btn-link" href={`./randomize.html#${id}`}>
        <div className="btn">
          <FontAwesomeIcon icon="dice" />&nbsp;
          Assign
        </div>
      </a>
    </td>
  </tr>
}

function GitHubLink(): JSX.Element {
  return <a href="https://github.com/tchajed/botc-tools" target="_blank">
    <span className="github-link">
      <FontAwesomeIcon icon={['fab', 'github']} />&nbsp;
      GitHub source
    </span>
  </a>
}

export function App(props: { scripts: Script[] }): JSX.Element {
  const baseThree = props.scripts.filter(s => ["178", "180", "181"].includes(s.id));
  const custom = props.scripts.filter(s => !["178", "180", "181"].includes(s.id));
  custom.sort((s1, s2) => s1.title.localeCompare(s2.title));
  return <div>
    <div className="main">
      <h1>BotC tools</h1>

      <h2>Base 3</h2>
      <ScriptTable scripts={baseThree} />
      <h2>Custom</h2>
      <ScriptTable scripts={custom} />

      <br /><br />
      <HelpText />
      <p>These tools are meant to support in-person games.</p>
      <footer>
        <GitHubLink />
      </footer>
    </div>;
  </div>
}
