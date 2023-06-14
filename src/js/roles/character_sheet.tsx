import { CharacterInfo, RoleType } from "../botc/roles";
import { Script } from "../botc/script";
import {
  CharacterIconElement,
  characterClass,
} from "../components/character_icon";
import { Jinxes } from "../components/jinxes";
import { FullscreenRole } from "../components/role_fullscreen";
import { restoreScroll } from "../routing";
import { visibleClass } from "../tabs";
import React, { useEffect, useState } from "react";

function Ability(props: { ability: string | null }): JSX.Element {
  const html = (props.ability || "").replace(
    /\[[^]*\]/g,
    "<strong>$&</strong>"
  );
  return <span dangerouslySetInnerHTML={{ __html: html }}></span>;
}

function Character(props: {
  character: CharacterInfo;
  onClick: React.MouseEventHandler<HTMLElement>;
}): JSX.Element {
  const { character } = props;
  return (
    <tr className={characterClass(character)}>
      <td className="icon-cell" onClick={props.onClick}>
        <CharacterIconElement {...character} />
      </td>
      <td className="name-cell" onClick={props.onClick}>
        {character.name}
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
    <table className="character-list">
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

export function CharacterSheet({
  script,
  active,
  completeSetup,
}: {
  script: Script;
  active: boolean;
  completeSetup: boolean;
}): JSX.Element {
  useEffect(() => {
    if (active) {
      restoreScroll("roles");
    }
  }, [active]);

  const [fsRole, setFsRole] = useState<string | null>(null);

  // if we don't have a complete setup, setting the current role should be disabled and do nothing
  const showRole = completeSetup
    ? setFsRole
    : () => {
        return;
      };

  return (
    <div className={visibleClass(active)}>
      <h1>{script.title}</h1>
      <CharacterList characters={script.characters} setFsRole={showRole} />
      <Jinxes script={script} />
      <FullscreenRole fsRole={fsRole} setFsRole={setFsRole} />
    </div>
  );
}
