import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Distribution, distributionForCount, zeroDistribution } from './botc/setup';
// import h from 'react-hyperscript';
// import hh from 'hyperscript-helpers';
// const { div, h1, strong, br, span, label, input, hr, button, template } = hh(h);

function Distr({ dist }: { dist: Distribution }): JSX.Element {
  return <span className='distribution'>
    <span className='good'>{dist.townsfolk}</span>
    /
    <span className='good'>{dist.outsider}</span>
    /
    <span className='evil'>{dist.minion}</span>
    /
    <span className='evil'>{dist.demon}</span>
  </span>;
}

function BaseDistr({ numPlayers }: { numPlayers: number | "" }): JSX.Element {
  const dist = numPlayers == "" ? zeroDistribution() : distributionForCount(numPlayers);
  return <>
    <span className='label'>base: </span>
    <Distr dist={dist} />
  </>;
}

interface NumPlayerVar {
  numPlayers: number | "",
  setNumPlayers: (n: number | "") => void,
}

function NumPlayerSelector({ numPlayers, setNumPlayers }: NumPlayerVar): JSX.Element {
  function handleIncDec(delta: number): () => void {
    return () => {
      setNumPlayers(numPlayers ? (numPlayers + delta) : 5);
    };
  }

  // function handleChange(ev) {
  //   if (ev.target instanceof HTMLInputElement) {
  //     const val = ev.target.value;
  //     if (val == "") {
  //       setNumPlayers("");
  //     } else {
  //       setNumPlayers(parseInt(val));
  //     }
  //   }
  // }

  return <div className='players'>
    <div>
      <label className='label' htmlFor='numPlayers'>players: </label>
      <button onClick={handleIncDec(-1)}>-</button>
      <input value={numPlayers} readOnly={true}></input>
      <button onClick={handleIncDec(+1)}>+</button>
    </div>
    <div>
      <BaseDistr numPlayers={numPlayers} />
    </div>
  </div>;
}

function App() {
  const [numPlayers, setNumPlayers] = useState<number | "">(8);
  return <div>
    <NumPlayerSelector {...{ numPlayers, setNumPlayers }} />
  </div>;
}

const container = document.getElementById("app");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
