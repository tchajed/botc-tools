import { CharacterInfo } from "../botc/roles";
import { NightOrders, Script } from "../botc/script";
import {
  characterClass,
  iconPath,
  CharacterIconElement,
} from "../components/character_icon";
import { Fullscreen } from "../components/fullscreen_modal";
import { Jinxes } from "../components/jinxes";
import { CardInfo, CharacterCard } from "../randomizer/characters";
import { Selection } from "../randomizer/selection";
import { restoreScroll } from "../routing";
import { visibleClass } from "../tabs";
import { ToggleAllRoles, isActive } from "./toggle_roles";
import classnames from "classnames";
import React, { useEffect, useState } from "react";
import reactStringReplace from "react-string-replace";

const tokenNames = new Set([
  "THIS IS THE DEMON",
  "THESE ARE YOUR MINIONS",
  "THESE CHARACTERS ARE NOT IN PLAY",
  "YOU ARE",
  "THIS CHARACTER SELECTED YOU",
  "THIS PLAYER IS",
  "THIS CHARACTER IS IN PLAY",
]);

const showPlayerTokens = new Set([
  "THIS CHARACTER SELECTED YOU",
  "THIS PLAYER IS",
  "THIS CHARACTER IS IN PLAY",
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

function Details(props: {
  char: CardInfo;
  details: string;
  setCard: SetFullscreenCard;
}): JSX.Element {
  let details: string = props.details;
  details = details.replace(/If [^.]*:/g, "\n$&\n");
  // replace quoted tokens with standard all-caps strings for replacement
  for (const tokenName of tokenNames) {
    const altToken = new RegExp(`'${tokenName}'`, "gi");
    details = details.replaceAll(altToken, tokenName);
  }
  details = details.trim();

  let el = reactStringReplace(details, /(\n)/g, (_match, i) => <br key={i} />);
  const tabEl = window.innerWidth > 500 ? <>&emsp;</> : <>•&nbsp;</>;
  let tabNum = 0;
  el = reactStringReplace(el, /(<tab>)/g, () => {
    tabNum++;
    return <React.Fragment key={`tab-${tabNum}`}>{tabEl}</React.Fragment>;
  });
  let tokenNum = 0;
  for (const tokenName of tokenNames) {
    const handleClick = () => {
      props.setCard({
        tokenText: tokenName,
        character: showPlayerTokens.has(tokenName) ? props.char : null,
      });
    };
    el = reactStringReplace(el, tokenName, (_match, i) => (
      <strong
        onClick={handleClick}
        className="token-name"
        key={`token-${tokenNum}-${i}`}
      >
        {tokenName}
      </strong>
    ));
    tokenNum++;
  }
  return <span key={props.char.id}>{el}</span>;
}

function CharacterRow(props: {
  character: CharacterInfo;
  firstNight: boolean;
  selected: boolean;
  setCard: SetFullscreenCard;
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
        <Details char={character} details={details} setCard={props.setCard} />
      </td>
    </tr>
  );
}

function CharacterList(props: {
  orders: NightOrders;
  firstNight: boolean;
  selection: Selection | null;
  setCard: SetFullscreenCard;
}): JSX.Element {
  const { orders, firstNight } = props;
  const order = firstNight ? orders.firstNight : orders.otherNights;

  return (
    <table className="night-sheet">
      <tbody>
        {order.map((c) => {
          if (c.nightDetails(firstNight)) {
            return (
              <CharacterRow
                character={c}
                firstNight={firstNight}
                selected={isActive(props.selection, c.id)}
                setCard={props.setCard}
                key={c.id}
              />
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
  selection,
  setCard,
}: {
  script: Script;
  firstNight: boolean;
  selection: Selection | null;
  setCard: SetFullscreenCard;
}): JSX.Element {
  return (
    <div>
      <Header title={script.title} firstNight={firstNight} />
      <CharacterList
        orders={script.orders}
        firstNight={firstNight}
        selection={selection}
        setCard={setCard}
      />
      <Jinxes script={script} />
    </div>
  );
}

interface InfoCard {
  tokenText: string;
  character: CardInfo | null;
}

type SetFullscreenCard = (card: InfoCard | null) => void;

function FullscreenCard({
  card,
  setCard,
}: {
  card: InfoCard | null;
  setCard: SetFullscreenCard;
}): JSX.Element {
  return (
    <Fullscreen
      data={card}
      setData={setCard}
      render={(card) => {
        return (
          <>
            <div className="card-text">
              <strong>{card.tokenText}</strong>
            </div>
            {card.character && <CharacterCard character={card.character} />}
          </>
        );
      }}
    />
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
  const [fullscreenCard, setFullscreenCard] = useState<InfoCard | null>(null);

  let newSelection: Selection | null = selection;
  if (showAll || !validSetup) {
    newSelection = null; // means show all
  }

  return (
    <div className={visibleClass(active)}>
      <Sheet
        script={script}
        firstNight={true}
        selection={newSelection}
        setCard={setFullscreenCard}
      />
      <div className="page-divider-top"></div>
      <div className="page-divider-bottom"></div>
      <Sheet
        script={script}
        firstNight={false}
        selection={newSelection}
        setCard={setFullscreenCard}
      />
      {anySetup && (
        <ToggleAllRoles
          showAll={showAll}
          setShowAll={setShowAll}
          validSetup={validSetup}
        />
      )}
      <FullscreenCard card={fullscreenCard} setCard={setFullscreenCard} />
    </div>
  );
}
