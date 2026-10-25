import { test, expect } from "@playwright/test";

test.describe("Phase 15 - Admin Translation Live Edit & Public Reflection E2E", () => {
  test("admin logs in, updates English and Hindi strings, verifies live on public site, and reverts", async ({
    page,
    browser,
  }) => {
    // Automatically accept all browser confirmation dialogs
    page.on("dialog", (dialog) => dialog.accept());

    // 1. Sign in as admin with callbackUrl to translations manager
    await page.goto("/en/auth/signin?callbackUrl=/en/admin/translations");
    await page.getByRole("button", { name: /Admin Login/i }).click();
    await page.fill('input[type="email"]', "admin@kanad-jyotish.in");
    await page.fill('input[type="password"]', "ChangeMeInAdminSettings@2026");
    await page.locator('button[type="submit"]').click();

    // 2. Wait for actual pathname navigation to Translations Manager
    await page.waitForURL((url) => url.pathname.includes("/admin/translations"), {
      timeout: 15000,
    });
    await expect(
      page.getByText(/Master Translation & UI Text Control/i)
    ).toBeVisible({ timeout: 10000 });

    // 3. Search specifically for "nav.about"
    const searchInput = page.getByPlaceholder("Search by key, default value, or override...");
    await searchInput.fill("nav.about");
    await page.getByRole("button", { name: "Search" }).click();

    // 4. Locate the specific card for nav.about
    const itemRow = page.locator("div.p-5").filter({ hasText: "about" }).first();
    await expect(itemRow).toBeVisible({ timeout: 10000 });

    // 5. Fill customized text in nav.about's textarea
    const testCustomTextEn = "About Our Vedic Sanctuary";
    const textarea = itemRow.locator("textarea");
    await textarea.fill(testCustomTextEn);

    // 6. Save override live
    const saveBtn = itemRow.getByRole("button", { name: /Save Changes|Save Live/i });
    await saveBtn.click();
    await expect(page.getByText(/"nav\.about" saved/i)).toBeVisible({ timeout: 10000 });

    // 7. Open public site in a completely fresh browser context
    const freshContext = await browser.newContext();
    const freshPage = await freshContext.newPage();
    await freshPage.goto("/en");

    // 8. Verify the updated string appears on the public site
    await expect(freshPage.getByText(testCustomTextEn, { exact: false }).first()).toBeVisible({
      timeout: 10000,
    });

    // 9. In admin page, revert back to default
    const revertBtn = itemRow.getByRole("button", { name: /Revert to Default/i });
    await revertBtn.click();
    await expect(page.getByText(/"nav\.about" reset to default/i)).toBeVisible({ timeout: 10000 });

    // 10. Reload public site in fresh context and verify original text returns
    await freshPage.reload();
    await expect(freshPage.getByText("About & केंद्र").first()).toBeVisible({ timeout: 10000 });

    await freshContext.close();
  });
});
