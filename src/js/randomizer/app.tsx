import { Script } from "../botc/script";
import { Nav } from "./nav";
import { Randomizer } from "./randomizer";
import React from "react";

export function App(props: { script: Script }): JSX.Element {
  return (
    <div>
      <Nav scriptId={props.script.id} />
      <div className="main">
        <Randomizer {...props} />
      </div>
    </div>
  );
}
