import { CharacterInfo } from "../botc/roles";
import { NightOrders, Script } from "../botc/script";
import {
  characterClass,
  iconPath,
  CharacterIconElement,
} from "../components/character_icon";
import { Jinxes } from "../components/jinxes";
import classnames from "classnames";
import React from "react";

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
  details = details.replace(/<tab>/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
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
}): JSX.Element {
  const { character, firstNight } = props;
  const details = character.nightDetails(firstNight)?.details || "";
  return (
    <tr className={characterClass(character)}>
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
}): JSX.Element {
  const { orders, firstNight } = props;
  const order = firstNight ? orders.firstNight : orders.otherNights;
  return (
    <table>
      <tbody>
        {order.map((c) => {
          if (c.nightDetails(firstNight)) {
            return (
              <CharacterRow character={c} firstNight={firstNight} key={c.id} />
            );
          }
        })}
      </tbody>
    </table>
  );
}

function Sheet({
  script,
  firstNight,
}: {
  script: Script;
  firstNight: boolean;
}): JSX.Element {
  return (
    <div>
      <Header title={script.title} firstNight={firstNight} />
      <CharacterList orders={script.orders} firstNight={firstNight} />
      <Jinxes script={script} />
    </div>
  );
}

/** The main component of the nightsheet. */
export function NightOrder({ script }: { script: Script }): JSX.Element {
  return (
    <>
      <Sheet script={script} firstNight={true} />
      <div className="page-divider-top"></div>
      <div className="page-divider-bottom"></div>
      <Sheet script={script} firstNight={false} />
    </>
  );
}
