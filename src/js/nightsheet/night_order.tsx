import {
  CharacterInfo,
  NonTeensyDemonInfo,
  NonTeensyMinionInfo,
  TeensyLunatic,
} from "../botc/roles";
import { NightOrders, Script } from "../botc/script";
import {
  characterClass,
  iconPath,
  CharacterIconElement,
} from "../components/character_icon";
import { Fullscreen } from "../components/fullscreen_modal";
import { Jinxes } from "../components/jinxes";
import { CardInfo, CharacterCard } from "../randomizer/components/characters";
import { Selection } from "../randomizer/selection";
import { restoreScroll } from "../routing";
import { visibleClass } from "../tabs";
import { ToggleAllRoles, isActive } from "./toggle_roles";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import classnames from "classnames";
import { FullscreenBluffs } from "randomizer/components/bluffs";
import React, { createContext, useContext, useEffect, useState } from "react";
import reactStringReplace from "react-string-replace";

const tokenNames = [
  "THIS IS THE DEMON",
  "THESE ARE YOUR MINIONS",
  "THESE CHARACTERS ARE NOT IN PLAY",
  // make sure prefixes go first
  "YOU ARE EVIL",
  "YOU ARE GOOD",
  "YOU ARE",
  "THIS CHARACTER SELECTED YOU",
  "THIS PLAYER IS",
  "THIS CHARACTER IS IN PLAY",
];
tokenNames.sort((a, b) => b.length - a.length);

/** For a token in char's night action, return the character we should show
 * alongside the token text. */
function characterToShow(token: string, char: CardInfo): CardInfo | null {
  // These tokens always involve showing the triggering character (as far as I
  // know)
  const showPlayerTokens = new Set([
    "THIS CHARACTER SELECTED YOU",
    "THIS PLAYER IS",
    "THIS CHARACTER IS IN PLAY",
  ]);
  if (showPlayerTokens.has(token)) {
    return char;
  }
  // For Imp and Farmer, the character jumps and "YOU ARE" means someone else is
  // the Imp/Farmer.
  if (token == "YOU ARE" && ["imp", "farmer"].includes(char.id)) {
    return char;
  }
  return null;
}

const HeaderLabel = styled.span`
  font-family: "Barlow", sans-serif;
  font-size: 16pt;
  font-weight: bold;
  float: right;
  margin-right: 1rem;
`;

function Header(props: { title: string; firstNight: boolean }): JSX.Element {
  const { firstNight } = props;
  const nightLabel = firstNight ? "FIRST NIGHT" : "OTHER NIGHTS";
  return (
    <h1>
      <div
        css={[
          css`
            float: left;
          `,
          !firstNight &&
            css`
              @media not print {
                display: none;
              }
            `,
        ]}
      >
        {props.title}
      </div>
      <HeaderLabel>{nightLabel}</HeaderLabel>
    </h1>
  );
}

function Details(props: {
  char: CardInfo;
  details: string;
  setCard: SetFullscreenCard;
}): JSX.Element {
  const showBluffs = useContext(ShowBluffsContext);
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
      if (tokenName == "THESE CHARACTERS ARE NOT IN PLAY") {
        showBluffs();
      } else {
        props.setCard({
          tokenText: tokenName,
          character: characterToShow(tokenName, props.char),
        });
      }
    };
    el = reactStringReplace(el, tokenName, (_match, i) => (
      <a
        onClick={handleClick}
        // needed for an a tag without an href
        css={css`
          cursor: pointer;
        `}
      >
        <strong key={`token-${tokenNum}-${i}`}>{tokenName}</strong>
      </a>
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
  teensy: boolean;
  setCard: SetFullscreenCard;
}): JSX.Element {
  const { orders, firstNight } = props;
  let order = [...(firstNight ? orders.firstNight : orders.otherNights)];
  if (props.selection != null || props.teensy) {
    if (props.teensy) {
      // skip minion and demon info
      order = order.filter((c) => c.id != "MINION" && c.id != "DEMON");
      order = order.map((c) => {
        if (c.id == "lunatic") {
          return TeensyLunatic;
        }
        return c;
      });
    } else {
      order = order.map((c) => {
        if (c.id == "MINION") {
          return NonTeensyMinionInfo;
        }
        if (c.id == "DEMON") {
          return NonTeensyDemonInfo;
        }
        return c;
      });
    }
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

function Sheet(props: {
  script: Script;
  firstNight: boolean;
  selection: Selection | null;
  teensy: boolean;
  setCard: SetFullscreenCard;
}): JSX.Element {
  const { script, firstNight, selection, setCard } = props;
  return (
    <div>
      <Header title={script.title} firstNight={firstNight} />
      <CharacterList
        orders={script.orders}
        firstNight={firstNight}
        selection={selection}
        setCard={setCard}
        teensy={props.teensy}
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

const cardStyle = css`
  display: inline-block;
  max-width: min(500px, 70vw);
  text-align: center;
`;

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
        const tokenHTML = reactStringReplace(
          card.tokenText,
          new RegExp("(good|evil)", "i"),
          (match) => {
            return <span className={match.toLowerCase()}>{match}</span>;
          },
        );
        return (
          <>
            <div css={cardStyle}>
              <strong>{tokenHTML}</strong>
            </div>
            {card.character && <CharacterCard character={card.character} />}
          </>
        );
      }}
    />
  );
}

const ShowBluffsContext: React.Context<() => void> = createContext(() => {
  return;
});

function PageDivider(): JSX.Element {
  const height = "10pt";
  return (
    <>
      <div
        css={css`
          height: ${height};
          @media print {
            page-break-after: always;
          }
        `}
      ></div>
      <div
        css={css`
          height: ${height};
          border-top: 2.5px dotted black;
          @media print {
            display: none;
          }
        `}
      ></div>
    </>
  );
}

/** The main component of the nightsheet. */
export function NightOrder(props: {
  script: Script;
  active: boolean;
  selection: Selection;
  bluffs: CharacterInfo[];
  validSetup: boolean;
  teensy: boolean;
  anySetup: boolean;
}): JSX.Element {
  const { active, selection, bluffs, validSetup, anySetup } = props;

  useEffect(() => {
    if (active) {
      restoreScroll("night");
    }
  }, [active]);

  const [showAll, setShowAll] = useState(false);
  const [fullscreenCard, setFullscreenCard] = useState<InfoCard | null>(null);
  const [bluffsToShow, setShowBluffs] = React.useState<CharacterInfo[] | null>(
    null,
  );

  // The subset of characters to show, or null if all should be shown.
  let shownSelection: Selection | null = selection;
  if (showAll || !validSetup) {
    shownSelection = null; // means show all
  }

  return (
    <ShowBluffsContext.Provider value={() => setShowBluffs(bluffs)}>
      <div className={visibleClass(active)}>
        <Sheet
          script={props.script}
          firstNight={true}
          selection={shownSelection}
          setCard={setFullscreenCard}
          teensy={props.teensy}
        />
        <PageDivider />
        <Sheet
          script={props.script}
          firstNight={false}
          selection={shownSelection}
          setCard={setFullscreenCard}
          teensy={props.teensy}
        />
        {anySetup && (
          <ToggleAllRoles
            showAll={showAll}
            setShowAll={setShowAll}
            validSetup={validSetup}
          />
        )}
        <FullscreenCard card={fullscreenCard} setCard={setFullscreenCard} />
        <FullscreenBluffs
          showBluffs={bluffsToShow}
          setShowBluffs={setShowBluffs}
        />
      </div>
    </ShowBluffsContext.Provider>
  );
}
