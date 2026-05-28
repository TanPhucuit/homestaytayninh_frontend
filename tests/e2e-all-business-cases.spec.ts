import { expect, Page, test } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL ?? "https://homestaytayninh-frontend.vercel.app";
test.setTimeout(60000);

function watchFailures(page: Page) {
  const failures: string[] = [];

  page.on("pageerror", (error) => failures.push(`pageerror: ${error.message}`));
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
  await expect(page.getByText(/Không tải được|gặp lỗi runtime|Checkout gặp lỗi|Trang gặp lỗi/i)).toHaveCount(0);
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
    await expect(page.getByRole("heading", { name: /Tìm thấy/i })).toBeVisible();

    await page.locator('aside input[name="guests"]').fill("2");
    await page.locator("aside").getByLabel("Phòng").check();
    await page.locator('aside input[name="price"]').evaluate((element) => {
      const input = element as HTMLInputElement;
      input.value = "2000000";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await page.locator("aside").getByRole("button", { name: /^Áp dụng$/i }).click();
    await expect(page).toHaveURL(/type=/);
    await expect(page.getByRole("link", { name: /Chi tiết|Xem chi tiết/i }).first()).toBeVisible();
    await assertNoBrokenUi(page, failures);

    await page.goto(`${baseURL}/homestays?guests=99&maxPrice=1`);
    await expect(page.getByText(/Không tìm thấy|Homestay|Xem chi tiết/i).first()).toBeVisible();
    await assertNoBrokenUi(page, failures);

    await page.goto(`${baseURL}/homestays?guests=abc`);
    await expect(page.locator("body")).not.toBeEmpty();
    await assertNoBrokenUi(page, failures);

    await page.getByRole("link", { name: /Tìm homestay|Xóa bộ lọc|Trang chủ/i }).first().click();
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("homestay details expose rooms services reviews map and checkout entry", async ({ page }) => {
    const failures = watchFailures(page);

    for (const id of ["hs-ba-den", "hs-trang-bang"]) {
      await page.goto(`${baseURL}/homestays/${id}?guests=2`);
      await expect(page).not.toHaveURL(/guests=2/);
      await expect(page.getByRole("link", { name: /Chọn phòng/i })).toBeVisible();
      await expect(page.getByText(/Chọn phòng của bạn/i)).toBeVisible();
      await expect(page.getByText(/Dịch vụ có thể đặt thêm/i)).toBeVisible();
      await expect(page.getByText(/Đánh giá/i)).toBeVisible();
      await expect(page.getByRole("link", { name: /Mở Google Maps/i })).toBeVisible();
      await expect(page.getByTestId("continue-checkout")).toBeDisabled();
      await assertNoBrokenUi(page, failures);
    }
  });

  test("checkout validates required fields and redirects unauthenticated valid submit", async ({ page }) => {
    const failures = watchFailures(page);

    await page.goto(`${baseURL}/homestays/hs-ba-den?checkIn=2026-06-09&checkOut=2026-06-11&guests=2`);
    await expect(page).not.toHaveURL(/checkIn=2026-06-09/);
    await page.getByRole("button", { name: "Chọn phòng" }).first().click();
    await page.getByTestId("summary-check-in").fill("2026-06-09");
    await page.getByTestId("summary-check-out").fill("2026-06-11");
    await page.getByTestId("summary-guests").fill("1");
    await page.getByTestId("continue-checkout").click();
    await expect(page).toHaveURL(/\/checkout\/services/);
    await page.getByRole("button", { name: /Tiếp tục xác nhận/i }).click();
    await expect(page).toHaveURL(/\/checkout\/confirm/);

    await page.getByRole("button", { name: /Thanh toán qua ApiPay/i }).click();
    await expect(page.locator('input[name="guestName"]')).toBeFocused();

    await page.locator('input[name="guestName"]').fill("A");
    await page.locator('input[name="guestPhone"]').fill("abc");
    await page.getByRole("button", { name: /Thanh toán qua ApiPay/i }).click();
    await expect(page).toHaveURL(/\/checkout\/confirm/);

    await page.locator('input[name="guestName"]').fill("Nguyen Test");
    await page.locator('input[name="guestPhone"]').fill("0901234567");
    await page.getByLabel(/Tôi đồng ý/i).check();
    await page.getByRole("button", { name: /Thanh toán qua ApiPay/i }).click();
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/login\?error=auth_required/);
    await expect(page.getByText(/Bạn cần đăng nhập/i)).toBeVisible();
    await assertNoBrokenUi(page, failures);
  });

  test("booking history is private and payment status route remains usable", async ({ page }) => {
    const failures = watchFailures(page);

    await page.goto(`${baseURL}/bookings`);
    await expect(page.getByRole("heading", { name: /Không có quyền truy cập/i })).toBeVisible();
    await page.goto(`${baseURL}/payment/result?status=pending`);
    await expect(page.getByText("Kết quả thanh toán", { exact: true })).toBeVisible();
    await assertNoBrokenUi(page, failures);
  });

  test("payment result handles all frontend status variants", async ({ page }) => {
    const failures = watchFailures(page);
    const cases = [
      { query: "status=paid", text: /thành công|Đã thanh toán/i },
      { query: "status=pending", text: /đang xử lý|Đang xử lý/i },
      { query: "status=failed", text: /chưa hoàn tất|Thất bại/i },
      { query: "status=expired", text: /chưa hoàn tất|hết hạn|Đã hủy/i },
      { query: "status=unpaid", text: /đang xử lý|Chưa thanh toán/i }
    ];

    for (const item of cases) {
      await page.goto(`${baseURL}/payment/result?${item.query}`);
      await expect(page.getByText("Kết quả thanh toán", { exact: true })).toBeVisible();
      await expect(page.getByText(item.text).first()).toBeVisible();
      await assertNoBrokenUi(page, failures);
    }
  });

  test("booking tabs and demo payment result expose BA labels", async ({ page }) => {
    const failures = watchFailures(page);

    await page.goto(`${baseURL}/bookings`);
    await expect(page.getByRole("heading", { name: /Không có quyền truy cập/i })).toBeVisible();

    await page.goto(`${baseURL}/payment/result?status=paid&demo=1`);
    await expect(page.getByText("Kết quả thanh toán", { exact: true })).toBeVisible();
    await expect(page.getByText(/Thanh toán demo thành công|Đã thanh toán/i).first()).toBeVisible();

    await page.goto(`${baseURL}/payment/result?status=pending&demo=1`);
    await expect(page.getByText(/Thanh toán demo đang xử lý|Đang xử lý/i).first()).toBeVisible();
    await assertNoBrokenUi(page, failures);
  });

  test("search filters do not prefill booking dates or guests", async ({ page }) => {
    const failures = watchFailures(page);

    await page.goto(`${baseURL}/homestays?guests=2&checkIn=2026-06-09&checkOut=2026-06-11`);
    await page.getByRole("link", { name: /Chi tiết|Xem chi tiết/i }).first().click();
    await expect(page).not.toHaveURL(/guests=2/);
    await expect(page).not.toHaveURL(/checkIn=2026-06-09/);
    await expect(page.getByTestId("summary-check-in-display")).toHaveText("Chưa chọn");
    await expect(page.getByTestId("summary-guests-display")).toHaveText("Chưa nhập");

    await page.getByRole("button", { name: "Chọn phòng" }).first().click();
    await page.getByTestId("summary-check-in").fill("2026-07-01");
    await page.getByTestId("summary-check-out").fill("2026-07-03");
    await page.getByTestId("summary-guests").fill("1");
    await page.getByTestId("continue-checkout").click();
    await expect(page).toHaveURL(/\/checkout\/services/);
    await expect(page).toHaveURL(/checkIn=2026-07-01/);
    await expect(page).not.toHaveURL(/checkIn=2026-06-09/);
    await assertNoBrokenUi(page, failures);
  });

  test("role protected portals consistently block unauthenticated access", async ({ page }) => {
    const failures = watchFailures(page);
    for (const route of ["/owner", "/owner/manage", "/owner/proxy-booking", "/staff", "/staff/moderation", "/admin"]) {
      await page.goto(`${baseURL}${route}`);
      await expect(page.getByText(/Không có quyền truy cập/i)).toBeVisible();
      await expect(page.getByRole("link", { name: /Đăng nhập đúng vai trò/i })).toBeVisible();
      await assertNoBrokenUi(page, failures);
    }
  });

  test("core customer journey remains usable on mobile viewport", async ({ page }) => {
    const failures = watchFailures(page);
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto(baseURL);
    await expect(page.getByRole("link", { name: /Đặt phòng ngay/i }).first()).toBeVisible();
    await page.getByRole("link", { name: /Đặt phòng ngay/i }).first().click();
    await page.locator('input[name="guests"]').fill("2");
    await page.getByRole("button", { name: /^Áp dụng$/i }).first().click();
    await expect(page.getByRole("link", { name: /Chi tiết|Xem chi tiết/i }).first()).toBeVisible();
    await page.getByRole("link", { name: /Chi tiết|Xem chi tiết/i }).first().click();
    await expect(page.getByRole("link", { name: /Chọn phòng/i })).toBeVisible();
    await assertNoBrokenUi(page, failures);
  });
});
