import { getCharacter } from "../botc/roles";
import { TokenCanvas } from "../randomizer/tokens/token_canvas";
import { Fullscreen } from "./fullscreen_modal";
import React from "react";

export function FullscreenRole(props: {
  fsRole: string | null;
  setFsRole: (r: null) => void;
}): JSX.Element {
  return (
    <Fullscreen
      data={props.fsRole}
      setData={props.setFsRole}
      render={(id) => {
        const char = getCharacter(id);
        return <TokenCanvas character={char} size="90%" maxSize="400px" />;
      }}
    />
  );
}
