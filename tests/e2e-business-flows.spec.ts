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
    if (url.includes("supabase.co/auth/v1/authorize") && status >= 400) failures.push(`supabase oauth ${status}: ${url}`);
  });

  return failures;
}

async function expectNoRuntimeFailure(page: Page, failures: string[]) {
  await expect(page.getByText(/Application error|INTERNAL_SERVER_ERROR|MIDDLEWARE_INVOCATION_FAILED|Unsupported provider|provider is not enabled/i)).toHaveCount(0);
  await expect(page.getByText(/Không tải được|Checkout gặp lỗi|Trang gặp lỗi runtime/i)).toHaveCount(0);
  expect(failures).toEqual([]);
}

test.describe("Homestay Tay Ninh business flows on production", () => {
  test("landing, navigation, search, detail and checkout redirect are usable", async ({ page }) => {
    const failures = await monitorPage(page);

    await page.goto(baseURL);
    await expect(page.getByRole("link", { name: /Đăng nhập/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Đặt phòng ngay/i })).toBeVisible();

    await page.getByRole("link", { name: /Đặt phòng ngay/i }).click();
    await expect(page).toHaveURL(/\/homestays/);
    await page.locator('input[name="guests"]').fill("2");
    await page.locator('input[name="maxPrice"]').fill("2000000");
    await page.getByRole("button", { name: /Tìm kiếm/i }).click();
    await expect(page).toHaveURL(/guests=2/);
    await expect(page.getByRole("link", { name: /Xem chi tiết/i }).first()).toBeVisible();

    await page.getByRole("link", { name: /Xem chi tiết/i }).first().click();
    await expect(page).toHaveURL(/\/homestays\//);
    await expect(page.getByRole("link", { name: /Tiếp tục đặt phòng/i })).toBeVisible();
    await page.getByRole("link", { name: /Tiếp tục đặt phòng/i }).click();

    await expect(page).toHaveURL(/\/checkout/);
    await page.locator('input[name="guestName"]').fill("Nguyen Test");
    await page.locator('input[name="guestPhone"]').fill("0901234567");
    await page.locator('input[name^="service:"]').first().fill("1");
    await page.locator('button[type="submit"]').click();
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL(/\/login\?error=auth_required/);
    await expect(page.getByText(/Bạn cần đăng nhập/i)).toBeVisible();
    await expectNoRuntimeFailure(page, failures);
  });

  test("Google login click handles disabled provider as app UI, not raw Supabase JSON", async ({ page }) => {
    const failures = await monitorPage(page);

    await page.goto(`${baseURL}/login`);
    await page.getByRole("link", { name: /Google/i }).click();
    await page.waitForLoadState("networkidle");

    await expect(page).not.toHaveURL(/supabase\.co\/auth\/v1\/authorize/);
    if (page.url().includes("accounts.google.com")) {
      await expect(page.getByRole("textbox", { name: /Email|phone/i })).toBeVisible();
    } else {
      await expect(page.getByRole("link", { name: /Google/i })).toBeVisible();
    }
    if (page.url().includes("provider_disabled")) {
      await expect(page.getByText(/Google provider chưa được bật/i)).toBeVisible();
    }
    await expect(page.getByText(/Unsupported provider|provider is not enabled/i)).toHaveCount(0);
    expect(failures.filter((failure) => !failure.includes("supabase oauth"))).toEqual([]);
  });

  test("booking history, booking detail and payment result do not crash", async ({ page }) => {
    const failures = await monitorPage(page);

    await page.goto(`${baseURL}/bookings`);
    await expect(page.getByRole("heading", { name: /Quản lý đặt phòng/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Xem chi tiết/i }).first()).toBeVisible();

    await page.getByRole("link", { name: /Xem chi tiết/i }).first().click();
    await expect(page).toHaveURL(/\/bookings\//);
    await expect(page.getByText(/Dịch vụ trong booking/i)).toBeVisible();
    await expect(page.getByText(/Tổng hóa đơn/i).first()).toBeVisible();

    await page.getByRole("link", { name: /Kiểm tra trạng thái|Kiểm tra thanh toán/i }).first().click();
    await expect(page).toHaveURL(/\/payment\/result/);
    await expect(page.getByRole("heading", { name: /Kết quả thanh toán/i })).toBeVisible();
    await expectNoRuntimeFailure(page, failures);
  });

  test("protected owner staff admin portals render route guard without broken forms", async ({ page }) => {
    const failures = await monitorPage(page);

    for (const path of ["/owner", "/owner/manage", "/owner/proxy-booking", "/staff", "/staff/moderation", "/admin"]) {
      await page.goto(`${baseURL}${path}`);
      await expect(page.locator("body")).not.toBeEmpty();
      await expect(page.getByText(/Không có quyền truy cập|Đăng nhập đúng vai trò|Đăng nhập/i).first()).toBeVisible();
      await expectNoRuntimeFailure(page, failures);
    }
  });
});
