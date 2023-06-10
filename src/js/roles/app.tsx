import { Script } from "../botc/script";
import { Nav } from "../randomizer/nav";
import { CharacterSheet } from "./character_sheet";
import React, { useEffect } from "react";

export function App({ script }: { script: Script }): JSX.Element {
  useEffect(() => {
    window["reloadSafe"] = true;
  }, []);

  return (
    <div>
      <Nav scriptId={script.id} />
      <div className="main">
        <CharacterSheet script={script} />
      </div>
    </div>
  );
}
