import classnames from "classnames";
import React from "react";
import { CharacterInfo } from "../botc/roles";
import { Selection } from "./characters";
import {
  SetupModification, SetupChanges, distributionForCount,
  modifiedDistribution, actualDistribution, differentRoleTypes, Distribution
} from "../botc/setup";

export function Distr({ dist }: { dist: Distribution }): JSX.Element {
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


function ModificationExplanation(props: { mod: SetupModification }): JSX.Element {
  let { mod } = props;
  switch (mod.type) {
    case "outsider_count": {
      const change = Math.abs(mod.delta);
      const sign = mod.delta > 0 ? <>+</> : <>&#x2212;</>;
      const plural = change == 1 ? "" : "s";
      return <span>({sign}{change} outsider{plural})</span>;
    }
    case "drunk": {
      return <span>(+1 townsfolk, not added to bag)</span>;
    }
    case "godfather": {
      return <span>(+1 or &#x2212;1 outsider)</span>;
    }
    case "lilmonsta": {
      return <span>(+1 minion, not added to bag)</span>;
    }
  }
}

export function SetupModifiers(props: {
  numPlayers: number,
  characters: CharacterInfo[],
  selection: Selection
}) {
  let { characters, selection } = props;
  var modified: CharacterInfo[] = [];
  selection.forEach(id => {
    if (id in SetupChanges) {
      const c = characters.find(c => c.id == id);
      if (c) { modified.push(c); }
    }
  })
  modified.sort();

  const baseDistribution = distributionForCount(props.numPlayers);
  const newDistributions = modifiedDistribution(
    baseDistribution,
    modified.map(c => SetupChanges[c.id]),
    characters,
  );

  const selected = characters.filter(c => selection.has(c.id));
  let actual = actualDistribution(selected);
  let distributionCorrect = newDistributions.some(dist =>
    differentRoleTypes(dist, actual).length == 0);

  return <div className="modifiers">
    <br />
    {modified.map(char => {
      return <div key={char.id}>
        <span className={classnames(char.good ? "good" : "evil", "bold")}>
          {char.name}
        </span>
        <span> {<ModificationExplanation mod={SetupChanges[char.id]} />}</span>
      </div>;
    })}
    {modified.length > 0 && <div>
      <span className="label">target: </span>
      {newDistributions
        .map((dist, i) => <Distr dist={dist} key={i} />)
        .reduce((acc, x) => acc === null ? x : <>{acc} or {x}</>)}
    </div>}
    <div>
      <span className="label">actual: </span> <Distr dist={actual} />
      {distributionCorrect && <span className="bold">&#x2713;</span>}
    </div>
  </div>;
}
