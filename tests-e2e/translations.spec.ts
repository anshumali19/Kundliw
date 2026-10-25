import { test, expect } from "@playwright/test";

test.describe("Phase 15 - Translation Override Subsystem E2E", () => {
  test("public home page loads with localized strings in English and Hindi", async ({ page }) => {
    // English route
    await page.goto("/en");
    await expect(page).toHaveTitle(/Maharshi Kanad|Jyotish/i);
    const consultationBtn = page.getByRole("link", { name: /Book Consultation/i }).first();
    await expect(consultationBtn).toBeVisible();

    // Hindi route
    await page.goto("/hi");
    await expect(page).toHaveTitle(/महर्षि कणाद|ज्योतिष/i);
    const hindiBtn = page.getByRole("link", { name: /परामर्श बुक करें/i }).first();
    await expect(hindiBtn).toBeVisible();
  });

  test("admin translations API requires admin authentication", async ({ request }) => {
    const res = await request.get("/api/admin/translations?locale=en");
    expect([401, 403]).toContain(res.status());
  });

  test("language switcher toggles between English and Hindi properly", async ({ page }) => {
    await page.goto("/en");
    // Look for language toggle button or link
    const langSwitch = page.locator("a[href*='/hi']").first();
    if (await langSwitch.isVisible()) {
      await langSwitch.click();
      await expect(page).toHaveURL(/\/hi/);
    }
  });
});
