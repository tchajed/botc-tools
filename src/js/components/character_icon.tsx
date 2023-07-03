import images from "../../../assets/icons/*.webp";
import { getCharacter } from "botc/roles";
import classNames from "classnames";

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
export function CharacterIconElement(props: {
  id: string;
  name?: string;
  className?: string;
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
    <div className={classNames("img-container", props.className)}>
      <img
        className="char-icon"
        draggable={false}
        src={iconPath(id)}
        alt={name}
      />
    </div>
  );
}
