// This is a Parcel glob import: https://parceljs.org/features/dependency-resolution/#glob-specifiers
// vite.config.ts replaces this import by loading `character_icons_vite.ts` instead.
import images from "../../../assets/icons/*.webp";
import { css } from "@emotion/react";
import { characterIdWithoutNumber, getCharacter } from "botc/roles";

export function iconPath(id: string): string {
  id = characterIdWithoutNumber(id);
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
    if (!["minion", "demon"].includes(id)) {
      console.warn(`no icon for ${id}`);
    }
    const char = getCharacter(id);
    // create a fallback icon based on character type (these are provided by the
    // pocket-grimoire icons)
    return (
      <div css={iconStyle.container}>
        <img
          css={iconStyle.img}
          src={iconPath(char.roleType)}
          alt={name}
          draggable={false}
        />
      </div>
    );
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
