import { CharacterInfo } from "./botc/roles";

export class Randomizer {
  numPlayers: number | null;
  selected: { [key: string]: boolean };
  characters: { [key: string]: CharacterInfo };

  constructor() {
    this.selected = {};
    this.characters = {};
    this.numPlayers = null;
  }

  addCharacter(character: CharacterInfo) {
    this.selected[character.id] = false;
    this.characters[character.id] = character;
  }

  toggleSelected(id: string): boolean {
    this.selected[id] = !this.selected[id];
    return this.selected[id]
  }

  isSelected(id: string): boolean {
    return this.selected[id];
  }

  allSelected(): CharacterInfo[] {
    var chars = [];
    for (const id of Object.keys(this.selected)) {
      if (this.selected[id]) {
        chars.push(this.characters[id]);
      }
    }
    return chars;
  }

  setNumPlayers(numPlayers: number | null): boolean {
    if (numPlayers == null || 5 <= numPlayers && numPlayers <= 15) {
      this.numPlayers = numPlayers;
      return true;
    }
    return false;
  }

  getNumPlayers(): number | null {
    return this.numPlayers;
  }
}
