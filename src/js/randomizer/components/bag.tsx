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
import { css } from "@emotion/react";
import { Column, ColumnContainer } from "randomizer/columns";
import { Ranking } from "randomizer/ranking";
import { useContext } from "react";

export function charKey(character: BagCharacter): string {
  return character.instanceNum !== undefined
    ? `${character.id}-${character.instanceNum}`
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
  },
): React.JSX.Element {
  const characters = useContext(CharacterContext);
  const { selection, bluffs, ranking, setFsRole } = props;

  const { bag, outsideBag } = splitSelectedChars(
    characters,
    selection.chars,
    props.numPlayers,
  );
  sortBag(bag, ranking);

  function handleClick(id: string): () => void {
    return () => {
      setFsRole(id);
    };
  }

  return (
    <ColumnContainer id="selected-characters">
      <Column>
        <div
          css={css`
            margin-bottom: 1.5rem;
          `}
        >
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
      </Column>
      <OtherCharacters
        characters={outsideBag}
        bluffs={bluffs.chars}
        setFsRole={setFsRole}
      />
    </ColumnContainer>
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
    <div
      css={css`
        margin-left: 0.5rem;
        flex: 40%;
      `}
    >
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
