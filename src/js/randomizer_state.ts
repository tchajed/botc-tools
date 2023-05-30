export class Randomizer {
  numPlayers: number | null;
  selected: { [key: string]: boolean };

  constructor() {
    this.selected = {};
    this.numPlayers = null;
  }

  addCharacter(id: string) {
    this.selected[id] = false;
  }

  toggleSelected(id: string): boolean {
    this.selected[id] = !this.selected[id];
    return this.selected[id]
  }

  isSelected(id: string): boolean {
    return this.selected[id];
  }

  allSelected(): string[] {
    var ids = [];
    for (const id of Object.keys(this.selected)) {
      if (this.selected[id]) {
        ids.push(id);
      }
    }
    return ids;
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
