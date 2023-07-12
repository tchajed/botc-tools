/* Script Tool "night sheet"
 *
 * Gives a global ordering for all characters, for first night and other nights.
 */
import nightsheet from "../../../assets/data/nightsheet.json";

function getFirstNight(id: string): number | null {
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
      console.warn(`${id} does not go on first night`);
      return -1;
    }
    return n;
  },
  getOtherNights,
  otherNights: (id: string): number => {
    const n = getOtherNights(id);
    if (n == null) {
      console.warn(`${id} does not go on other nights`);
      return -1;
    }
    return n;
  },
};
