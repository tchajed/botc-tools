import { faCopy } from "@fortawesome/free-solid-svg-icons/faCopy";
import { CharacterInfo, RoleType } from "../botc/roles";
import { Script } from "../botc/script";
import {
  CharacterIconElement,
  characterClass,
} from "../components/character_icon";
import { Fullscreen } from "../components/fullscreen_modal";
import { Jinxes } from "../components/jinxes";
import { FullscreenRole } from "../components/role_fullscreen";
import { restoreScroll } from "../routing";
import { visibleClass } from "../tabs";
import { css } from "@emotion/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import reactStringReplace from "react-string-replace";

function QrLink(props: {
  url: string;
  setUrl: (url: string) => void;
}): JSX.Element {
  const { url } = props;
  const handleClick = (ev: React.MouseEvent<HTMLAnchorElement>) => {
    props.setUrl(url);
    navigator.clipboard.writeText(url);
    ev.preventDefault();
  };
  return (
    <a href={url} onClick={handleClick}>
      <FontAwesomeIcon icon="qrcode" />
    </a>
  );
}

function FullscreenQr(props: {
  url: string | null;
  setUrl: (url: string | null) => void;
}): JSX.Element {
  return (
    <Fullscreen
      data={props.url}
      setData={props.setUrl}
      render={(url) => {
        const displayUrl = url.replace(/^https?:\/\//, "");
        return (
          <div>
            <QRCode size={256} value={url} />
            <br />
            <a
              href={url}
              css={css`
                font-size: 16pt;
                text-decoration: underline;
              `}
            >
              {displayUrl}
            </a>
          </div>
        );
      }}
    />
  );
}

function CopyJsonLink(props: { script: Script }): JSX.Element {
  const { script } = props;
  const handleClick = React.useCallback(
    async (ev: React.MouseEvent<HTMLAnchorElement>) => {
      ev.preventDefault();
      await navigator.clipboard.writeText(script.toPocketGrimoire);
    },
    [script],
  );
  return (
    <a title="Copy to JSON" onClick={handleClick}>
      <FontAwesomeIcon icon={faCopy} />
    </a>
  );
}

function Ability(props: { ability: string | null }): JSX.Element {
  // bold any setup text in brackets (eg, [+2 Outsiders])
  const html = reactStringReplace(
    props.ability || "",
    /(\[[^]*\])/g,
    (match, i) => {
      return <strong key={`bold-${i}`}>{match}</strong>;
    },
  );
  return <span>{html}</span>;
}

function Character(props: {
  character: CharacterInfo;
  onClick: React.MouseEventHandler<HTMLElement>;
}): JSX.Element {
  const { character } = props;
  return (
    <tr className={characterClass(character)}>
      <td className="icon-cell">
        <a onClick={props.onClick}>
          <CharacterIconElement {...character} />
        </a>
      </td>
      <td className="name-cell">
        <span onClick={props.onClick}>{character.name}</span>
      </td>
      <td className="ability-cell">
        <Ability ability={character.ability} />
      </td>
    </tr>
  );
}

function pluralRole(roleType: string): string {
  return ["townsfolk", "fabled", "travellers"].includes(roleType)
    ? roleType
    : roleType + "s";
}

function RoleTypeRow(props: { roleType: string }): JSX.Element {
  const label = pluralRole(props.roleType).toUpperCase();
  return (
    <tr>
      <td />
      <td>
        <strong>{label}</strong>
      </td>
      <td />
    </tr>
  );
}

function CharacterList(props: {
  characters: CharacterInfo[];
  setFsRole: (id: string) => void;
}): JSX.Element {
  const rows: (CharacterInfo | RoleType)[] = [];
  const rolesSeen: { [key: string]: boolean } = {};
  for (const c of props.characters) {
    if (!rolesSeen[c.roleType]) {
      rows.push(c.roleType);
      rolesSeen[c.roleType] = true;
    }
    rows.push(c);
  }

  return (
    <table css={{ marginBottom: "0.5rem" }}>
      <tbody>
        {rows.map((c_or_role) => {
          if (typeof c_or_role == "string") {
            const roleType = c_or_role;
            return <RoleTypeRow roleType={roleType} key={`role-${roleType}`} />;
          } else {
            const c = c_or_role;
            return (
              <Character
                onClick={() => props.setFsRole(c.id)}
                character={c}
                key={`char-${c.id}`}
              />
            );
          }
        })}
      </tbody>
    </table>
  );
}

const printHidden = css`
  @media print {
    display: none;
  }
`;

/**
 * The top-level component for the roles tab.
 */
export function CharacterSheet(props: {
  script: Script;
  active: boolean;
  completeSetup: boolean;
}): JSX.Element {
  const { script, active, completeSetup } = props;
  useEffect(() => {
    if (active) {
      restoreScroll("roles");
    }
  }, [active]);

  const [fsRole, setFsRole] = useState<string | null>(null);

  // if we don't have a complete setup, setting the current role should be
  // disabled and do nothing
  const showRole = completeSetup
    ? setFsRole
    : () => {
        return;
      };

  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const qrDest = window.location.href;

  return (
    <div className={visibleClass(active)}>
      <h1>
        {script.title}
        <div
          css={css`
            display: flex;
            flex-direction: row;
            gap: 1rem;
            float: right;
            font-size: 16pt;
            line-height: 30pt;
            ${printHidden}
          `}
        >
          <QrLink url={qrDest} setUrl={setQrUrl} />
          <CopyJsonLink script={script} />
        </div>
      </h1>
      <CharacterList characters={script.characters} setFsRole={showRole} />
      <Jinxes script={script} />
      <FullscreenRole fsRole={fsRole} setFsRole={setFsRole} />
      <FullscreenQr url={qrUrl} setUrl={setQrUrl} />
    </div>
  );
}
