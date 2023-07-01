import { Command } from "commander";
import * as fs from "fs";
import puppeteer, { Browser, Page } from "puppeteer";
import { KnownDevices } from "puppeteer";
import sharp from "sharp";

const iPhone = KnownDevices["iPhone 11"];

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function launchBrowser(): Promise<{ browser: Browser; page: Page }> {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.emulate(iPhone);
  await page.setViewport(iPhone.viewport);
  return { browser, page };
}

function matchesFilter(name: string, filter: string) {
  return filter == "" || name.includes(filter);
}

async function setLandscape(page: Page) {
  await page.setViewport({
    width: iPhone.viewport.height,
    height: iPhone.viewport.width,
    hasTouch: true,
  });
}

async function copyScreenshot(testName: string, destName: string) {
  const src = `test/screenshots/${testName}.png`;
  const dest = `screenshots/${destName}.webp`;
  if (!fs.existsSync(src)) {
    console.error(`missing screenshot ${src}`);
    return;
  }
  const img = sharp(src);
  const meta = await img.metadata();
  if (meta.width && meta.height) {
    img.resize({
      width: Math.floor(meta.width * 0.75),
      height: Math.floor(meta.height * 0.75),
      fit: "inside",
    });
  }
  await img.toFile(dest);
}

async function copyScreenshots() {
  const screenshots = [
    ["roles-top", "roles"],
    ["night", "night"],
    ["assign/2-complete", "assign"],
    ["assign/3-bag", "bag"],
    ["assign/4-grimoire", "grimoire"],
    ["assign/5-show-bluffs", "bluffs"],
    ["assign/6-show-char", "character"],
  ];
  await Promise.all(
    screenshots.map(([testName, destName]) => {
      return copyScreenshot(testName, destName);
    })
  );
}

async function main() {
  const program = new Command();
  program
    .version("0.1.0")
    .description("Take screenshots of app for testing and documentation")
    .option("--use", "copy to screenshots/ for FEATURES.md", false)
    .option("--url <url>", "app url to screenshot", "https://botc-tools.xyz")
    .option("--filter <filter>", "take screenshots containing this string", "");
  program.parse();

  const options = program.opts();

  if (options.use) {
    await copyScreenshots();
    return;
  }

  const { browser, page } = await launchBrowser();

  const scrollPage = async (y: number) => {
    await page.evaluate((y) => {
      window.scrollTo({ top: y });
    }, y);
  };

  const _scrollToSelector = async (selector: string) => {
    await page.waitForSelector(selector);
    const el = await page.$(selector);
    await el?.scrollIntoView();
  };

  const screenshot = async (name: string) => {
    if (matchesFilter(name, options.filter)) {
      await wait(200);
      await page.screenshot({
        path: `test/screenshots/${name}.png`,
      });
    }
  };
  if (!fs.existsSync("test/screenshots")) {
    await fs.promises.mkdir("test/screenshots/assign", { recursive: true });
  }

  let url: string = options.url;
  if (url.startsWith("localhost")) {
    url = `http://${url}`;
  }
  if (url.startsWith("botc-tools.xyz")) {
    url = `https://${url}`;
  }
  await page.goto(url);
  await page.waitForSelector(".main");
  await screenshot("home");

  await page.type("#search-query", "trouble brewing");
  await screenshot("title-search");
  await page.keyboard.press("Escape");

  await page.type("#search-query", "hadikhia atheist marionette");
  await screenshot("character-search");
  await page.keyboard.press("Escape");

  await page.click("xpath///a[contains(., 'Trouble Brewing')]");
  await page.waitForSelector(".main");
  await screenshot("roles-top");

  await scrollPage(600);
  await screenshot("roles-bottom");

  await page.click("xpath///a[contains(., 'Night')]");
  await page.waitForSelector(".main");
  await screenshot("night");

  await page.click("xpath///a[contains(., 'Assign')]");
  await page.waitForSelector(".columns");

  // reduce player count to 7
  await page.tap(`xpath///*[@id = 'minus-player-btn']`);

  const pickChar = async function (
    name: string,
    where: "bag" | "chars" = "chars"
  ) {
    const charsX = `*[contains(concat(' ', normalize-space(@class), ' '), ' columns ')]`;
    const bagCharsX = `*[contains(concat(' ', normalize-space(@class), ' '), ' selected-characters ')]`;
    const charSel = where == "bag" ? bagCharsX : charsX;
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

  await page.tap(`xpath///*[contains(text(), 'choose bluffs')]`);
  await pickChar("Investigator");
  await pickChar("Empath");
  await pickChar("Undertaker");

  await screenshot("assign/2-complete");

  await scrollPage(1050);
  await screenshot("assign/3-bag");

  await page.type(
    "#player_names",
    "Horatio\nThumbelina\nBriar Rose\nFrodo\nAragorn\nJuliette\nPolonius"
  );
  await page.tap(".townsquare");
  await scrollPage(1500);

  // need new townsquare to render
  await wait(300);
  await screenshot("assign/4-grimoire");

  await pickChar("Empath", "bag");
  await screenshot("assign/5-show-bluffs");

  await setLandscape(page);
  await pickChar("Imp", "bag");
  await screenshot("assign/6-show-char");

  await browser.close();
}

main();
