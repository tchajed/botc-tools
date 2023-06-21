import { Selection } from "../randomizer/selection";
import React from "react";
import { ChangeEvent } from "react";

export function isActive(selection: Selection | null, id: string): boolean {
  if (!selection) {
    // not filtering at all, everyone is active
    return true;
  }
  // always active
  if (id == "MINION" || id == "DEMON") {
    return true;
  }
  return selection.has(id);
}

export function ToggleAllRoles(props: {
  showAll: boolean;
  setShowAll: (x: boolean) => void;
  validSetup: boolean;
}): JSX.Element {
  function onChange(e: ChangeEvent<HTMLInputElement>) {
    props.setShowAll(e.target.checked);
  }

  return (
    <div className="all-roles-sheet">
      <div className="all-toggle">
        <label>
          show all roles
          <input
            type="checkbox"
            name="show all roles"
            checked={props.showAll || !props.validSetup}
            onChange={onChange}
            disabled={!props.validSetup}
          ></input>
        </label>
      </div>
    </div>
  );
}
