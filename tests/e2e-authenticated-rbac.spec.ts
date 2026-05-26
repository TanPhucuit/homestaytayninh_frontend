import { Browser, expect, test } from "@playwright/test";

type AuthenticatedRole = "ADMIN" | "STAFF" | "OWNER" | "OWNER_STAFF" | "CUSTOMER";

const appUrl = process.env.E2E_AUTH_BASE_URL?.replace(/\/$/, "");
const states: Record<AuthenticatedRole, string | undefined> = {
  ADMIN: process.env.E2E_ADMIN_STORAGE_STATE,
  STAFF: process.env.E2E_STAFF_STORAGE_STATE,
  OWNER: process.env.E2E_OWNER_STORAGE_STATE,
  OWNER_STAFF: process.env.E2E_OWNER_STAFF_STORAGE_STATE,
  CUSTOMER: process.env.E2E_CUSTOMER_STORAGE_STATE
};

async function withRealSession(browser: Browser, role: AuthenticatedRole, viewport?: { width: number; height: number }) {
  const storageState = states[role];
  if (!appUrl || !storageState) {
    test.skip(true, `Provide E2E_AUTH_BASE_URL and E2E_${role}_STORAGE_STATE from a real Supabase test login.`);
  }
  return browser.newContext({ storageState: storageState!, viewport });
}

test.describe("authenticated RBAC with real Supabase sessions", () => {
  test("admin header replaces login and keeps the session across portal navigation", async ({ browser }) => {
    const context = await withRealSession(browser, "ADMIN");
    const page = await context.newPage();

    await page.goto(`${appUrl}/`);
    await expect(page.getByText(/ADMIN ·/)).toBeVisible();
    await expect(page.getByRole("link", { name: "Đăng xuất" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Đăng nhập" })).toHaveCount(0);

    for (const path of ["/homestays", "/admin", "/owner", "/staff"]) {
      await page.goto(`${appUrl}${path}`);
      await expect(page.getByText(/ADMIN ·/)).toBeVisible();
      await expect(page.getByRole("link", { name: "Đăng xuất" })).toBeVisible();
      await expect(page.getByRole("heading", { name: /Không có quyền truy cập/i })).toHaveCount(0);
    }

    await context.close();
  });

  for (const testCase of [
    { role: "STAFF" as const, home: "/staff", menu: /Quản lý nội dung/i, denied: "/admin" },
    { role: "OWNER" as const, home: "/owner", menu: /Dashboard chủ nhà/i, denied: "/staff" },
    { role: "OWNER_STAFF" as const, home: "/owner", menu: /Booking vận hành/i, denied: "/owner/manage" },
    { role: "CUSTOMER" as const, home: "/homestays", menu: /Chuyến đi của tôi/i, denied: "/admin" }
  ]) {
    test(`${testCase.role} sees its menu and is denied outside its scope`, async ({ browser }) => {
      const context = await withRealSession(browser, testCase.role);
      const page = await context.newPage();

      await page.goto(`${appUrl}${testCase.home}`);
      await expect(page.getByText(new RegExp(`${testCase.role} ·`))).toBeVisible();
      await expect(page.getByRole("link", { name: testCase.menu })).toBeVisible();
      await expect(page.getByRole("link", { name: "Đăng xuất" })).toBeVisible();

      await page.goto(`${appUrl}${testCase.denied}`);
      await expect(page.getByRole("heading", { name: /Không có quyền truy cập/i })).toBeVisible();
      await expect(page.getByText(new RegExp(`${testCase.role} ·`))).toBeVisible();

      await context.close();
    });
  }

  test("authenticated admin header remains usable on mobile", async ({ browser }) => {
    const context = await withRealSession(browser, "ADMIN", { width: 390, height: 844 });
    const page = await context.newPage();

    await page.goto(`${appUrl}/admin`);
    await expect(page.getByRole("link", { name: "Đăng xuất" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Đăng nhập" })).toHaveCount(0);
    await expect(page.getByText(/Tổng quan|Dashboard|Admin/i).first()).toBeVisible();

    await context.close();
  });

  test("customer can move through the real checkout steps without losing selected room state", async ({ browser }) => {
    const context = await withRealSession(browser, "CUSTOMER");
    const page = await context.newPage();

    await page.goto(`${appUrl}/homestays/hs-ba-den`);
    await page.getByRole("link", { name: /Chọn phòng|Tiếp tục đặt phòng/i }).first().click();
    await expect(page).toHaveURL(/roomId=/);
    await page.getByPlaceholder("Nguyễn Văn A").fill("Khách E2E");
    await page.getByPlaceholder("0901234567").fill("0901234567");
    await page.getByRole("button", { name: /Tiếp tục chọn dịch vụ/i }).click();
    await expect(page).toHaveURL(/\/checkout\/services/);
    await page.locator('input[name^="service:"]').first().fill("1");
    await page.getByRole("button", { name: /Tiếp tục xác nhận/i }).click();
    await expect(page).toHaveURL(/\/checkout\/confirm/);
    await expect(page.getByText(/Khách E2E/)).toBeVisible();

    await context.close();
  });
});
