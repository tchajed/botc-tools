import { getCharacter } from "../botc/roles";
import { TokenCanvas } from "../randomizer/tokens/token_canvas";
import { Fullscreen } from "./fullscreen_modal";

function capitalize(s: string): string {
  if (s == "") {
    return "";
  }
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function FullscreenRole(props: {
  allAmne: boolean;
  fsRole: string | null;
  setFsRole: (r: null) => void;
}): JSX.Element {
  return (
    <Fullscreen
      data={props.fsRole}
      setData={props.setFsRole}
      render={(id) => {
        const char = getCharacter(id);
        if (props.allAmne) {
          char.ability = `${capitalize(
            char.roleType,
          )}. You do not know what your ability is.`;
        }
        return <TokenCanvas character={char} size="90%" maxSize="400px" />;
      }}
    />
  );
}
