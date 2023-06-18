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

export type SelectionReducer = (sel: Selection, a: SelAction) => Selection;

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

function requiredSelectionReducer(required: Set<string>): SelectionReducer {
  return (selection: Selection, action: SelAction) => {
    const newSelection = new Set(selection);
    switch (action.type) {
      case "toggle": {
        if (newSelection.has(action.id)) {
          newSelection.delete(action.id);
        } else {
          newSelection.add(action.id);
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

function addMandatorySelections(selection: Selection) {
  // Huntsman [+ Damsel]
  if (selection.has("huntsman")) {
    selection.add("damsel");
  }
  // Choirboy [+ King]
  if (selection.has("choirboy")) {
    selection.add("king");
  }
}

export function createSelectionReducer(
  characters: CharacterInfo[]
): SelectionReducer {
  const reduce = requiredSelectionReducer(requiredSelection(characters));
  return (sel, a) => {
    const newSel = reduce(sel, a);
    addMandatorySelections(newSel);
    return newSel;
  };
}

export function createBluffSelectionReducer(): SelectionReducer {
  const required = new Set<string>();
  return requiredSelectionReducer(required);
}
