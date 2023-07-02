import debounce from "lodash.debounce";
import React, { useMemo, useEffect } from "react";

export function PlayerNameInput(props: {
  numPlayers: number;
  players: string[];
  setPlayers: (players: string[]) => void;
}): JSX.Element {
  const { numPlayers, players } = props;

  function handleChange(ev: React.ChangeEvent<HTMLTextAreaElement>) {
    props.setPlayers(ev.target.value.split("\n"));
  }

  const debouncedHandleChange = useMemo(
    () => debounce(handleChange, 300),
    [props.setPlayers]
  );

  useEffect(() => {
    return () => {
      debouncedHandleChange.cancel();
    };
  }, []);

  function handleClear() {
    props.setPlayers([]);
  }

  return (
    <div>
      <br />
      <div>Players:</div>
      <textarea
        id="player_names"
        name="player names"
        cols={15}
        rows={Math.max(numPlayers, players.length)}
        onChange={debouncedHandleChange}
        defaultValue={players.join("\n")}
        spellCheck={false}
        autoCapitalize="on"
        autoComplete="off"
      ></textarea>
      <br />
      <button
        className="btn"
        id="clear_players"
        type="button"
        onClick={handleClear}
      >
        clear
      </button>
    </div>
  );
}
