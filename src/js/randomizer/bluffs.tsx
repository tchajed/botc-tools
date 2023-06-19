import { getCharacter } from "../botc/roles";
import { CharacterCard } from "./characters";
import { Selection } from "./selection";
import classnames from "classnames";
import React, { ChangeEvent } from "react";

export function BluffsToggleBtn(props: {
  selectBluffs: boolean;
  setSelectBluffs: (b: boolean) => void;
}): JSX.Element {
  const { selectBluffs } = props;
  function onChange(e: ChangeEvent<HTMLInputElement>) {
    props.setSelectBluffs(e.target.checked);
  }
  return (
    <label
      className={classnames("bluffs-toggle", selectBluffs ? "selected" : "")}
    >
      choose bluffs
      <input type="checkbox" checked={selectBluffs} onChange={onChange} />
    </label>
  );
}

export function BluffList(props: { bluffs: Selection }): JSX.Element {
  const { bluffs } = props;
  const bluffList = [...bluffs.values()].map((id) => getCharacter(id));
  // TODO: ideally would be script order
  bluffList.sort((c1, c2) => c1.name.localeCompare(c2.name));
  return (
    <>
      {bluffs.size > 0 && <h2>Bluffs</h2>}
      {bluffList.map((char) => (
        <CharacterCard character={char} key={char.id} />
      ))}
    </>
  );
}
