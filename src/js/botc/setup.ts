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
  var dist = zeroDistribution();
  dist.demon = 1;
  if (numPlayers == 5 || numPlayers == 6) {
    dist.outsider = numPlayers - 5;
    dist.minion = 1;
  } else {
    dist.outsider = (numPlayers - 7) % 3;
    dist.minion = Math.floor((numPlayers - 7) / 3) + 1;
  }
  dist.townsfolk = numPlayers - dist.outsider - dist.minion - dist.demon;
  return dist;
}

export function validNumPlayers(numPlayers: number): boolean {
  return 5 <= numPlayers && numPlayers <= 15;
}
