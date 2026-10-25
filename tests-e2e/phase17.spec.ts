import { test, expect } from "@playwright/test";

test.describe("Phase 17 - Founder Page, FAQ System, Legal CMS & Gallery Enhancements", () => {
  test("public Founder page loads with Pt. Radheshyam Shastri details, canonical pillars, and booking link", async ({
    page,
  }) => {
    // 1. English Founder Page
    await page.goto("/en/founder");
    await expect(page).toHaveTitle(/Founder Lineage/i);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Pt\. Radheshyam Shastri/i);
    await expect(page.getByText(/Founder, Senior Daivajna/i).first()).toBeVisible();
    await expect(page.getByText(/Surya Siddhanta/i).first()).toBeVisible();
    await expect(page.getByText(/Book Direct Consultation/i).first()).toBeVisible();

    // 2. Hindi Founder Page
    await page.goto("/hi/founder");
    await expect(page).toHaveTitle(/संस्थापक एवं दैवज्ञ परंपरा/i);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/पं\. राधेश्याम शास्त्री/i);
    await expect(page.getByText(/संस्थापक, वरिष्ठ दैवज्ञ/i).first()).toBeVisible();
    await expect(page.getByText(/सूर्य सिद्धान्त/i).first()).toBeVisible();
  });

  test("public FAQ page renders categorized questions, accordion expansion, and search filter", async ({
    page,
  }) => {
    await page.goto("/en/faq");
    await expect(page).toHaveTitle(/Frequently Asked Questions/i);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Frequently Asked Questions/i);

    // Verify presence of category buttons
    await expect(page.getByRole("button", { name: /Kundli/i }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Puja/i }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Dakshina/i }).first()).toBeVisible();

    // Verify first question accordion is open or can be toggled
    const firstAccordionBtn = page.locator("button[aria-expanded]").first();
    await expect(firstAccordionBtn).toBeVisible();

    // Test search filter
    const searchInput = page.getByPlaceholder(/Search questions/i);
    await searchInput.fill("Kundli");
    await expect(page.getByText(/How are Kundlis prepared/i).first()).toBeVisible();
  });

  test("public legal and informational pages (privacy, terms, refund, about, help) render valid content", async ({
    page,
  }) => {
    // 1. About Us
    await page.goto("/en/about");
    await expect(page).toHaveTitle(/About Us/i);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // 2. Help Portal
    await page.goto("/en/help");
    await expect(page).toHaveTitle(/Help & Customer Support/i);
    await expect(page.getByText(/Help & Guidance Portal/i).first()).toBeVisible();

    // 3. Privacy Policy
    await page.goto("/en/legal/privacy");
    await expect(page).toHaveTitle(/Privacy/i);
    await expect(page.getByText(/confidential/i).first()).toBeVisible();

    // 4. Terms of Service
    await page.goto("/en/legal/terms");
    await expect(page).toHaveTitle(/Terms/i);
    await expect(page.getByText(/Astrological/i).first()).toBeVisible();

    // 5. Ephemeris Sources
    await page.goto("/en/legal/ephemeris-sources");
    await expect(page).toHaveTitle(/Ephemeris/i);
    await expect(page.getByText(/Positional Astronomy Centre/i).first()).toBeVisible();
  });

  test("public Media Gallery displays photographs, videos, and external links (#11)", async ({
    page,
  }) => {
    await page.goto("/en/gallery");
    await expect(page).toHaveTitle(/Sanctum Gallery/i);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Sanctum/i);

    // Verify at least one gallery item or video card is rendered
    const galleryCard = page.locator("div.rounded-2xl").first();
    await expect(galleryCard).toBeVisible();
  });

  test("admin FAQ and Founder manager pages load for authenticated administrator", async ({
    page,
  }) => {
    // Automatically accept browser confirmation dialogs
    page.on("dialog", (dialog) => dialog.accept());

    // 1. Sign in as admin
    await page.goto("/en/auth/signin?callbackUrl=/en/admin/faq");
    await page.getByRole("button", { name: /Admin Login/i }).click();
    await page.fill('input[type="email"]', "admin@kanad-jyotish.in");
    await page.fill('input[type="password"]', "ChangeMeInAdminSettings@2026");
    await page.locator('button[type="submit"]').click();

    // 2. Wait for navigation to Admin FAQ Manager
    await page.waitForURL((url) => url.pathname.includes("/admin/faq"), { timeout: 15000 });
    await expect(page.getByText(/FAQ System CMS/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("button", { name: /Add FAQ Question/i })).toBeVisible();

    // 3. Navigate to Founder Profile CMS
    await page.goto("/en/admin/founder");
    await expect(page.getByText(/Founder Page CMS Control/i)).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[value*="Radheshyam Shastri"]')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("button", { name: /Save Founder Profile Live/i })).toBeVisible();
  });
});
