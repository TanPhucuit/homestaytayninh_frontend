import { expect, test } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL ?? "https://homestaytayninh-frontend.vercel.app";

test.describe("Homestay Tay Ninh production smoke", () => {
  test("landing navigation and login CTA are usable", async ({ page }) => {
    await page.goto(baseURL);
    await expect(page.getByRole("link", { name: "ÄÄƒng nháº­p" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Äáº·t phÃ²ng ngay" })).toBeVisible();
    await page.getByRole("link", { name: "Äáº·t phÃ²ng ngay" }).click();
    await expect(page).toHaveURL(/\/homestays/);
    await expect(page.getByRole("heading", { name: /TÃ¬m homestay/i })).toBeVisible();
  });

  test("Google login entry uses custom OAuth", async ({ page }) => {
    await page.goto(`${baseURL}/login`);
    await expect(page.getByRole("link", { name: /Google/ })).toBeVisible();
    await page.getByRole("link", { name: /Google/ }).click();
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/Unsupported provider|provider is not enabled/)).toHaveCount(0);
  });

  test("customer search, detail and checkout form are usable", async ({ page }) => {
    await page.goto(`${baseURL}/homestays`);
    await page.getByPlaceholder("Sá»‘ khÃ¡ch").fill("2");
    await page.getByRole("button", { name: "TÃ¬m kiáº¿m" }).click();
    await expect(page.getByRole("link", { name: "Xem chi tiáº¿t" }).first()).toBeVisible();
    await page.getByRole("link", { name: "Xem chi tiáº¿t" }).first().click();
    await expect(page.getByRole("link", { name: "Tiáº¿p tá»¥c Ä‘áº·t phÃ²ng" })).toBeVisible();
    await page.getByRole("link", { name: "Tiáº¿p tá»¥c Ä‘áº·t phÃ²ng" }).click();
    await expect(page.getByRole("heading", { name: "Äáº·t phÃ²ng & thanh toÃ¡n" })).toBeVisible();
    await page.getByPlaceholder("Há» tÃªn").fill("Nguyá»…n Test");
    await page.getByPlaceholder("Sá»‘ Ä‘iá»‡n thoáº¡i").fill("0901234567");
    await expect(page.getByRole("button", { name: "XÃ¡c nháº­n & Thanh toÃ¡n" })).toBeEnabled();
  });

  test("private booking history is guarded and public payment result renders", async ({ page }) => {
    await page.goto(`${baseURL}/bookings`);
    await expect(page.getByRole("heading", { name: "KhÃ´ng cÃ³ quyá»n truy cáº­p" })).toBeVisible();
    await page.goto(`${baseURL}/payment/result?status=pending`);
    await expect(page.getByRole("heading", { name: "Káº¿t quáº£ thanh toÃ¡n" })).toBeVisible();
  });

  test("owner, staff and admin portals render controlled states", async ({ page }) => {
    for (const path of ["/owner", "/owner/manage", "/staff", "/staff/moderation", "/admin"]) {
      await page.goto(`${baseURL}${path}`);
      await expect(page.getByText("KhÃ´ng táº£i Ä‘Æ°á»£c")).toHaveCount(0);
      await expect(page.locator("body")).not.toBeEmpty();
    }
  });
});
