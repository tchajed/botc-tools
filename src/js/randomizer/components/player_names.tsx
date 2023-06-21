import React from "react";

export function PlayerNameInput(props: {
  numPlayers: number;
  players: string[];
  setPlayers: (players: string[]) => void;
}): JSX.Element {
  const { numPlayers, players } = props;

  function handleChange(ev: React.ChangeEvent<HTMLTextAreaElement>) {
    props.setPlayers(ev.currentTarget.value.split("\n"));
  }

  return (
    <textarea
      id="player_names"
      name="player names"
      cols={15}
      rows={Math.max(numPlayers, players.length)}
      onChange={handleChange}
      value={players.join("\n")}
      spellCheck={false}
      autoCapitalize="on"
      autoComplete="off"
    ></textarea>
  );
}
