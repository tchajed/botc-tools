import React from 'react';

interface Script {
  id: string,
  title: string,
}

function ScriptTable(props: { scripts: Script[] }): JSX.Element {
  return <table>
    <tbody>
      {props.scripts.map(script =>
        <ScriptRow script={script} key={script.id} />)}
    </tbody>
  </table>;
}

function ScriptRow(props: { script: Script }): JSX.Element {
  const { id, title } = props.script;
  return <tr>
    <td className="title-cell">
      <a href={`./roles.html?id=${id}`}>{title}</a>
    </td>
    <td className="nightsheet-cell">
      <div className="btn">
        <a href={`./nightsheet.html?id=${id}`}>Night order</a>
      </div>
    </td>
    <td className="randomizer-cell">
      <div className="btn">
        <a href={`./randomize.html?id=${id}`}>Select roles</a>
      </div>
    </td>
  </tr>
}

export function App(props: { scripts: Script[] }): JSX.Element {
  const baseThree = props.scripts.filter(s => ["178", "180", "181"].includes(s.id));
  const custom = props.scripts.filter(s => !["178", "180", "181"].includes(s.id));
  custom.sort((s1, s2) => s1.title.localeCompare(s2.title));
  return <div>
    <h1>BotC tools</h1>
    <h2>Base 3</h2>
    <ScriptTable scripts={baseThree} />
    <h2>Custom</h2>
    <ScriptTable scripts={custom} />
  </div>;
}
