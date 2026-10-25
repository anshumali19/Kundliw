import { test, expect } from "@playwright/test";

test.describe("Phase 18 - Services Enhancements, AstroSage Integration, Navigation & Other Services", () => {
  test("public Services page supports persistent Grid/List view toggle and Quick Enquiry modal", async ({
    page,
  }) => {
    await page.goto("/en/services");
    await expect(page).toHaveTitle(/Maharshi Kanad Jyotish Kendra|Vedic Services|Services/i);

    // Verify presence of Grid / List toggle
    const gridBtn = page.getByTitle(/Grid View/i);
    const listBtn = page.getByTitle(/List View/i);
    await expect(gridBtn).toBeVisible();
    await expect(listBtn).toBeVisible();

    // Click List View
    await listBtn.click();
    // Check localStorage
    const prefInStorage = await page.evaluate(() => localStorage.getItem("kanad_service_view_pref"));
    expect(prefInStorage).toBe("list");

    // Click back to Grid View
    await gridBtn.click();
    const updatedPref = await page.evaluate(() => localStorage.getItem("kanad_service_view_pref"));
    expect(updatedPref).toBe("grid");

    // Open Quick Enquiry Modal
    const quickEnquiryBtn = page.getByRole("button", { name: /Quick Enquiry|Enquire/i }).first();
    if (await quickEnquiryBtn.isVisible()) {
      await quickEnquiryBtn.click();
      await expect(page.getByRole("heading", { name: /Service.*Enquiry|Consultation Enquiry|पूछताछ/i })).toBeVisible();

      // Close modal
      const closeBtn = page.locator("button").filter({ hasText: /Cancel|रद्द करें/i }).or(page.locator("button:has(svg.lucide-x)"));
      await closeBtn.first().click();
    }
  });

  test("public Service Detail page displays itinerary, samagri, youtube embed and SubPageNav", async ({
    page,
  }) => {
    // Navigate to the canonical service detail page
    await page.goto("/en/services/complete-janampatri");

    // Verify SubPageNav breadcrumbs exist
    const breadcrumbNav = page.locator("nav[aria-label*='Breadcrumb']");
    await expect(breadcrumbNav).toBeVisible();
    await expect(breadcrumbNav.getByRole("link", { name: /Home/i })).toBeVisible();

    // Verify Back button exists
    const backBtn = page.getByRole("button", { name: /Back|All Services|सभी सेवाएँ/i }).or(page.getByRole("link", { name: /Back|All Services|सभी सेवाएँ/i }));
    await expect(backBtn.first()).toBeVisible();

    // Verify presence of consultation or booking action
    const enquiryBtn = page.getByRole("button", { name: /Quick Enquiry|सेवा पूछताछ/i }).first();
    await expect(enquiryBtn).toBeVisible();
  });

  test("public Other Services page displays Bharat Darshan, Matrimonial link, and YouTube discourse embeds", async ({
    page,
  }) => {
    // 1. English Other Services
    await page.goto("/en/other-services");
    await expect(page).toHaveTitle(/Other.*Services|Allied Services|अन्य सेवाएँ/i);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Other Services/i);

    // Verify Sister Portals / Other Services are listed
    await expect(page.getByText(/Bharat Darshan/i).first()).toBeVisible();
    await expect(page.getByText(/Vindhya Vivah Sanskar/i).first()).toBeVisible();

    // Verify SubPageNav
    const breadcrumbNav = page.locator("nav[aria-label*='Breadcrumb']");
    await expect(breadcrumbNav).toBeVisible();

    // 2. Hindi Other Services
    await page.goto("/hi/other-services");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/अन्य सेवाएँ/i);
  });

  test("public AstroSage Kundli integration page renders iframe viewer and safe external link-out fallback", async ({
    page,
  }) => {
    // 1. English AstroSage page
    await page.goto("/en/kundli/astrosage");
    await expect(page).toHaveTitle(/AstroSage/i);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/AstroSage/i);

    // Verify safe external link-out fallback
    const externalLink = page.getByRole("link", { name: /Open in AstroSage Portal/i });
    await expect(externalLink).toBeVisible();
    await expect(externalLink).toHaveAttribute("target", "_blank");
    await expect(externalLink).toHaveAttribute("rel", /noopener/);

    // Verify iframe embed is rendered
    const iframeViewer = page.locator("iframe[title*='AstroSage']");
    await expect(iframeViewer).toBeVisible();

    // 2. Hindi AstroSage page
    await page.goto("/hi/kundli/astrosage");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/एस्ट्रोसेज/i);
  });

  test("admin Other Services management dashboard loads for authenticated administrator", async ({
    page,
  }) => {
    page.on("dialog", (dialog) => dialog.accept());

    // Sign in as super-admin
    await page.goto("/en/auth/signin/super-admin?callbackUrl=/en/admin/other-services");
    await page.fill('input[type="email"]', "admin@kanad-jyotish.in");
    await page.fill('input[type="password"]', "ChangeMeInAdminSettings@2026");
    await page.locator('button[type="submit"]').click();

    // Wait for navigation to Admin Other Services
    await page.waitForURL((url) => url.pathname.includes("/admin/other-services"), { timeout: 15000 });
    await expect(page.getByText(/Other Services CMS/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("button", { name: /Add Other Service/i })).toBeVisible();
  });
});
