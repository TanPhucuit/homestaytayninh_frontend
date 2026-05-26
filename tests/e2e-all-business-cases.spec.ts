import { expect, Page, test } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL ?? "https://homestaytayninh-frontend.vercel.app";

function watchFailures(page: Page) {
  const failures: string[] = [];

  page.on("pageerror", (error) => failures.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") failures.push(`console: ${message.text()}`);
  });
  page.on("response", (response) => {
    const url = response.url();
    const status = response.status();
    if (status >= 500) failures.push(`http ${status}: ${url}`);
      });

  return failures;
}

async function assertNoBrokenUi(page: Page, failures: string[]) {
  await expect(page.locator("body")).not.toBeEmpty();
  await expect(page.getByText(/Application error|INTERNAL_SERVER_ERROR|MIDDLEWARE_INVOCATION_FAILED/i)).toHaveCount(0);
  await expect(page.getByText(/Unsupported provider|provider is not enabled/i)).toHaveCount(0);
  await expect(page.getByText(/KhÃ´ng táº£i Ä‘Æ°á»£c|gáº·p lá»—i runtime|Checkout gáº·p lá»—i|Trang gáº·p lá»—i/i)).toHaveCount(0);
  expect(failures).toEqual([]);
}

test.describe("All unauthenticated business cases on production", () => {
  test("all public and guarded routes render without 5xx or blank screen", async ({ page }) => {
    const failures = watchFailures(page);
    const routes = [
      "/",
      "/login",
      "/homestays",
      "/homestays/hs-ba-den",
      "/homestays/hs-trang-bang",
      "/checkout?homestayId=hs-ba-den",
      "/checkout?homestayId=hs-trang-bang",
      "/bookings",
      "/payment/result?status=paid",
      "/payment/result?status=failed",
      "/payment/result?status=expired",
      "/owner",
      "/owner/manage",
      "/owner/proxy-booking",
      "/staff",
      "/staff/moderation",
      "/admin"
    ];

    for (const route of routes) {
      await page.goto(`${baseURL}${route}`);
      await assertNoBrokenUi(page, failures);
    }
  });

  test("homestay search covers matching, empty, invalid and reset filters", async ({ page }) => {
    const failures = watchFailures(page);

    await page.goto(`${baseURL}/homestays`);
    await expect(page.getByRole("heading", { name: /TÃ¬m homestay/i })).toBeVisible();

    await page.locator('input[name="guests"]').fill("2");
    await page.locator('select[name="type"]').selectOption("PhÃ²ng");
    await page.locator('input[name="maxPrice"]').fill("800000");
    await page.getByRole("button", { name: /TÃ¬m kiáº¿m/i }).click();
    await expect(page).toHaveURL(/type=/);
    await expect(page.getByRole("link", { name: /Xem chi tiáº¿t/i }).first()).toBeVisible();
    await assertNoBrokenUi(page, failures);

    await page.goto(`${baseURL}/homestays?guests=99&maxPrice=1`);
    await expect(page.getByText(/KhÃ´ng tÃ¬m tháº¥y|Homestay|Xem chi tiáº¿t/i).first()).toBeVisible();
    await assertNoBrokenUi(page, failures);

    await page.goto(`${baseURL}/homestays?guests=abc`);
    await expect(page.locator("body")).not.toBeEmpty();
    await assertNoBrokenUi(page, failures);

    await page.getByRole("link", { name: /TÃ¬m homestay|XÃ³a bá»™ lá»c|Trang chá»§/i }).first().click();
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("homestay details expose rooms services and checkout entry for each listing", async ({ page }) => {
    const failures = watchFailures(page);

    for (const id of ["hs-ba-den", "hs-trang-bang"]) {
      await page.goto(`${baseURL}/homestays/${id}`);
      await expect(page.getByRole("link", { name: /Tiáº¿p tá»¥c Ä‘áº·t phÃ²ng/i })).toBeVisible();
      await expect(page.getByText(/PhÃ²ng kháº£ dá»¥ng/i)).toBeVisible();
      await expect(page.getByText(/Dá»‹ch vá»¥ cÃ³ thá»ƒ Ä‘áº·t thÃªm/i)).toBeVisible();
      await page.getByRole("link", { name: /Tiáº¿p tá»¥c Ä‘áº·t phÃ²ng/i }).click();
      await expect(page).toHaveURL(new RegExp(`/checkout\\?homestayId=${id}`));
      await assertNoBrokenUi(page, failures);
    }
  });

  test("checkout form validates required fields and redirects unauthenticated valid submit", async ({ page }) => {
    const failures = watchFailures(page);

    await page.goto(`${baseURL}/checkout?homestayId=hs-ba-den`);
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\/checkout/);
    await expect(page.locator('input[name="guestName"]')).toBeFocused();

    await page.locator('input[name="guestName"]').fill("A");
    await page.locator('input[name="guestPhone"]').fill("abc");
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\/checkout/);

    await page.locator('input[name="guestName"]').fill("Nguyen Test");
    await page.locator('input[name="guestPhone"]').fill("0901234567");
    await page.locator('input[name="guestCount"]').fill("2");
    await page.locator('input[name^="service:"]').first().fill("1");
    await page.locator('button[type="submit"]').click();
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/login\?error=auth_required/);
    await expect(page.getByText(/Báº¡n cáº§n Ä‘Äƒng nháº­p/i)).toBeVisible();
    await assertNoBrokenUi(page, failures);
  });

  test("booking history is private until authentication and payment status route remains usable", async ({ page }) => {
    const failures = watchFailures(page);

    await page.goto(`${baseURL}/bookings`);
    await expect(page.getByRole("heading", { name: /KhÃ´ng cÃ³ quyá»n truy cáº­p/i })).toBeVisible();
    await page.goto(`${baseURL}/payment/result?status=pending`);
    await expect(page.getByRole("heading", { name: /Káº¿t quáº£ thanh toÃ¡n/i })).toBeVisible();
    await assertNoBrokenUi(page, failures);
  });

  test("payment result handles all frontend status variants", async ({ page }) => {
    const failures = watchFailures(page);
    const cases = [
      { query: "status=paid", text: /thÃ nh cÃ´ng|ÄÃ£ thanh toÃ¡n/i },
      { query: "status=pending", text: /Ä‘ang xá»­ lÃ½|Äang xá»­ lÃ½/i },
      { query: "status=failed", text: /chÆ°a hoÃ n táº¥t|Tháº¥t báº¡i/i },
      { query: "status=expired", text: /chÆ°a hoÃ n táº¥t|háº¿t háº¡n|ÄÃ£ há»§y/i },
      { query: "status=unpaid", text: /Ä‘ang xá»­ lÃ½|ChÆ°a thanh toÃ¡n/i }
    ];

    for (const item of cases) {
      await page.goto(`${baseURL}/payment/result?${item.query}`);
      await expect(page.getByRole("heading", { name: /Káº¿t quáº£ thanh toÃ¡n/i })).toBeVisible();
      await expect(page.getByText(item.text).first()).toBeVisible();
      await assertNoBrokenUi(page, failures);
    }
  });

  test("role protected portals consistently block unauthenticated access", async ({ page }) => {
    const failures = watchFailures(page);
    for (const route of ["/owner", "/owner/manage", "/owner/proxy-booking", "/staff", "/staff/moderation", "/admin"]) {
      await page.goto(`${baseURL}${route}`);
      await expect(page.getByText(/KhÃ´ng cÃ³ quyá»n truy cáº­p/i)).toBeVisible();
      await expect(page.getByRole("link", { name: /ÄÄƒng nháº­p Ä‘Ãºng vai trÃ²/i })).toBeVisible();
      await assertNoBrokenUi(page, failures);
    }
  });

  test("core customer journey remains usable on mobile viewport", async ({ page }) => {
    const failures = watchFailures(page);
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto(baseURL);
    await expect(page.getByRole("link", { name: /Äáº·t phÃ²ng ngay/i })).toBeVisible();
    await page.getByRole("link", { name: /Äáº·t phÃ²ng ngay/i }).click();
    await page.locator('input[name="guests"]').fill("2");
    await page.getByRole("button", { name: /TÃ¬m kiáº¿m/i }).click();
    await expect(page.getByRole("link", { name: /Xem chi tiáº¿t/i }).first()).toBeVisible();
    await page.getByRole("link", { name: /Xem chi tiáº¿t/i }).first().click();
    await expect(page.getByRole("link", { name: /Tiáº¿p tá»¥c Ä‘áº·t phÃ²ng/i })).toBeVisible();
    await assertNoBrokenUi(page, failures);
  });
});
