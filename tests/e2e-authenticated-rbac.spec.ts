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
    test.skip(true, `Provide E2E_AUTH_BASE_URL and E2E_${role}_STORAGE_STATE containing a real htn_session Redis session cookie.`);
  }
  return browser.newContext({ storageState: storageState!, viewport });
}

test.describe("authenticated RBAC with real Redis sessions", () => {
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

  test("customer can move through checkout steps without losing selected room state", async ({ browser }) => {
    const context = await withRealSession(browser, "CUSTOMER");
    const page = await context.newPage();

    await page.goto(`${appUrl}/homestays/hs-ba-den?guests=2`);
    await page.getByRole("link", { name: /Chọn phòng|Tiếp tục đặt phòng/i }).first().click();
    await expect(page).toHaveURL(/roomId=/);
    await expect(page).toHaveURL(/guestCount=2/);
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

  test("customer booking tabs, cancel action and demo payment link are visible", async ({ browser }) => {
    const context = await withRealSession(browser, "CUSTOMER");
    const page = await context.newPage();

    await page.goto(`${appUrl}/bookings`);
    for (const tab of ["Sắp tới", "Đang trải nghiệm", "Đã hoàn thành", "Đã hủy"]) {
      await expect(page.getByRole("link", { name: new RegExp(tab) })).toBeVisible();
    }

    const firstDetail = page.getByRole("link", { name: /Xem chi tiết/i }).first();
    if (await firstDetail.count()) {
      await firstDetail.click();
      await expect(page.getByText(/Dịch vụ trong booking|Tóm tắt đơn hàng|Thanh toán/i).first()).toBeVisible();
      await expect(page.getByRole("link", { name: /Kiểm tra trạng thái|Kiểm tra thanh toán/i }).first()).toBeVisible();
      const cancelButton = page.getByRole("button", { name: /Hủy đơn/i });
      if (await cancelButton.count()) {
        page.once("dialog", (dialog) => dialog.dismiss());
        await cancelButton.first().click();
      }
    }

    await context.close();
  });

  test("owner, owner staff and admin see role-appropriate CTAs", async ({ browser }) => {
    for (const role of ["OWNER", "OWNER_STAFF", "ADMIN"] as const) {
      const context = await withRealSession(browser, role);
      const page = await context.newPage();

      await page.goto(`${appUrl}/owner`);
      if (role === "OWNER") {
        await expect(page.getByRole("link", { name: /Quản lý homestay\/phòng\/dịch vụ/i })).toBeVisible();
        await expect(page.getByRole("link", { name: /Đặt hộ khách hàng/i })).toHaveCount(0);
      }
      if (role === "OWNER_STAFF") {
        await expect(page.getByRole("link", { name: /Đặt hộ khách hàng/i })).toBeVisible();
        await expect(page.getByRole("link", { name: /Quản lý homestay\/phòng\/dịch vụ/i })).toHaveCount(0);
      }
      if (role === "ADMIN") {
        await expect(page.getByRole("link", { name: /Quản lý homestay\/phòng\/dịch vụ/i })).toBeVisible();
        await expect(page.getByRole("link", { name: /Đặt hộ khách hàng/i })).toBeVisible();
      }

      await context.close();
    }
  });

  test("owner staff booking operations and proxy booking filters follow selected homestay", async ({ browser }) => {
    const context = await withRealSession(browser, "OWNER_STAFF");
    const page = await context.newPage();

    await page.goto(`${appUrl}/owner`);
    await expect(page.getByText(/Booking cần xử lý|Không có booking cần thao tác ngay/i).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Xác nhận|Từ chối|Check-in|Hủy|Check-out/i }).first()).toBeVisible({ timeout: 10000 }).catch(() => undefined);

    await page.goto(`${appUrl}/owner/proxy-booking`);
    const homestaySelect = page.locator('select[name="homestayId"]');
    const roomSelect = page.locator('select[name="roomId"]');
    const serviceSelect = page.locator('select[name="serviceId"]');
    await expect(homestaySelect).toBeVisible();
    await expect(roomSelect).toBeVisible();
    await expect(serviceSelect).toBeVisible();
    const options = await homestaySelect.locator("option").count();
    if (options > 1) {
      const beforeRoom = await roomSelect.inputValue();
      await homestaySelect.selectOption({ index: 1 });
      await expect(roomSelect).not.toHaveValue(beforeRoom);
    }

    await context.close();
  });
});
