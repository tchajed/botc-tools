/* Script Tool "night sheet"
 *
 * Gives a global ordering for all characters, for first night and other nights.
 */
import nightsheet from "../../../assets/data/nightsheet.json";

function getFirstNight(name: string): number | null {
  const n = nightsheet.firstNight.indexOf(name);
  if (n < 0) {
    return null;
  }
  return n;
}

function getOtherNights(name: string): number | null {
  const n = nightsheet.otherNight.indexOf(name);
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
