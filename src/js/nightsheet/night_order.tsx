import {
  CharacterInfo,
  getCharacter,
  NonTeensyDemonInfo,
  NonTeensyMinionInfo,
  TeensyLunatic,
} from "../botc/roles";
import { NightOrders, Script } from "../botc/script";
import {
  characterClass,
  CharacterIconElement,
} from "../components/character_icon";
import { Fullscreen } from "../components/fullscreen_modal";
import { Jinxes } from "../components/jinxes";
import { CardInfo } from "../randomizer/components/characters";
import { Selection } from "../randomizer/selection";
import { TokenCanvas } from "../randomizer/tokens/token_canvas";
import { restoreScroll } from "../routing";
import { ToggleAllRoles, isActive } from "./toggle_roles";
import { css, useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import classnames from "classnames";
import { FullscreenBluffs } from "randomizer/components/bluffs";
import React, { createContext, useContext, useEffect, useState } from "react";
import reactStringReplace from "react-string-replace";

// list of token names to display as cards
const tokenNames = [
  "THIS IS THE DEMON",
  "THESE ARE YOUR MINIONS",
  "THESE CHARACTERS ARE NOT IN PLAY",
  "YOU ARE EVIL",
  "YOU ARE GOOD",
  "YOU ARE",
  "THIS CHARACTER SELECTED YOU",
  "THIS PLAYER IS",
  "THIS CHARACTER IS IN PLAY",
  "STORM CAUGHT CHARACTER IS NOT IN PLAY",
  "DO NOT OPEN YOUR EYES TONIGHT",
];
// sort by reverse length so we try to match longer names first, to handle
// one name which is a prefix of another correctly
tokenNames.sort((a, b) => b.length - a.length);

/** For a token in char's night action, return the character we should show
 * alongside the token text. */
function characterToShow(token: string, char: CardInfo): CardInfo | null {
  // These tokens always involve showing the triggering character (as far as I
  // know). For Storm Catcher it isn't strictly necessary but it's okay.
  const showPlayerTokens = new Set([
    "THIS CHARACTER SELECTED YOU",
    "THIS PLAYER IS",
    "THIS CHARACTER IS IN PLAY",
    "STORM CAUGHT CHARACTER IS NOT IN PLAY",
  ]);
  if (showPlayerTokens.has(token)) {
    return char;
  }
  // For these roles, when shown "YOU ARE" the role has jumped to you.
  if (
    token == "YOU ARE" &&
    [
      "imp",
      "farmer",
      "fanggu",
      "crassusfallofrome",
      "hannibalfallofrome",
      "blacksmithfallofrome",
    ].includes(char.id)
  ) {
    return char;
  }
  if (token == "YOU ARE") {
    if (char.id == "imp" + "ppp") {
      return getCharacter("regularimp" + "ppp");
    }
    if (char.id == "regularimp" + "ppp") {
      return getCharacter("impish" + "ppp");
    }
    if (char.id == "impish" + "ppp") {
      return getCharacter("imp" + "ppp");
    }
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

function Header(props: {
  title: string;
  firstNight: boolean;
}): React.JSX.Element {
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
}): React.JSX.Element {
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
      <a onClick={handleClick} key={`token-${tokenNum}-${i}`}>
        <strong>{tokenName}</strong>
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
}): React.JSX.Element {
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
        {
          // these used to link to the wiki
          // <a href={`https://wiki.bloodontheclocktower.com/${character.name}`}>
          // </a>
        }
        {character.name}
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
}): React.JSX.Element {
  const theme = useTheme();
  const { orders, firstNight } = props;
  let order = [...(firstNight ? orders.firstNight : orders.otherNights)];
  if (props.selection != null || props.teensy) {
    if (props.teensy) {
      // skip minion and demon info for teensyville
      order = order.filter((c) => c.id != "minioninfo" && c.id != "demoninfo");
      order = order.map((c) => {
        if (c.id == "lunatic") {
          return TeensyLunatic;
        }
        return c;
      });
    } else {
      order = order.map((c) => {
        if (c.id == "minioninfo") {
          return NonTeensyMinionInfo;
        }
        if (c.id == "demoninfo") {
          return NonTeensyDemonInfo;
        }
        return c;
      });
    }
  }

  return (
    <table
      className="night-sheet"
      css={css`
        margin-bottom: 0.5rem;
        // TODO(tchajed): this was intended for animation but I never got that
        // working
        tr.inactive {
          display: none;
        }

        td.details-cell {
          font-size: 10pt;
          padding: 0 8px;
          // a left-only border colored based on character alignment (which is
          // driven by the row's good/evil class)
          border-left: black 2.5px solid;
        }

        tr.good td.details-cell {
          border-color: ${theme.color.good};
        }

        tr.evil td.details-cell {
          border-color: ${theme.color.evil};
        }
      `}
    >
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
}): React.JSX.Element {
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
}): React.JSX.Element {
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
            {card.character && (
              <>
                <br />
                <br />
                <TokenCanvas
                  character={card.character}
                  size="90%"
                  maxSize="400px"
                />
              </>
            )}
          </>
        );
      }}
    />
  );
}

const ShowBluffsContext: React.Context<() => void> = createContext(() => {
  return;
});

function PageDivider(): React.JSX.Element {
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
}): React.JSX.Element {
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
      <div className={active ? "visible" : "not-visible"}>
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
