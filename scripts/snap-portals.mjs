// Dev helper: logs in with local demo accounts and saves full-page screenshots.
// Usage: node scripts/snap-portals.mjs <outDir> [baseUrl]
import { chromium } from "@playwright/test";

const outDir = process.argv[2] ?? "screenshots";
const base = process.argv[3] ?? "http://localhost:3000";
const plan = [
  { email: "demo@gmail.com", pages: [["bookings", "/bookings"]] },
  { email: "ownerdemo@gmail.com", pages: [["owner", "/owner"], ["owner-manage", "/owner/manage"]] },
  { email: "ownerstaff.demo@homestay.local", pages: [["proxy", "/owner/proxy-booking"]] },
  { email: "staff.demo@homestay.local", pages: [["staff", "/staff"], ["moderation", "/staff/moderation"]] },
  { email: "admindemo@gmail.com", pages: [["admin", "/admin"]] }
];

const browser = await chromium.launch();
for (const account of plan) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${base}/login`);
  await page.fill('input[name="email"]', account.email);
  await page.fill('input[name="password"]', "demo123");
  await Promise.all([page.waitForNavigation(), page.click('button[type="submit"]')]);
  for (const [name, path] of account.pages) {
    await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible")));
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${outDir}/${name}.png`, fullPage: true });
    console.log("saved", name);
  }
  await context.close();
}
await browser.close();
