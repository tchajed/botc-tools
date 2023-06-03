import classnames from "classnames";
import React, { useContext } from "react";
import { Selection } from "./characters";
import {
  SetupModification, SetupChanges,
  Distribution, effectiveDistribution,
  sameDistribution, modifyingCharacters, targetDistributions, splitSelectedChars
} from "../botc/setup";
import { CharacterContext } from "./character_context";
import { characterClass } from "../views";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import '../icons';

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
  let { numPlayers, selection } = props;
  const characters = useContext(CharacterContext);
  const modified = modifyingCharacters(selection, characters);
  const newDistributions = targetDistributions(numPlayers,
    modified, characters);

  const selected = characters.filter(c => selection.has(c.id));
  let actual = effectiveDistribution(numPlayers, selected);
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

export function BagSetupHelp(props: {
  numPlayers: number,
  selection: Selection,
}): JSX.Element {
  let { numPlayers, selection } = props;
  const characters = useContext(CharacterContext);
  const modified = modifyingCharacters(selection, characters);
  const targets = targetDistributions(numPlayers,
    modified, characters);
  const selected = characters.filter(c => selection.has(c.id));
  let actual = effectiveDistribution(numPlayers, selected);

  const { bag } = splitSelectedChars(characters, selection, numPlayers);

  if (bag.length == numPlayers) {
    if (targets.some(d => sameDistribution(d, actual))) {
      return <span className="success">
        {bag.length}/{numPlayers} characters
        &nbsp;<FontAwesomeIcon icon="circle-check" />
      </span>;
    }
    // the right total number but something is wrong with the distribution
    return <>{bag.length}/{numPlayers} characters
      <span className="error"> (<FontAwesomeIcon icon="thumbs-down" /> distribution)
      </span>
    </>
  }
  return <span className="error">{bag.length}/{numPlayers} characters</span>;
}
