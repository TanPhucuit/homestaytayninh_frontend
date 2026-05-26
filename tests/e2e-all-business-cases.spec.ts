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
    if (url.includes("supabase.co/auth/v1/authorize") && status >= 400) failures.push(`supabase oauth ${status}: ${url}`);
  });

  return failures;
}

async function assertNoBrokenUi(page: Page, failures: string[]) {
  await expect(page.locator("body")).not.toBeEmpty();
  await expect(page.getByText(/Application error|INTERNAL_SERVER_ERROR|MIDDLEWARE_INVOCATION_FAILED/i)).toHaveCount(0);
  await expect(page.getByText(/Unsupported provider|provider is not enabled/i)).toHaveCount(0);
  await expect(page.getByText(/Không tải được|gặp lỗi runtime|Checkout gặp lỗi|Trang gặp lỗi/i)).toHaveCount(0);
  expect(failures.filter((failure) => !failure.includes("supabase oauth"))).toEqual([]);
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
      "/bookings/bk-demo-1",
      "/payment/result?status=paid",
      "/payment/result?status=failed",
      "/payment/result?status=expired",
      "/payment/result?bookingId=bk-demo-1",
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
    await expect(page.getByRole("heading", { name: /Tìm homestay/i })).toBeVisible();

    await page.locator('input[name="guests"]').fill("2");
    await page.locator('select[name="type"]').selectOption("Phòng");
    await page.locator('input[name="maxPrice"]').fill("800000");
    await page.getByRole("button", { name: /Tìm kiếm/i }).click();
    await expect(page).toHaveURL(/type=/);
    await expect(page.getByRole("link", { name: /Xem chi tiết/i }).first()).toBeVisible();
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

  test("homestay details expose rooms services and checkout entry for each listing", async ({ page }) => {
    const failures = watchFailures(page);

    for (const id of ["hs-ba-den", "hs-trang-bang"]) {
      await page.goto(`${baseURL}/homestays/${id}`);
      await expect(page.getByRole("link", { name: /Tiếp tục đặt phòng/i })).toBeVisible();
      await expect(page.getByText(/Phòng khả dụng/i)).toBeVisible();
      await expect(page.getByText(/Dịch vụ có thể đặt thêm/i)).toBeVisible();
      await page.getByRole("link", { name: /Tiếp tục đặt phòng/i }).click();
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
    await expect(page.getByText(/Bạn cần đăng nhập/i)).toBeVisible();
    await assertNoBrokenUi(page, failures);
  });

  test("booking history groups and every visible detail/payment link works", async ({ page }) => {
    const failures = watchFailures(page);

    await page.goto(`${baseURL}/bookings`);
    for (const label of ["Sắp tới", "Đang trải nghiệm", "Đã hoàn thành", "Đã hủy"]) {
      await expect(page.getByText(label).first()).toBeVisible();
    }

    const detailHrefs = await page.locator('a:has-text("Xem chi tiết")').evaluateAll((links) =>
      links.map((link) => (link as HTMLAnchorElement).href)
    );
    expect(detailHrefs.length).toBeGreaterThan(0);

    for (const href of detailHrefs.slice(0, 5)) {
      await page.goto(href);
      await expect(page.getByText(/Dịch vụ trong booking/i)).toBeVisible();
      await expect(page.getByText(/Tóm tắt đơn hàng|Tổng hóa đơn/i).first()).toBeVisible();
      await expect(page.getByRole("link", { name: /Kiểm tra trạng thái|Xem homestay/i }).first()).toBeVisible();
      await assertNoBrokenUi(page, failures);
    }

    await page.goto(`${baseURL}/bookings`);
    const paymentHrefs = await page.locator('a:has-text("Kiểm tra thanh toán")').evaluateAll((links) =>
      links.map((link) => (link as HTMLAnchorElement).href)
    );
    for (const href of paymentHrefs.slice(0, 3)) {
      await page.goto(href);
      await expect(page.getByRole("heading", { name: /Kết quả thanh toán/i })).toBeVisible();
      await assertNoBrokenUi(page, failures);
    }
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
      await expect(page.getByRole("heading", { name: /Kết quả thanh toán/i })).toBeVisible();
      await expect(page.getByText(item.text).first()).toBeVisible();
      await assertNoBrokenUi(page, failures);
    }
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
    await expect(page.getByRole("link", { name: /Đặt phòng ngay/i })).toBeVisible();
    await page.getByRole("link", { name: /Đặt phòng ngay/i }).click();
    await page.locator('input[name="guests"]').fill("2");
    await page.getByRole("button", { name: /Tìm kiếm/i }).click();
    await expect(page.getByRole("link", { name: /Xem chi tiết/i }).first()).toBeVisible();
    await page.getByRole("link", { name: /Xem chi tiết/i }).first().click();
    await expect(page.getByRole("link", { name: /Tiếp tục đặt phòng/i })).toBeVisible();
    await assertNoBrokenUi(page, failures);
  });
});
