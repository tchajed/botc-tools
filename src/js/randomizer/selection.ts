import { CharacterInfo } from "../botc/roles";

/**
 * Manage the set of currently selected characters.
 */

export type Selection = Set<string>;

export type SelAction =
  | {
      type: "toggle";
      id: string;
    }
  | {
      type: "set all";
      ids: string[];
    }
  | {
      type: "clear";
    };

/** Get the characters that must be selected.
 *
 * If the script has a lone demon, it is automatically added.
 */
export function requiredSelection(characters: CharacterInfo[]): Set<string> {
  const required = new Set<string>();
  const demons = characters.filter((c) => c.roleType == "demon");
  const hasAtheist = characters.some((c) => c.id == "atheist");
  if (demons.length == 1 && !hasAtheist) {
    required.add(demons[0].id);
  }
  for (const c of characters) {
    if (c.roleType == "fabled") {
      required.add(c.id);
    }
  }
  return required;
}

export function initialSelection(characters: CharacterInfo[]): Set<string> {
  return requiredSelection(characters);
}

function addToSet<T>(s: Set<T>, toAdd: Set<T>) {
  toAdd.forEach((x) => s.add(x));
}

export function createSelectionReducer(
  characters: CharacterInfo[]
): (selection: Selection, action: SelAction) => Selection {
  const required = requiredSelection(characters);
  return (selection: Selection, action: SelAction) => {
    const newSelection = new Set(selection);
    switch (action.type) {
      case "toggle": {
        if (newSelection.has(action.id)) {
          newSelection.delete(action.id);
        } else {
          newSelection.add(action.id);
          if (action.id == "huntsman") {
            newSelection.add("damsel");
          }
        }
        addToSet(newSelection, required);
        return newSelection;
      }
      case "set all": {
        const newSelection = new Set(action.ids);
        addToSet(newSelection, required);
        return newSelection;
      }
      case "clear": {
        return new Set(required);
      }
    }
  };
}
