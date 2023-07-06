import images from "../../../assets/icons/*.webp";
import { css } from "@emotion/react";
import { getCharacter } from "botc/roles";

export function iconPath(id: string): string {
  return images[`Icon_${id}`];
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
}): JSX.Element {
  const { id } = props;
  const name = props.name || getCharacter(id).name;
  if (!iconPath(id)) {
    if (!["MINION", "DEMON"].includes(id)) {
      console.warn(`no icon for ${id}`);
    }
    return <></>;
  }
  return (
    <div css={iconStyle.container}>
      <img
        css={iconStyle.img}
        src={iconPath(id)}
        alt={name}
        draggable={false}
      />
    </div>
  );
}
