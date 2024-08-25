/* Script Tool "night sheet"
 *
 * Gives a global ordering for all characters, for first night and other nights.
 */
import nightsheetRaw from "../../../assets/data/nightsheet.json";
import { nameToId } from "./roles";

// Normalize character names to nightsheet keys.
//
// The nightsheet is called in the rest of this code base using capitalized
// names for historical reasons (the nightsheet.json from the website to contain
// character names), but now it contains identifiers like most other things.
function nightsheetNormalize(name: string): string {
  if (["DUSK", "DAWN", "MINION", "DEMON"].includes(name)) {
    return name;
  }
  return nameToId(name.toLowerCase());
}

function normalizeNightSheet(): {
  firstNight: string[];
  otherNight: string[];
} {
  return {
    firstNight: nightsheetRaw.firstNight.map(nightsheetNormalize),
    otherNight: nightsheetRaw.otherNight.map(nightsheetNormalize),
  };
}

// the identifiers here are normalized with `nameToId`, except for the special
// DUSK, DAWN, MINION, DEMON night actions.
const nightsheet = normalizeNightSheet();

function getFirstNight(name: string): number | null {
  const id = nightsheetNormalize(name);
  // implicitly add drunk to nightsheet (since we have a custom night ability for it)
  if (id == "drunk") {
    return -1;
  }
  if (id == "stormcatcher") {
    return nightsheet.firstNight.indexOf("DEMON");
  }
  const n = nightsheet.firstNight.indexOf(id);
  if (n < 0) {
    return null;
  }
  return n;
}

function getOtherNights(name: string): number | null {
  const id = nightsheetNormalize(name);
  const n = nightsheet.otherNight.indexOf(id);
  if (n < 0) {
    return null;
  }
  return n;
}

export const nightorder = {
  getFirstNight,
  firstNight: (name: string): number => {
    const n = getFirstNight(name);
    if (n == null) {
      console.warn(`${name} is not on nightsheet for first night`);
      return -1;
    }
    return n;
  },
  getOtherNights,
  otherNights: (name: string): number => {
    const n = getOtherNights(name);
    if (n == null) {
      console.warn(`${name} is not on nightsheet for other nights`);
      return -1;
    }
    return n;
  },
};
