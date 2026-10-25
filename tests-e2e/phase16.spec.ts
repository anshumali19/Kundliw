import { test, expect } from "@playwright/test";

test.describe("Phase 16 - Contact Page, Vedic Chatbot & Encrypted Keys Vault", () => {
  test("public contact page loads with map embed and processes user enquiry form", async ({ page }) => {
    // English route
    await page.goto("/en/contact");
    await expect(page).toHaveTitle(/Contact Us & Location/i);

    // Check presence of location details and Google Map iframe
    await expect(page.locator("iframe[title*='Google Map']")).toBeVisible();
    await expect(page.getByText(/Dashashwamedh Ghat/i).first()).toBeVisible();

    // Fill enquiry form
    await page.fill('input[placeholder*="Sharma"]', "Dev Test User");
    await page.fill('input[placeholder*="98765"]', "9876543210");
    await page.fill('input[type="email"]', "test.user@example.com");
    await page.fill('input[placeholder*="Janampatri"]', "Kundli Muhurta Inquiry");
    await page
      .locator("textarea")
      .fill("I would like to inquire about auspicious muhurta timing for my new venture.");

    // Submit form using precise submit button
    await page.locator('button[type="submit"]').click();

    // Verify confirmation message
    await expect(
      page.getByText(/Your enquiry has been received successfully/i)
    ).toBeVisible({ timeout: 10000 });
  });

  test("floating action bar renders WhatsApp direct button and interactive Vedic Chatbot drawer", async ({
    page,
  }) => {
    await page.goto("/en");

    // Check floating WhatsApp button
    const whatsappBtn = page.locator("a[aria-label*='WhatsApp']");
    await expect(whatsappBtn).toBeVisible();
    const href = await whatsappBtn.getAttribute("href");
    expect(href).toContain("https://wa.me/");

    // Check Vedic Chatbot button
    const chatbotToggle = page.locator("button[aria-label*='Vedic AI Assistant']");
    await expect(chatbotToggle).toBeVisible();

    // Open Chatbot drawer
    await chatbotToggle.click();

    // Verify Chatbot dialog is open
    await expect(page.locator("h3#chatbot-heading")).toBeVisible();
    await expect(page.getByText(/Online • Instant/i)).toBeVisible();

    // Wait for welcome message to load
    await expect(page.getByText(/Namaste!/i)).toBeVisible({ timeout: 10000 });

    // Ask a question in the chat input
    const input = page.locator("input[placeholder*='Ask anything']");
    await input.fill("What are your fees?");
    await page.locator("button[aria-label='Send message']").click();

    // Verify bot responds
    await expect(page.locator(".whitespace-pre-wrap").last()).toBeVisible({
      timeout: 10000,
    });
  });

  test("security guards block unauthenticated access to Phase 16 admin APIs", async ({
    request,
  }) => {
    // 1. Settings Keys API
    const keysRes = await request.get("/api/admin/settings/keys");
    expect([401, 403]).toContain(keysRes.status());

    // 2. Chatbot Admin API
    const chatbotRes = await request.get("/api/admin/chatbot");
    expect([401, 403]).toContain(chatbotRes.status());

    // 3. Enquiries Admin API
    const enquiriesRes = await request.get("/api/admin/enquiries");
    expect([401, 403]).toContain(enquiriesRes.status());
  });

  test("authenticated admin can access Settings Keys Vault and Chatbot Manager", async ({
    page,
  }) => {
    // Sign in as admin with callbackUrl to admin keys
    await page.goto("/en/auth/signin?callbackUrl=/en/admin/settings/keys");
    await page.getByRole("button", { name: /Admin Login/i }).click();
    await page.fill('input[type="email"]', "admin@kanad-jyotish.in");
    await page.fill('input[type="password"]', "ChangeMeInAdminSettings@2026");
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/admin/);

    // 1. Verify Keys Vault is loaded
    await expect(
      page.getByText(/API & Credentials Security Vault/i)
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByText(/Razorpay Payment Gateway/i).first()
    ).toBeVisible();

    // 2. Navigate to Chatbot Manager
    await page.goto("/en/admin/chatbot");
    await expect(
      page.getByText(/Vedic Rule-Based Chatbot CMS/i)
    ).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("button", { name: /Add Q&A Entry/i })).toBeVisible();

    // 3. Navigate to Enquiries Manager
    await page.goto("/en/admin/enquiries");
    await expect(
      page.getByText(/Contact & Consultation Enquiries/i)
    ).toBeVisible({ timeout: 10000 });
  });
});
