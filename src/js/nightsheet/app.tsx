import { Script } from "../botc/script";
import { Nav } from "../randomizer/nav";
import { NightOrder } from "./night_order";
import React from "react";

export function App(props: { script: Script }): JSX.Element {
  return (
    <>
      <Nav scriptId={props.script.id} />
      <div className="main">
        <NightOrder {...props} />
      </div>
    </>
  );
}
