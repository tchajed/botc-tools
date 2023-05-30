/** Encode the rules for BotC setup. */

export interface Distribution {
  townsfolk: number,
  outsider: number,
  minion: number,
  demon: number,
}

export function zeroDistribution(): Distribution {
  return { townsfolk: 0, outsider: 0, minion: 0, demon: 0 };
}

export function distributionForCount(numPlayers: number): Distribution {
  const demon = 1;
  var outsider = null;
  var minion = null;
  if (numPlayers == 5 || numPlayers == 6) {
    outsider = numPlayers - 5;
    minion = 1;
  } else {
    outsider = (numPlayers - 7) % 3;
    minion = Math.floor((numPlayers - 7) / 3) + 1;
  }
  const townsfolk = numPlayers - outsider - minion - demon;
  return { townsfolk, outsider, minion, demon };
}

export function validNumPlayers(numPlayers: number): boolean {
  return 5 <= numPlayers && numPlayers <= 15;
}
