import { expect, test } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL ?? "https://homestaytayninh-frontend.vercel.app";
test.setTimeout(60000);

test.describe("Homestay Tây Ninh production smoke", () => {
  test("landing navigation and login CTA are usable", async ({ page }) => {
    await page.goto(baseURL);
    await expect(page.getByRole("link", { name: "Đăng nhập" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Đặt phòng ngay" }).first()).toBeVisible();
    await page.getByRole("link", { name: "Đặt phòng ngay" }).first().click();
    await expect(page).toHaveURL(/\/homestays/);
    await expect(page.getByRole("heading", { name: /Tìm thấy/i })).toBeVisible();
  });

  test("Google login entry uses custom OAuth", async ({ page }) => {
    await page.goto(`${baseURL}/login`);
    await expect(page.getByRole("link", { name: /Google/ })).toBeVisible();
    await page.getByRole("link", { name: /Google/ }).click();
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/Unsupported provider|provider is not enabled/)).toHaveCount(0);
  });

  test("customer search, detail and checkout steps are usable", async ({ page }) => {
    await page.goto(`${baseURL}/homestays`);
    await page.locator('input[name="guests"]').fill("2");
    await page.getByRole("button", { name: "Áp dụng bộ lọc" }).click();
    await expect(page.getByRole("link", { name: "Xem chi tiết" }).first()).toBeVisible();
    await page.getByRole("link", { name: "Xem chi tiết" }).first().click();
    await expect(page.getByRole("link", { name: "Tiếp tục đặt phòng" })).toBeVisible();
    await page.getByRole("link", { name: "Tiếp tục đặt phòng" }).click();
    await expect(page.getByRole("heading", { name: "Hoàn tất đặt phòng" })).toBeVisible();
    await page.getByPlaceholder("Nguyễn Văn A").fill("Nguyễn Test");
    await page.getByPlaceholder("0901234567").fill("0901234567");
    await page.getByRole("button", { name: "Tiếp tục chọn dịch vụ" }).click();
    await expect(page).toHaveURL(/\/checkout\/services/);
    await page.getByRole("button", { name: "Tiếp tục xác nhận" }).click();
    await expect(page.getByRole("heading", { name: "Xác nhận đặt phòng" })).toBeVisible();
  });

  test("private booking history is guarded and public payment result renders", async ({ page }) => {
    await page.goto(`${baseURL}/bookings`);
    await expect(page.getByRole("heading", { name: "Không có quyền truy cập" })).toBeVisible();
    await page.goto(`${baseURL}/payment/result?status=pending`);
    await expect(page.getByText("Kết quả thanh toán")).toBeVisible();
  });

  test("owner, staff and admin portals render controlled states", async ({ page }) => {
    for (const path of ["/owner", "/owner/manage", "/staff", "/staff/moderation", "/admin"]) {
      await page.goto(`${baseURL}${path}`);
      await expect(page.getByText("Không tải được")).toHaveCount(0);
      await expect(page.locator("body")).not.toBeEmpty();
    }
  });
});
