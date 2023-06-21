import { CharacterInfo, getCharacter } from "../../botc/roles";
import { Fullscreen } from "../../components/fullscreen_modal";
import { Selection } from "../selection";
import { TokenCanvas } from "../tokens/token_canvas";
import { CharacterCard } from "./characters";
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

function FullscreenBluffs(props: {
  showBluffs: CharacterInfo[] | null;
  setShowBluffs: (x: null) => void;
}): JSX.Element {
  return (
    <Fullscreen
      data={props.showBluffs}
      setData={() => props.setShowBluffs(null)}
      render={(bluffs) => {
        return (
          <div className="bluffs">
            <div className="bold" style={{ marginBottom: "1rem" }}>
              THESE CHARACTERS <br /> ARE NOT IN PLAY:
            </div>
            {bluffs.map((char) => (
              <TokenCanvas character={char} key={char.id} size="25vh" />
            ))}
          </div>
        );
      }}
    />
  );
}

export function BluffList(props: { bluffs: Selection }): JSX.Element {
  const [showBluffs, setShowBluffs] = React.useState<CharacterInfo[] | null>(
    null
  );
  const { bluffs } = props;
  const bluffList = [...bluffs.values()].map((id) => getCharacter(id));
  // TODO: ideally would be script order
  bluffList.sort((c1, c2) => c1.name.localeCompare(c2.name));

  const handleClick = () => {
    if (bluffs.size > 0) {
      setShowBluffs(bluffList);
    }
  };

  return (
    <>
      <div onClick={handleClick}>
        {bluffs.size > 0 && <h2>Bluffs</h2>}
        {bluffList.map((char) => (
          <CharacterCard character={char} key={char.id} />
        ))}
      </div>
      <FullscreenBluffs showBluffs={showBluffs} setShowBluffs={setShowBluffs} />
    </>
  );
}
