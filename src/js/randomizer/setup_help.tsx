import classnames from "classnames";
import React, { useContext } from "react";
import { CharacterInfo } from "../botc/roles";
import { Selection } from "./characters";
import {
  SetupModification, SetupChanges, distributionForCount,
  modifiedDistribution, Distribution, effectiveDistribution, sameDistribution
} from "../botc/setup";
import { CharacterContext } from "./character_context";
import { characterClass } from "../views";

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
    case "drunk":
    case "marionette": {
      return <span>(+1 townsfolk, not added to bag)</span>;
    }
    case "godfather": {
      return <span>(+1 or &#x2212;1 outsider)</span>;
    }
    case "lilmonsta": {
      return <span>(+1 minion, not added to bag)</span>;
    }
    case "huntsman": {
      return <span>(+the <span className="good">Damsel</span>)</span>;
    }
    case "riot": {
      return <span>(All minions are <span className="evil">Riot</span>)</span>
    }
    case "sentinel": {
      return <span>(might be +1 or &#x2212;1 outsider)</span>
    }
  }
}

export function SetupModifiers(props: {
  numPlayers: number,
  selection: Selection
}) {
  let { selection } = props;
  const characters = useContext(CharacterContext);
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
  let actual = effectiveDistribution(props.numPlayers, selected);
  let distributionCorrect = newDistributions.some(dist => sameDistribution(dist, actual));

  return <div className="modifiers">
    <br />
    {modified.map(char => {
      return <div key={char.id}>
        <span className={classnames(characterClass(char), "bold")}>
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
