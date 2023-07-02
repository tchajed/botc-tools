import { BagCharacter, splitSelectedChars } from "../../botc/setup";
import "../../icons";
import { CharacterContext } from "../character_context";
import { History, SetHistory } from "../history";
import { CharacterSelectionVars, Selection } from "../selection";
import { ScriptState } from "../state";
import { BluffList } from "./bluffs";
import { CardInfo, CharacterCard } from "./characters";
import { RankingBtns } from "./ranking_btns";
import { BagSetupHelp } from "./setup_help";
import { Ranking } from "randomizer/ranking";
import React, { useContext } from "react";

export function charKey(character: BagCharacter): string {
  return character.demonNum !== undefined
    ? `${character.id}-${character.demonNum}`
    : character.id;
}

export function sortBag(bag: BagCharacter[], ranking: Ranking) {
  bag.sort((c1, c2) => ranking[charKey(c1)] - ranking[charKey(c2)]);
}

export function SelectedCharacters(
  props: CharacterSelectionVars & {
    ranking: Ranking;
    numPlayers: number;
    setRanking: (r: Ranking) => void;
    setFsRole: (r: string) => void;
    history: History<Partial<ScriptState>>;
    setHistory: SetHistory;
  }
): JSX.Element {
  const characters = useContext(CharacterContext);
  const { selection, bluffs, ranking, setFsRole } = props;

  const { bag, outsideBag } = splitSelectedChars(
    characters,
    selection.chars,
    props.numPlayers
  );
  sortBag(bag, ranking);

  function handleClick(id: string): () => void {
    return () => {
      setFsRole(id);
    };
  }

  return (
    <div>
      <div className="selected-characters">
        <div className="column">
          <div className="bag-header">
            <h2>Bag</h2>
            <RankingBtns
              sels={{ selection, bluffs }}
              bagSize={bag.length}
              {...props}
            />
          </div>
          <div>
            <BagSetupHelp
              numPlayers={props.numPlayers}
              selection={selection.chars}
            />
          </div>
          {bag.map((char) => (
            <CharacterCard
              character={char}
              key={charKey(char)}
              onClick={handleClick(char.id)}
            />
          ))}
        </div>
        <OtherCharacters
          characters={outsideBag}
          bluffs={bluffs.chars}
          setFsRole={setFsRole}
        />
      </div>
    </div>
  );
}
function OtherCharacters(props: {
  characters: CardInfo[];
  bluffs: Selection;
  setFsRole: (r: string) => void;
}) {
  const { characters, setFsRole } = props;

  function handleClick(id: string): () => void {
    return () => {
      setFsRole(id);
    };
  }

  return (
    <div className="column-smaller">
      {characters.length > 0 && <h2>Others</h2>}
      {characters.map((char) => (
        <CharacterCard
          character={char}
          key={char.id}
          onClick={handleClick(char.id)}
        />
      ))}
      <BluffList bluffs={props.bluffs} />
    </div>
  );
}
