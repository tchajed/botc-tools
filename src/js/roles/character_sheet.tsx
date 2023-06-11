import { CharacterInfo, RoleType } from "../botc/roles";
import { Script } from "../botc/script";
import {
  CharacterIconElement,
  characterClass,
} from "../components/character_icon";
import { Jinxes } from "../components/jinxes";
import { restoreScroll } from "../routing";
import { visibleClass } from "../tabs";
import React, { useEffect } from "react";

function Ability(props: { ability: string | null }): JSX.Element {
  const html = (props.ability || "").replace(
    /\[[^]*\]/g,
    "<strong>$&</strong>"
  );
  return <span dangerouslySetInnerHTML={{ __html: html }}></span>;
}

function Character({ character }: { character: CharacterInfo }): JSX.Element {
  return (
    <tr className={characterClass(character)}>
      <td className="icon-cell">
        <CharacterIconElement {...character} />
      </td>
      <td className="name-cell">{character.name}</td>
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

function CharacterList(props: { characters: CharacterInfo[] }): JSX.Element {
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
    <table>
      <tbody>
        {rows.map((c_or_role) => {
          if (typeof c_or_role == "string") {
            const roleType = c_or_role;
            return <RoleTypeRow roleType={roleType} key={`role-${roleType}`} />;
          } else {
            const c = c_or_role;
            return <Character character={c} key={`char-${c.id}`} />;
          }
        })}
      </tbody>
    </table>
  );
}

export function CharacterSheet({
  script,
  active,
}: {
  script: Script;
  active: boolean;
}): JSX.Element {
  useEffect(() => {
    if (active) {
      restoreScroll("roles");
    }
  }, [active]);

  return (
    <div className={visibleClass(active)}>
      <h1>{script.title}</h1>
      <CharacterList characters={script.characters} />
      <Jinxes script={script} />
    </div>
  );
}