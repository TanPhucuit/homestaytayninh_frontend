import { expect, test } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL ?? "https://homestaytayninh-frontend.vercel.app";

test.describe("Homestay Tay Ninh production smoke", () => {
  test("landing navigation and login CTA are usable", async ({ page }) => {
    await page.goto(baseURL);
    await expect(page.getByRole("link", { name: "Đăng nhập" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Đặt phòng ngay" })).toBeVisible();
    await page.getByRole("link", { name: "Đặt phòng ngay" }).click();
    await expect(page).toHaveURL(/\/homestays/);
    await expect(page.getByRole("heading", { name: /Tìm homestay/i })).toBeVisible();
  });

  test("Google login entry does not fail with Supabase env error", async ({ page }) => {
    await page.goto(`${baseURL}/login`);
    await expect(page.getByRole("link", { name: /Google/ })).toBeVisible();
    await page.getByRole("link", { name: /Google/ }).click();
    await page.waitForLoadState("networkidle");
    await expect(page).not.toHaveURL(/error=supabase_env/);
    await expect(page).not.toHaveURL(/supabase\.co\/auth\/v1\/authorize/);
    await expect(page.getByText(/Unsupported provider|provider is not enabled/)).toHaveCount(0);
  });

  test("customer search, detail and checkout form are usable", async ({ page }) => {
    await page.goto(`${baseURL}/homestays`);
    await page.getByPlaceholder("Số khách").fill("2");
    await page.getByRole("button", { name: "Tìm kiếm" }).click();
    await expect(page.getByRole("link", { name: "Xem chi tiết" }).first()).toBeVisible();
    await page.getByRole("link", { name: "Xem chi tiết" }).first().click();
    await expect(page.getByRole("link", { name: "Tiếp tục đặt phòng" })).toBeVisible();
    await page.getByRole("link", { name: "Tiếp tục đặt phòng" }).click();
    await expect(page.getByRole("heading", { name: "Đặt phòng & thanh toán" })).toBeVisible();
    await page.getByPlaceholder("Họ tên").fill("Nguyễn Test");
    await page.getByPlaceholder("Số điện thoại").fill("0901234567");
    await expect(page.getByRole("button", { name: "Xác nhận & Thanh toán" })).toBeEnabled();
  });

  test("booking history and payment result render without route error", async ({ page }) => {
    await page.goto(`${baseURL}/bookings`);
    await expect(page.getByRole("heading", { name: "Quản lý đặt phòng của tôi" })).toBeVisible();
    await expect(page.getByText("Không tải được")).toHaveCount(0);
    await page.goto(`${baseURL}/payment/result?bookingId=bk-demo-1`);
    await expect(page.getByRole("heading", { name: "Kết quả thanh toán" })).toBeVisible();
  });

  test("owner, staff and admin portals render controlled states", async ({ page }) => {
    for (const path of ["/owner", "/owner/manage", "/staff", "/staff/moderation", "/admin"]) {
      await page.goto(`${baseURL}${path}`);
      await expect(page.getByText("Không tải được")).toHaveCount(0);
      await expect(page.locator("body")).not.toBeEmpty();
    }
  });
});
