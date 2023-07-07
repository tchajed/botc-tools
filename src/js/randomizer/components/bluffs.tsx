import { CharacterInfo, getCharacter } from "../../botc/roles";
import { Fullscreen } from "../../components/fullscreen_modal";
import { Selection } from "../selection";
import { TokenCanvas } from "../tokens/token_canvas";
import { CharacterCard } from "./characters";
import { css } from "@emotion/react";
import classnames from "classnames";
import React, { useState } from "react";

export function BluffsToggleBtn(props: {
  selectBluffs: boolean;
  setSelectBluffs: (b: boolean) => void;
}): JSX.Element {
  const { selectBluffs } = props;
  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    props.setSelectBluffs(e.target.checked);
  }
  return (
    <label
      css={css`
        background-color: #eee;
        padding: 0.5rem;
        border-radius: 0.25rem;
      `}
      className={classnames({ selected: selectBluffs })}
    >
      choose bluffs
      <input
        type="checkbox"
        name="choose bluffs"
        checked={selectBluffs}
        onChange={onChange}
      />
    </label>
  );
}

export function FullscreenBluffs(props: {
  showBluffs: CharacterInfo[] | null;
  setShowBluffs: (x: null) => void;
}): JSX.Element {
  return (
    <Fullscreen
      data={props.showBluffs}
      setData={() => props.setShowBluffs(null)}
      render={(bluffs) => {
        return (
          <div>
            <div
              className="bold"
              style={{
                marginBottom: "1rem",
                // this text is a little too long
                fontSize: "70%",
              }}
            >
              THESE CHARACTERS <br /> ARE NOT IN PLAY{bluffs.length > 0 && ":"}
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
  const [showBluffs, setShowBluffs] = useState<CharacterInfo[] | null>(null);
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
