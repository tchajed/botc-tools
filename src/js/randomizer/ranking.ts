import { CharacterInfo } from "botc/roles";

export type Ranking = { [key: string]: number };

// from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
export function shuffleArray<T>(array: T[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export function randomRanking(characters: CharacterInfo[]): Ranking {
  const randomOrder = characters.map((c) => c.id);
  for (let i = 0; i < 3; i++) {
    // assign copies of riot different rankings
    randomOrder.push(`riot-${i}`);
  }
  for (let i = 0; i < 12; i++) {
    // assign copies of legion different rankings
    randomOrder.push(`legion-${i}`);
  }
  shuffleArray(randomOrder);
  const r = Object.fromEntries(randomOrder.map((id, i) => [id, i]));
  return r;
}
