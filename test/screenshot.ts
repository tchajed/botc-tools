import * as fs from "fs";
import puppeteer from "puppeteer";
import { KnownDevices } from "puppeteer";

const iPhone = KnownDevices["iPhone 11"];

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.emulate(iPhone);
  await page.setViewport(iPhone.viewport);

  const scrollPage = async (y: number) => {
    await page.evaluate((y) => {
      window.scrollTo({ top: y });
    }, y);
  };

  const screenshot = async (name: string) => {
    await wait(200);
    await page.screenshot({
      path: `test/screenshots/${name}.png`,
    });
  };
  if (!fs.existsSync("test/screenshots")) {
    await fs.promises.mkdir("test/screenshots/assign", { recursive: true });
  }

  await page.goto("https://botc-tools.xyz");
  await screenshot("home");

  await page.click("xpath///a[contains(., 'Trouble Brewing')]");
  await page.waitForSelector(".main");
  await screenshot("roles-top");

  await scrollPage(600);
  await screenshot("roles-bottom");

  await page.click("xpath///a[contains(., 'Night')]");
  await page.waitForSelector(".main");
  await screenshot("night");

  await page.click("xpath///a[contains(., 'Assign')]");
  await page.waitForSelector(".main");

  await page.tap(`xpath///*[@id = 'minus-player-btn']`);

  const pickChar = async function (name, bag = false) {
    const charsX = `*[contains(concat(' ', normalize-space(@class), ' '), ' characters ')]`;
    const bagCharsX = `*[contains(concat(' ', normalize-space(@class), ' '), ' selected-characters ')]`;
    const charSel = bag ? bagCharsX : charsX;
    await page.tap(`xpath///${charSel}//span[contains(text(), '${name}')]`);
  };
  await pickChar("Soldier");
  await pickChar("Baron");
  await pickChar("Drunk");
  await pickChar("Saint");
  await pickChar("Ravenkeeper");
  await scrollPage(100);
  await screenshot("assign/1-incomplete");

  await pickChar("Librarian");
  await pickChar("Fortune Teller");
  await screenshot("assign/2-complete");

  await scrollPage(1050);
  await screenshot("assign/3-bag");

  await page.setViewport({
    width: iPhone.viewport.height,
    height: iPhone.viewport.width,
    hasTouch: true,
  });

  await pickChar("Imp", true);
  await screenshot("assign/4-show-char");

  await browser.close();
}

main();
