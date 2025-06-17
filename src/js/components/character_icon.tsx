import images from "../character_icons_vite";
import { css } from "@emotion/react";
import { characterIdWithoutNumber, getCharacter } from "botc/roles";

function iconPath(id: string): string {
  id = characterIdWithoutNumber(id);
  return images[`Icon_${id}`];
}

export function characterIconPath(char: {
  id: string;
  roleType: string;
}): string {
  // fallback to role type for a generic icon
  return iconPath(char.id) ?? iconPath(char.roleType);
}

export function characterClass(character: { roleType: string }): string {
  switch (character.roleType) {
    case "townsfolk":
    case "outsider":
      return "good";
    case "minion":
    case "demon":
      return "evil";
    case "fabled":
      return "fabled";
    default:
      return "";
  }
}

const imgSize = "30px";

const iconStyle = {
  container: css`
    display: inline-block;
    width: ${imgSize};
    height: ${imgSize};
    overflow: hidden;
  `,
  img: css`
    height: 100%;
    width: 100%;
  `,
};

export function CharacterIconElement(props: {
  id: string;
  name?: string;
}): React.JSX.Element {
  const { id } = props;
  const char = getCharacter(id);
  const name = props.name || char.name;
  if (!iconPath(id) && !["minioninfo", "demoninfo"].includes(id)) {
    // warn that a fallback is being used
    console.warn(`no icon for ${id}`);
  }
  return (
    <div css={iconStyle.container}>
      <img
        css={iconStyle.img}
        src={characterIconPath(char)}
        alt={name}
        draggable={false}
      />
    </div>
  );
}
