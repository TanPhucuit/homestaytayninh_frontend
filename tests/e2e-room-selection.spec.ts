import { expect, Locator, Page, test } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL ?? "https://homestaytayninh-frontend.vercel.app";

function parseVnd(text: string) {
  return Number(text.replace(/[^\d]/g, ""));
}

async function openFirstDetail(page: Page) {
  await page.goto(`${baseURL}/homestays?checkIn=2026-06-12&checkOut=2026-06-14&guests=3`);
  await page.getByRole("link", { name: /Xem chi tiết/i }).first().click();
  await expect(page.getByTestId("continue-checkout")).toBeVisible();
}

async function summaryTotal(page: Page, testId: string) {
  return parseVnd(await page.getByTestId(testId).innerText());
}

async function selectRoom(roomCards: Locator, index: number) {
  await roomCards.nth(index).getByRole("button", { name: "Chọn phòng" }).click();
}

test.describe("multi-select room summary", () => {
  test("không chọn phòng thì không được tiếp tục", async ({ page }) => {
    await openFirstDetail(page);
    await expect(page.getByTestId("selected-empty")).toBeVisible();
    await expect(page.getByTestId("summary-grand-total")).toContainText("0");
    await expect(page.getByTestId("continue-checkout")).toBeDisabled();
  });

  test("chọn 1 phòng cập nhật summary và đi bước dịch vụ với roomIds", async ({ page }) => {
    await openFirstDetail(page);
    const roomCards = page.locator('[data-testid^="room-card-"]');
    await selectRoom(roomCards, 0);

    await expect(page.getByTestId("selected-room-row")).toHaveCount(1);
    await expect(page.getByTestId("summary-nights")).toHaveText("2");
    expect(await summaryTotal(page, "summary-room-total")).toBeGreaterThan(0);

    await page.getByTestId("continue-checkout").click();
    await expect(page).toHaveURL(/\/checkout\/services/);
    await expect(page).toHaveURL(/roomIds=/);
    await expect(page).toHaveURL(/checkIn=2026-06-12/);
    await expect(page).toHaveURL(/checkOut=2026-06-14/);
    await expect(page).toHaveURL(/guests=3/);
  });

  test("chọn 2 phòng, bỏ chọn 1 phòng và đổi ngày cập nhật tổng tiền", async ({ page }) => {
    await openFirstDetail(page);
    const roomCards = page.locator('[data-testid^="room-card-"]');
    test.skip(await roomCards.count() < 2, "Homestay hiện tại chỉ có một phòng để kiểm tra.");

    await selectRoom(roomCards, 0);
    const oneRoomTotal = await summaryTotal(page, "summary-room-total");
    await selectRoom(roomCards, 1);
    await expect(page.getByTestId("selected-room-row")).toHaveCount(2);
    expect(await summaryTotal(page, "summary-room-total")).toBeGreaterThan(oneRoomTotal);

    await page.getByTestId("continue-checkout").click();
    await expect(page).toHaveURL(/\/checkout\/services/);
    await expect(page).toHaveURL(/roomIds=.*%2C|roomIds=.*,/);
    await page.goBack();
    await expect(page.getByTestId("selected-room-row")).toHaveCount(2);

    await roomCards.nth(0).getByRole("button", { name: "Bỏ chọn" }).click();
    await expect(page.getByTestId("selected-room-row")).toHaveCount(1);
    const remainingTotal = await summaryTotal(page, "summary-room-total");
    expect(remainingTotal).toBeLessThan(await summaryTotal(page, "summary-grand-total"));

    await page.getByTestId("summary-check-out").fill("2026-06-15");
    await expect(page.getByTestId("summary-nights")).toHaveText("3");
    expect(await summaryTotal(page, "summary-room-total")).toBeGreaterThan(remainingTotal);
  });

  test("dịch vụ theo từng phòng cập nhật tổng và vẫn cho bỏ qua dịch vụ", async ({ page }) => {
    await openFirstDetail(page);
    const roomCards = page.locator('[data-testid^="room-card-"]');
    await selectRoom(roomCards, 0);
    if (await roomCards.count() > 1) {
      await selectRoom(roomCards, 1);
    }
    await page.getByTestId("continue-checkout").click();
    await expect(page).toHaveURL(/\/checkout\/services/);

    const serviceCards = page.locator('[data-testid^="service-card-"]');
    if (await serviceCards.count()) {
      const initialServiceTotal = await summaryTotal(page, "services-service-total");
      await serviceCards.first().getByRole("button", { name: "Thêm" }).click();
      expect(await summaryTotal(page, "services-service-total")).toBeGreaterThan(initialServiceTotal);
      await expect(page.getByTestId("selected-service-row")).toHaveCount(1);
      await serviceCards.first().getByRole("button", { name: "Bỏ chọn" }).click();
      await expect(page.getByTestId("services-service-total")).toContainText("0");
    }

    await page.getByRole("button", { name: "Tiếp tục xác nhận" }).click();
    await expect(page).toHaveURL(/\/checkout\/confirm/);
    await expect(page).toHaveURL(/roomIds=/);
    await expect(page.getByRole("heading", { name: "Xác nhận đặt phòng" })).toBeVisible();
  });
});
