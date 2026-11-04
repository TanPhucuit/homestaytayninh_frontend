// Dev helper: checks horizontal overflow at phone width and saves full-page screenshots.
// Usage: node scripts/check-mobile.mjs <outDir> [baseUrl]
import { chromium } from "@playwright/test";

const outDir = process.argv[2] ?? "screenshots";
const base = process.argv[3] ?? "http://localhost:3000";
const pages = [["m-home", "/"], ["m-detail", "/homestays/hs-ba-den"], ["m-list", "/homestays"], ["m-login", "/login"]];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
for (const [name, path] of pages) {
  await page.goto(`${base}${path}`, { waitUntil: "load", timeout: 60000 });
  await page.evaluate(() => document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible")));
  const result = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const wide = [...document.querySelectorAll("main *, header *")]
      .filter((el) => el.getBoundingClientRect().right > vw + 1 && !el.closest(".marquee") && getComputedStyle(el).position !== "fixed")
      .slice(0, 4)
      .map((el) => `${el.tagName}.${String(el.className).slice(0, 70)}`);
    return { vw, scrollWidth: document.documentElement.scrollWidth, wide };
  });
  console.log(name, JSON.stringify(result));
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${outDir}/${name}.png`, fullPage: true, animations: "disabled", timeout: 30000 });
}
await browser.close();
