import { CharacterInfo } from "../botc/roles";
import { createContext } from "react";

/** The list of characters in the script. Essentially global, never changes. */
export const CharacterContext: React.Context<CharacterInfo[]> = createContext(
  [] as CharacterInfo[],
);
