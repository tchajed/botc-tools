/* Script Tool "night sheet"
 *
 * Gives a global ordering for all characters, for first night and other nights.
 */
import nightsheetRaw from "../../../assets/data/nightsheet.json";

// this nightsheet from nicholas-eden/townsquare uses identifiers, plus the special
// dusk, dawn, minion, demon night phases.
const nightsheet = nightsheetRaw;

function getFirstNight(id: string): number | null {
  // implicitly add drunk to nightsheet (since we have a custom night ability for it)
  if (id == "drunk") {
    return -1;
  }
  if (id == "stormcatcher") {
    return nightsheet.firstNight.indexOf("demoninfo");
  }
  const n = nightsheet.firstNight.indexOf(id);
  if (n < 0) {
    return null;
  }
  return n;
}

function getOtherNights(id: string): number | null {
  const n = nightsheet.otherNight.indexOf(id);
  if (n < 0) {
    return null;
  }
  return n;
}

export const nightorder = {
  getFirstNight,
  firstNight: (id: string): number => {
    const n = getFirstNight(id);
    if (n == null) {
      console.warn(`${id} is not on nightsheet for first night`);
      return -1;
    }
    return n;
  },
  getOtherNights,
  otherNights: (id: string): number => {
    const n = getOtherNights(id);
    if (n == null) {
      console.warn(`${id} is not on nightsheet for other nights`);
      return -1;
    }
    return n;
  },
};
