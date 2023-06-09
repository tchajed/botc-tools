import { createContext } from "react";
import { CharacterInfo } from "../botc/roles";

/** The list of characters in the script. Essentially global, never changes. */
export const CharacterContext: React.Context<CharacterInfo[]> = createContext(
  [] as CharacterInfo[]
);
