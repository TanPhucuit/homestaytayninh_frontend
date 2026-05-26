import { expect, Page, test } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL ?? "https://homestaytayninh-frontend.vercel.app";
test.setTimeout(60000);

async function monitorPage(page: Page) {
  const failures: string[] = [];

  page.on("pageerror", (error) => failures.push(`pageerror: ${error.message}`));
  page.on("response", (response) => {
    const status = response.status();
    const url = response.url();
    if (status >= 500) failures.push(`http ${status}: ${url}`);
  });

  return failures;
}

async function expectNoRuntimeFailure(page: Page, failures: string[]) {
  await expect(page.getByText(/Application error|INTERNAL_SERVER_ERROR|MIDDLEWARE_INVOCATION_FAILED|Unsupported provider|provider is not enabled/i)).toHaveCount(0);
  await expect(page.getByText(/Không tải được|Checkout gặp lỗi|Trang gặp lỗi runtime/i)).toHaveCount(0);
  expect(failures).toEqual([]);
}

test.describe("Homestay Tây Ninh business flows on production", () => {
  test("landing, navigation, search, detail and checkout redirect are usable", async ({ page }) => {
    const failures = await monitorPage(page);

    await page.goto(baseURL);
    await expect(page.getByRole("link", { name: /Đăng nhập/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Đặt phòng ngay/i })).toBeVisible();

    await page.getByRole("link", { name: /Đặt phòng ngay/i }).click();
    await expect(page).toHaveURL(/\/homestays/);
    await page.locator('input[name="guests"]').fill("2");
    await page.locator('input[name="maxPrice"]').fill("2000000");
    await page.getByRole("button", { name: /Áp dụng bộ lọc/i }).click();
    await expect(page).toHaveURL(/guests=2/);
    await expect(page.getByRole("link", { name: /Xem chi tiết/i }).first()).toBeVisible();

    await page.getByRole("link", { name: /Xem chi tiết/i }).first().click();
    await expect(page).toHaveURL(/\/homestays\//);
    await expect(page).toHaveURL(/guests=2/);
    await page.getByRole("link", { name: /Chọn phòng|Tiếp tục đặt phòng/i }).first().click();
    await expect(page).toHaveURL(/\/checkout/);
    await expect(page).toHaveURL(/guestCount=2/);

    await page.locator('input[name="guestName"]').fill("Nguyen Test");
    await page.locator('input[name="guestPhone"]').fill("0901234567");
    await page.getByRole("button", { name: /Tiếp tục chọn dịch vụ/i }).click();
    await expect(page).toHaveURL(/\/checkout\/services/);
    await page.locator('input[name^="service:"]').first().fill("1");
    await page.getByRole("button", { name: /Tiếp tục xác nhận/i }).click();
    await page.getByRole("button", { name: /Xác nhận đặt phòng/i }).click();
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL(/\/login\?error=auth_required/);
    await expect(page.getByText(/Bạn cần đăng nhập/i)).toBeVisible();
    await expectNoRuntimeFailure(page, failures);
  });

  test("email/password demo login form is visible", async ({ page }) => {
    const failures = await monitorPage(page);

    await page.goto(`${baseURL}/login`);
    await expect(page.locator('input[name="email"]')).toHaveValue("demo@gmail.com");
    await expect(page.locator('input[name="password"]')).toHaveValue("demo123");
    await expect(page.getByRole("button", { name: /Đăng nhập bằng tài khoản/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Google/i })).toBeVisible();
    await expectNoRuntimeFailure(page, failures);
  });

  test("private booking pages require authentication and public payment state renders", async ({ page }) => {
    const failures = await monitorPage(page);

    await page.goto(`${baseURL}/bookings`);
    await expect(page.getByRole("heading", { name: /Không có quyền truy cập/i })).toBeVisible();
    await page.goto(`${baseURL}/payment/result?status=pending`);
    await expect(page.getByText(/Kết quả thanh toán/i)).toBeVisible();
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
