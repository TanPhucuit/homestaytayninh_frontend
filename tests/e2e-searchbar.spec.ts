import { expect, test } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL ?? "https://homestaytayninh-frontend.vercel.app";

test.describe("SearchBar filters", () => {
  test("home search redirects with repeated query params", async ({ page }) => {
    await page.goto(baseURL);

    await page.getByLabel(/Ngày nhận - trả/i).first().fill("12/06/2026 - 14/06/2026");
    await page.getByLabel(/Số khách/i).first().fill("3");
    await page.getByRole("button", { name: /Bộ lọc/i }).first().click();
    await page.getByLabel("Lều Glamping").check();
    await page.getByLabel("Wifi miễn phí").check();
    await page.locator(".price-slider").first().evaluate((element) => {
      const input = element as HTMLInputElement;
      input.value = "2000000";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await page.getByRole("button", { name: /Tìm kiếm/i }).click();

    await expect(page).toHaveURL(/\/homestays/);
    await expect(page).toHaveURL(/checkIn=2026-06-12/);
    await expect(page).toHaveURL(/checkOut=2026-06-14/);
    await expect(page).toHaveURL(/guests=3/);
    await expect(page).toHaveURL(/type=L%E1%BB%81u\+Glamping/);
    await expect(page).toHaveURL(/amenities=Wifi\+mi%E1%BB%85n\+ph%C3%AD/);
    await expect(page).toHaveURL(/price=2000000/);
  });

  test("result page preserves selected filters and pagination query", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${baseURL}/homestays?checkIn=2026-06-12&checkOut=2026-06-14&guests=3&type=Ph%C3%B2ng&type=L%E1%BB%81u+Glamping&amenities=Wifi+mi%E1%BB%85n+ph%C3%AD&price=2000000`);

    await expect(page.getByLabel("Phòng").first()).toBeChecked();
    await expect(page.getByLabel("Lều Glamping").first()).toBeChecked();
    await expect(page.getByLabel("Wifi miễn phí").first()).toBeChecked();
    await expect(page.getByText("3 khách").first()).toBeVisible();

    const detail = page.getByRole("link", { name: /Xem chi tiết/i }).first();
    if (await detail.count()) {
      await expect(detail).toHaveAttribute("href", /checkIn=2026-06-12/);
      await expect(detail).toHaveAttribute("href", /guests=3/);
    }

    const pageTwo = page.getByRole("link", { name: "2" }).first();
    if (await pageTwo.count()) {
      await expect(pageTwo).toHaveAttribute("href", /type=Ph%C3%B2ng/);
      await expect(pageTwo).toHaveAttribute("href", /amenities=Wifi\+mi%E1%BB%85n\+ph%C3%AD/);
    }
  });
});
