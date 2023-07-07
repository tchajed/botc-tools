import { Selection } from "../randomizer/selection";
import { css } from "@emotion/react";
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

const allRolesToggleStyle = css`
  position: fixed;
  // TODO can this be relative to the main viewport? (only matters on wide
  // widths)
  right: 8px;
  bottom: 8px;
  // make sure this switch covers everything
  z-index: 1000;
  line-height: 2rem;
  vertical-align: middle;
  background-color: #eee;
  border: 2px solid darken(#eee, 20);
  border-radius: 0.25rem;
  width: 10rem;
  align-items: right;
  text-align: center;
`;

export function ToggleAllRoles(props: {
  showAll: boolean;
  setShowAll: (x: boolean) => void;
  validSetup: boolean;
}): JSX.Element {
  function onChange(e: ChangeEvent<HTMLInputElement>) {
    props.setShowAll(e.target.checked);
  }

  return (
    <div css={allRolesToggleStyle}>
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
  );
}
