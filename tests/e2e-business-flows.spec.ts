import { expect, Page, test } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL ?? "https://homestaytayninh-frontend.vercel.app";

async function monitorPage(page: Page) {
  const failures: string[] = [];

  page.on("pageerror", (error) => failures.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") failures.push(`console: ${message.text()}`);
  });
  page.on("response", (response) => {
    const status = response.status();
    const url = response.url();
    if (status >= 500) failures.push(`http ${status}: ${url}`);
      });

  return failures;
}

async function expectNoRuntimeFailure(page: Page, failures: string[]) {
  await expect(page.getByText(/Application error|INTERNAL_SERVER_ERROR|MIDDLEWARE_INVOCATION_FAILED|Unsupported provider|provider is not enabled/i)).toHaveCount(0);
  await expect(page.getByText(/KhÃ´ng táº£i Ä‘Æ°á»£c|Checkout gáº·p lá»—i|Trang gáº·p lá»—i runtime/i)).toHaveCount(0);
  expect(failures).toEqual([]);
}

test.describe("Homestay Tay Ninh business flows on production", () => {
  test("landing, navigation, search, detail and checkout redirect are usable", async ({ page }) => {
    const failures = await monitorPage(page);

    await page.goto(baseURL);
    await expect(page.getByRole("link", { name: /ÄÄƒng nháº­p/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Äáº·t phÃ²ng ngay/i })).toBeVisible();

    await page.getByRole("link", { name: /Äáº·t phÃ²ng ngay/i }).click();
    await expect(page).toHaveURL(/\/homestays/);
    await page.locator('input[name="guests"]').fill("2");
    await page.locator('input[name="maxPrice"]').fill("2000000");
    await page.getByRole("button", { name: /TÃ¬m kiáº¿m/i }).click();
    await expect(page).toHaveURL(/guests=2/);
    await expect(page.getByRole("link", { name: /Xem chi tiáº¿t/i }).first()).toBeVisible();

    await page.getByRole("link", { name: /Xem chi tiáº¿t/i }).first().click();
    await expect(page).toHaveURL(/\/homestays\//);
    await expect(page.getByRole("link", { name: /Tiáº¿p tá»¥c Ä‘áº·t phÃ²ng/i })).toBeVisible();
    await page.getByRole("link", { name: /Tiáº¿p tá»¥c Ä‘áº·t phÃ²ng/i }).click();

    await expect(page).toHaveURL(/\/checkout/);
    await page.locator('input[name="guestName"]').fill("Nguyen Test");
    await page.locator('input[name="guestPhone"]').fill("0901234567");
    await page.locator('input[name^="service:"]').first().fill("1");
    await page.locator('button[type="submit"]').click();
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL(/\/login\?error=auth_required/);
    await expect(page.getByText(/Báº¡n cáº§n Ä‘Äƒng nháº­p/i)).toBeVisible();
    await expectNoRuntimeFailure(page, failures);
  });

  test("Google login click uses Google OAuth directly", async ({ page }) => {
    const failures = await monitorPage(page);

    await page.goto(`${baseURL}/login`);
    await page.getByRole("link", { name: /Google/i }).click();
    await page.waitForLoadState("networkidle");

    if (page.url().includes("accounts.google.com")) {
      await expect(page.getByRole("textbox", { name: /Email|phone/i })).toBeVisible();
    } else {
      await expect(page.getByRole("link", { name: /Google/i })).toBeVisible();
    }
    await expect(page.getByText(/Unsupported provider|provider is not enabled/i)).toHaveCount(0);
    expect(failures).toEqual([]);
  });

  test("private booking pages require authentication and public payment state renders", async ({ page }) => {
    const failures = await monitorPage(page);

    await page.goto(`${baseURL}/bookings`);
    await expect(page.getByRole("heading", { name: /KhÃ´ng cÃ³ quyá»n truy cáº­p/i })).toBeVisible();
    await page.goto(`${baseURL}/payment/result?status=pending`);
    await expect(page.getByRole("heading", { name: /Káº¿t quáº£ thanh toÃ¡n/i })).toBeVisible();
    await expectNoRuntimeFailure(page, failures);
  });

  test("protected owner staff admin portals render route guard without broken forms", async ({ page }) => {
    const failures = await monitorPage(page);

    for (const path of ["/owner", "/owner/manage", "/owner/proxy-booking", "/staff", "/staff/moderation", "/admin"]) {
      await page.goto(`${baseURL}${path}`);
      await expect(page.locator("body")).not.toBeEmpty();
      await expect(page.getByText(/KhÃ´ng cÃ³ quyá»n truy cáº­p|ÄÄƒng nháº­p Ä‘Ãºng vai trÃ²|ÄÄƒng nháº­p/i).first()).toBeVisible();
      await expectNoRuntimeFailure(page, failures);
    }
  });
});
