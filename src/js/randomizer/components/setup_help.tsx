import "../../icons";
import { CharacterContext } from "../character_context";
import { Selection } from "../selection";
import styled from "@emotion/styled";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CharacterInfo } from "botc/roles";
import {
  SetupModification,
  SetupChanges,
  Distribution,
  effectiveDistribution,
  sameDistribution,
  modifyingCharacters,
  targetDistributions,
  splitSelectedChars,
  uniqueDistributions,
} from "botc/setup";
import classnames from "classnames";
import { characterClass } from "components/character_icon";
import { Distr } from "components/num_players";
import { useContext } from "react";
import { ErrorSpan, SuccessSpan } from "styles/error_msg";

export function LegionDistr({
  dist,
}: {
  dist: Distribution;
}): React.JSX.Element {
  const Num = styled.span`
    // make each number fixed-width
    display: inline-block;
    min-width: 1rem;
    text-align: center;
  `;
  return (
    <span className="distribution">
      <Num className="good">{dist.townsfolk + dist.outsider}</Num>/
      <Num className="evil">{dist.demon}</Num>
    </span>
  );
}

export function KazaliDistr({
  dist,
}: {
  dist: Distribution;
}): React.JSX.Element {
  const Num = styled.span`
    // make each number fixed-width
    display: inline-block;
    min-width: 1rem;
    text-align: center;
  `;
  return (
    <span className="distribution">
      <Num className="good">{dist.townsfolk + dist.outsider}</Num>/
      <Num className="evil">{dist.demon}</Num>
    </span>
  );
}

export function AtheistDistr(props: { numPlayers: number }): React.JSX.Element {
  return (
    <span className="distribution">
      <span className="good">{props.numPlayers}</span>/
      <span className="evil">0</span>
    </span>
  );
}

function arrayEq<T>(a1: T[], a2: T[]): boolean {
  return a1.length == a2.length && a1.every((v, i) => a2[i] === v);
}

// UI element that explains a setup rule
//
// characters is the script characters (for Heretic/Baron jinx, where the
// presence of the Heretic modifies how the Baron works)
function ModificationExplanation(props: {
  mod: SetupModification;
  characters: CharacterInfo[];
}): React.JSX.Element {
  const { mod, characters } = props;
  switch (mod.type) {
    case "outsider_count": {
      if (mod.delta.length == 1) {
        const delta = mod.delta[0];
        const change = Math.abs(delta);
        const sign = delta > 0 ? <>+</> : <>&#x2212;</>;
        const plural = change == 1 ? "" : "s";
        return (
          <span>
            ({sign}
            {change} outsider{plural})
          </span>
        );
      }
      // godfather
      if (arrayEq(mod.delta, [+1, -1])) {
        return <span>(+1 or &#x2212;1 outsider)</span>;
      }
      // balloonist (after change)
      if (arrayEq(mod.delta, [0, +1]) || arrayEq(mod.delta, [+1, 0])) {
        return <span>(+0 or +1 outsider)</span>;
      }
      // sentinel
      if (arrayEq(mod.delta, [0, +1, -1]) || arrayEq(mod.delta, [+1, 0, -1])) {
        return <span>(might be +1 or &#x2212;1 outsider)</span>;
      }
      console.warn(`unhandled modifier ${mod}`);
      return <span>(unknown)</span>;
    }
    case "drunk":
    case "marionette": {
      return <span>(+1 townsfolk, not distributed)</span>;
    }
    case "baron": {
      if (characters.find((c) => c.id === "heretic")) {
        return (
          <span>
            (+1 or +2 outsiders, due to <span className="good">Heretic</span>)
          </span>
        );
      }
      return <span>(+2 outsiders)</span>;
    }
    case "lilmonsta": {
      return <span>(+1 minion, not distributed)</span>;
    }
    case "huntsman":
      return (
        <span>
          (+the <span className="good">Damsel</span>)
        </span>
      );
    case "haruspex":
      return (
        <span>
          (+<span className="good">Spartacus</span>)
        </span>
      );
    case "choirboy":
      return (
        <span>
          (+the <span className="good">King</span>)
        </span>
      );
    case "riot": {
      return (
        <span>
          (All minions are <span className="evil">Riot</span>)
        </span>
      );
    }
    case "legion": {
      return (
        <span>
          (Most players are <span className="evil">Legion</span>)
        </span>
      );
    }
    case "atheist": {
      return <span>(No evil, setup is arbitrary)</span>;
    }
    case "kazali": {
      return <span>(Arbitrary outsiders, no minions in bag)</span>;
    }
    case "actor": {
      return (
        <span>
          (All good players are <span className="good">Actor</span>s)
        </span>
      );
    }
    case "villageidiot": {
      return (
        <span>
          (+0 to +2 <span className="good">Village Idiot</span>)
        </span>
      );
    }
    case "summoner": {
      return (
        <span>
          (No <span className="evil">demon</span>)
        </span>
      );
    }
    case "xaan": {
      return <span>(X outsiders)</span>;
    }
    case "hermit": {
      return <span>(&#x2212;0 or &#x2212;1 outsider)</span>;
    }
    case "lordoftyphon":
      return (
        <span>
          (+1 <span className="evil">Minion</span>, arbitrary outsiders)
        </span>
      );
    case "legionary": {
      return (
        <span>
          (+0 to +2 <span className="good">Legionary</span>)
        </span>
      );
    }
    case "hannibal":
      return (
        <span>
          (Two good players are <span className="evil">Hannibal</span>, not in
          bag)
        </span>
      );
    case "minion_ppp":
      return (
        <span>
          (-1 <span className="evil">Minion</span>)
        </span>
      );
    case "babygronk_battc":
      return (
        <span>
          (+2 <span className="evil">Minion</span>)
        </span>
      );
  }
}

function elementOrList(els: React.JSX.Element[]): React.JSX.Element {
  return (
    <>
      {els.reduce((acc, x) =>
        acc === null ? (
          x
        ) : (
          <>
            {acc} or {x}
          </>
        ),
      )}
    </>
  );
}

function ModificationList(props: {
  modified: CharacterInfo[];
  characters: CharacterInfo[];
}): React.JSX.Element {
  const { modified } = props;
  return (
    <>
      {modified.map((char) => {
        return (
          <div key={char.id}>
            <span className={classnames(characterClass(char), "bold")}>
              {char.name}
            </span>
            <span>
              {" "}
              {
                <ModificationExplanation
                  mod={SetupChanges[char.id]}
                  characters={props.characters}
                />
              }
            </span>
          </div>
        );
      })}
    </>
  );
}

const StickyDistHelp = styled.div`
  position: sticky;
  display: inline-block;
  top: 5rem;
  z-index: 999;
  background-color: white;
  border-radius: 0.25rem;
  border: 1px solid #666;
  box-shadow: 0px 3px 3px 0;
  padding: 5px;
  margin-bottom: 1rem;
`;
const DistLabel = styled.span`
  width: 4.5rem;
  display: inline-block;
`;
const DistIcon = styled(FontAwesomeIcon)`
  width: 1.5rem;
  display: inline-block;
  text-align: center;
`;

export function SetupModifiers(props: {
  numPlayers: number;
  selection: Selection;
}) {
  const { numPlayers, selection } = props;
  const characters = useContext(CharacterContext);
  const modified = modifyingCharacters(selection);
  const newDistributions = targetDistributions(
    numPlayers,
    modified,
    characters,
  );

  const selected = characters.filter((c) => selection.has(c.id));
  const actual = effectiveDistribution(numPlayers, selected);
  const distributionCorrect = newDistributions.some((dist) =>
    sameDistribution(dist, actual),
  );

  let goalDistributionElement: React.JSX.Element = elementOrList(
    newDistributions.map((dist, i) => <Distr dist={dist} key={i} />),
  );
  if (selection.has("legion")) {
    // only for presentation purposes
    const newLegionDistributions: Distribution[] = uniqueDistributions(
      newDistributions.map((dist) => {
        return {
          townsfolk: dist.townsfolk + dist.outsider,
          outsider: 0,
          minion: 0,
          demon: dist.demon,
        };
      }),
    );
    goalDistributionElement = elementOrList(
      newLegionDistributions.map((dist, i) => (
        <LegionDistr dist={dist} key={i} />
      )),
    );
  }
  if (selection.has("atheist")) {
    goalDistributionElement = <AtheistDistr numPlayers={numPlayers} />;
  }
  // TODO: want lord of typhon to be presented differently if it allows
  // selecting minions that don't go in the bag
  if (
    selection.has("kazali") ||
    selection.has("lordoftyphon") ||
    selection.has("xaan")
  ) {
    const collapsedGoodDistributions: Distribution[] = uniqueDistributions(
      newDistributions.map((dist) => {
        return {
          townsfolk: dist.townsfolk + dist.outsider,
          outsider: 0,
          minion: 0,
          demon: dist.demon,
        };
      }),
    );
    goalDistributionElement = elementOrList(
      collapsedGoodDistributions.map((dist, i) => (
        <KazaliDistr dist={dist} key={i} />
      )),
    );
  }

  return (
    <div
      className="modifiers"
      css={{
        fontSize: "120%",
        display: "inline",
      }}
    >
      <br />
      <ModificationList modified={modified} characters={characters} />
      <StickyDistHelp id="distribution-help">
        <div>
          <DistLabel>goal</DistLabel>
          <DistIcon icon="flag" />
          {goalDistributionElement}
        </div>
        <div>
          <DistLabel>current</DistLabel>
          <DistIcon icon="location-dot" />
          <Distr dist={actual} />
          {distributionCorrect && (
            <SuccessSpan>
              <FontAwesomeIcon icon="circle-check" />
            </SuccessSpan>
          )}
        </div>
      </StickyDistHelp>
    </div>
  );
}

export function BagSetupHelp(props: {
  numPlayers: number;
  selection: Selection;
}): React.JSX.Element {
  const { numPlayers, selection } = props;
  const characters = useContext(CharacterContext);
  const modified = modifyingCharacters(selection);
  const targets = targetDistributions(numPlayers, modified, characters);
  const selected = characters.filter((c) => selection.has(c.id));
  const actual = effectiveDistribution(numPlayers, selected);

  const { bag } = splitSelectedChars(characters, selection, numPlayers);

  if (bag.length == numPlayers) {
    if (targets.some((d) => sameDistribution(d, actual))) {
      return (
        <SuccessSpan>
          {bag.length}/{numPlayers} characters &nbsp;
          <FontAwesomeIcon icon="circle-check" />
        </SuccessSpan>
      );
    }
    // the right total number but something is wrong with the distribution
    return (
      <>
        {bag.length}/{numPlayers} characters
        <ErrorSpan>
          {" "}
          (<FontAwesomeIcon icon="thumbs-down" /> distribution)
        </ErrorSpan>
      </>
    );
  }
  return (
    <ErrorSpan>
      {bag.length}/{numPlayers} characters
    </ErrorSpan>
  );
}
