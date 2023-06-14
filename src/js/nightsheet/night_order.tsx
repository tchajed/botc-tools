import { CharacterInfo } from "../botc/roles";
import { NightOrders, Script } from "../botc/script";
import {
  characterClass,
  iconPath,
  CharacterIconElement,
} from "../components/character_icon";
import { Jinxes } from "../components/jinxes";
import { Selection } from "../randomizer/selection";
import { restoreScroll } from "../routing";
import { visibleClass } from "../tabs";
import classnames from "classnames";
import React, { ChangeEvent, useEffect, useState } from "react";

const tokenNames = new Set([
  "THIS IS THE DEMON",
  "THESE ARE YOUR MINIONS",
  "THESE CHARACTERS ARE NOT IN PLAY",
  "YOU ARE",
  "THIS CHARACTER SELECTED YOU",
  "THIS PLAYER IS",
]);

function Header(props: { title: string; firstNight: boolean }): JSX.Element {
  const { firstNight } = props;
  const nightLabel = firstNight ? "FIRST NIGHT" : "OTHER NIGHTS";
  return (
    <h1>
      <div className={classnames("title", { "other-nights": !firstNight })}>
        {props.title}
      </div>
      <span className="label">{nightLabel}</span>
    </h1>
  );
}

function Details(props: { details: string }): JSX.Element {
  let details: string = props.details;
  details = details.replace(/If [^.]*:/g, "\n$&\n");
  details = details.trim();
  details = details.replace(/\n/g, "<br/>");
  if (window.innerWidth > 500) {
    details = details.replace(/<tab>/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
  } else {
    details = details.replace(/<tab>/g, "•&nbsp;");
  }
  for (const tokenName of tokenNames) {
    details = details.replace(tokenName, `<strong>${tokenName}</strong>`);
    let altTokenName =
      tokenName.charAt(0).toUpperCase() + tokenName.substring(1).toLowerCase();
    altTokenName = `'${altTokenName}'`;
    details = details.replace(altTokenName, `<strong>${tokenName}</strong>`);
  }
  return <span dangerouslySetInnerHTML={{ __html: details }}></span>;
}

function CharacterRow(props: {
  character: CharacterInfo;
  firstNight: boolean;
  selected: boolean;
}): JSX.Element {
  const { character, firstNight } = props;
  const details = character.nightDetails(firstNight)?.details || "";
  return (
    <tr
      className={classnames(characterClass(character), {
        inactive: !props.selected,
      })}
    >
      <td className="icon-cell">
        <CharacterIconElement {...character} />
      </td>
      <td className="name-cell">
        {iconPath(character.id) ? (
          <a href={`https://wiki.bloodontheclocktower.com/${character.name}`}>
            {character.name}
          </a>
        ) : (
          <>{character.name}</>
        )}
      </td>
      <td
        className={classnames("details", "details-cell", {
          empty: details.length == 0,
        })}
      >
        <Details details={details} />
      </td>
    </tr>
  );
}

function CharacterList(props: {
  orders: NightOrders;
  firstNight: boolean;
  selection: Selection | null;
}): JSX.Element {
  const { orders, firstNight } = props;
  const order = firstNight ? orders.firstNight : orders.otherNights;

  function isActive(id: string): boolean {
    if (!props.selection) {
      // not filtering at all, everyone is active
      return true;
    }
    // always active
    if (id == "MINION" || id == "DEMON") {
      return true;
    }
    return props.selection.has(id);
  }

  return (
    <table className="night-sheet">
      <tbody>
        {order.map((c) => {
          if (c.nightDetails(firstNight)) {
            return (
              <CharacterRow
                character={c}
                firstNight={firstNight}
                selected={isActive(c.id)}
                key={c.id}
              />
            );
          }
        })}
      </tbody>
    </table>
  );
}

function ToggleAllRoles(props: {
  showAll: boolean;
  setShowAll: (boolean) => void;
  validSetup: boolean;
}): JSX.Element {
  function onChange(e: ChangeEvent<HTMLInputElement>) {
    props.setShowAll(e.target.checked);
  }

  return (
    <div className="all-roles-sheet">
      <div className="all-toggle">
        <label>
          show all roles
          <input
            type="checkbox"
            checked={props.showAll || !props.validSetup}
            onChange={onChange}
            disabled={!props.validSetup}
          ></input>
        </label>
      </div>
    </div>
  );
}

function Sheet({
  script,
  firstNight,
  selection,
}: {
  script: Script;
  firstNight: boolean;
  selection: Selection | null;
}): JSX.Element {
  return (
    <div>
      <Header title={script.title} firstNight={firstNight} />
      <CharacterList
        orders={script.orders}
        firstNight={firstNight}
        selection={selection}
      />
      <Jinxes script={script} />
    </div>
  );
}

/** The main component of the nightsheet. */
export function NightOrder({
  script,
  active,
  selection,
  validSetup,
  anySetup,
}: {
  script: Script;
  active: boolean;
  selection: Selection;
  validSetup: boolean;
  anySetup: boolean;
}): JSX.Element {
  useEffect(() => {
    if (active) {
      restoreScroll("night");
    }
  }, [active]);

  const [showAll, setShowAll] = useState(false);

  let newSelection: Selection | null = selection;
  if (showAll || !validSetup) {
    newSelection = null; // means show all
  }

  return (
    <div className={visibleClass(active)}>
      <Sheet script={script} firstNight={true} selection={newSelection} />
      <div className="page-divider-top"></div>
      <div className="page-divider-bottom"></div>
      <Sheet script={script} firstNight={false} selection={newSelection} />
      {anySetup && (
        <ToggleAllRoles
          showAll={showAll}
          setShowAll={setShowAll}
          validSetup={validSetup}
        />
      )}
    </div>
  );
}
