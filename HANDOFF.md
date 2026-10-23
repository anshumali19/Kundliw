# Maharshi Kanad Jyotish Kendra (महर्षि कणाद ज्योतिष केंद्र)
## Production Launch & Client Engineering Handoff Guide

> **Notice**: This build is a complete client demo MVP featuring end-to-end user journeys, authentic Vedic design aesthetics, bilingual support (Hindi/English), and robust security architectures. External services (Payments, SMS, Astronomical Ephemeris, Object Storage) operate through modular placeholder adapters gated by `DEMO_MODE=true`.

---

## 1. Production Launch Checklist & File Map

To transition from the demo MVP to a live production deployment, complete the following items at the specified file paths:

| Component | Responsibility / Action Required | File Path | Status |
| :--- | :--- | :--- | :--- |
| **Razorpay Payments** | Set live Key ID and Secret; configure webhook secret in Razorpay Dashboard. | [razorpayProvider.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/payments/razorpayProvider.ts)<br>[route.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/app/api/webhooks/razorpay/route.ts) | ⚠️ Swap with Live Credentials |
| **SMS Gateway (MSG91)** | Configure MSG91 Auth Key, sender ID, and DLT-approved template IDs for OTP and order updates. | [index.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/sms/index.ts) | ⚠️ Configure DLT Templates |
| **Astro Ephemeris** | Activate Swiss Ephemeris or AstroSage API credentials for real-time mathematical planetary degrees. | [astrosage.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/astro/astrosage.ts)<br>[factory.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/astro/factory.ts) | ⚠️ Plug in API Keys |
| **Private Document Storage** | Provision AWS S3 bucket and IAM credentials with private read ACLs for customer Kundli dossiers. | [index.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/storage/index.ts) | ⚠️ Configure S3 Bucket |
| **Admin Settings & Banking** | Update Kendra beneficiary bank account, IFSC, UPI VPA, QR code image, and Kendra GSTIN. | [page.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/admin/settings/page.tsx)<br>Admin UI: `/admin/settings` | ⚠️ Update Sample Placeholders |
| **Next.js & Security Upgrades** | Run `npm audit fix` and upgrade Next.js to latest patched stable release for enterprise hardening. | [package.json](file:///C:/Users/anshu/Desktop/ClientWork/package.json) | ⚠️ Maintenance |
| **Database Migrations** | Run production PostgreSQL schema migration and automated snapshot backups. | [schema.prisma](file:///C:/Users/anshu/Desktop/ClientWork/prisma/schema.prisma) | ⚠️ Run on Production DB |
| **Content Audit** | Replace sample reviews, sample articles, and placeholder notices with verified Kendra content. | Admin UI: `/admin/testimonials`<br>`/admin/blogs` | ⚠️ Client Content Review |

---

## 2. External Adapters Architecture

The application implements strict interface abstractions in `src/lib/`. The application logic never interacts directly with low-level vendor SDKs:

### A. Payments (`PaymentProvider`)
- **Interface**: [paymentProvider.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/payments/paymentProvider.ts)
- **Demo Provider**: `DemoPaymentProvider` simulates success and failure directly within the Vedic order lifecycle state machine.
- **Production Provider**: `RazorpayPaymentProvider` in [razorpayProvider.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/payments/razorpayProvider.ts). In production, set:
  ```env
  RAZORPAY_KEY_ID="rzp_live_xxxxxxxxxxxx"
  RAZORPAY_KEY_SECRET="your_live_secret_key"
  RAZORPAY_WEBHOOK_SECRET="your_webhook_signing_secret"
  ```
- **Webhook Processing**: Located at [route.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/app/api/webhooks/razorpay/route.ts). Validates raw HMAC-SHA256 signatures and guarantees idempotency through the `ProcessedWebhookEvent` table.

### B. SMS & OTP Notifications (`SmsProvider`)
- **Interface**: [index.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/sms/index.ts)
- **Dev Provider**: `DevConsoleSmsProvider` prints OTP codes to stdout in development and throws in production.
- **Production Provider**: `Msg91SmsProvider` requires:
  ```env
  MSG91_AUTH_KEY="your_msg91_auth_key"
  MSG91_SENDER_ID="KANADJ"
  MSG91_OTP_TEMPLATE_ID="dlt_approved_template_id"
  ```

### C. Vedic Astrology & Ephemeris (`AstroProvider`)
- **Interface**: [types.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/astro/types.ts)
- **Demo Provider**: `DemoAstroProvider` returns certified Vedic sample data (Vimshottari Dasha, 9-planet coordinates, Ashtakoot 36-Guna matching, and daily Panchang) stamped with `isDemo: true`.
- **Production Provider**: `AstroSageProvider` in [astrosage.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/astro/astrosage.ts). Configure:
  ```env
  ASTROSAGE_USER_ID="your_astrosage_user_id"
  ASTROSAGE_API_KEY="your_astrosage_api_key"
  ```
- **Caching**: [panchangService.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/astro/panchangService.ts) caches computed daily ephemeris in `PanchangCache` table by `dateString + city`, eliminating redundant vendor API expenses.

### D. Document & Vault Storage (`StorageProvider`)
- **Interface**: [index.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/storage/index.ts)
- **Security Check**: Magic byte validation strictly permits only authentic `%PDF-`, PNG, JPEG, and WEBP files. Maximum file upload ceiling is strictly locked at 10 MB.
- **Local Disk Provider**: Stored in `./storage/`.
- **Production S3 Provider**: Configure:
  ```env
  AWS_S3_BUCKET_NAME="kanad-jyotish-private-vault"
  AWS_S3_REGION="ap-south-1"
  AWS_ACCESS_KEY_ID="AKIA..."
  AWS_SECRET_ACCESS_KEY="..."
  ```

---

## 3. Production Safety Guard (`DEMO_MODE`)

All placeholder adapters implement the `assertPlaceholderAllowed()` guard defined in [demo.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/config/demo.ts):
```ts
if (process.env.NODE_ENV === "production" && process.env.DEMO_MODE !== "true") {
  throw new Error(
    `CRITICAL PRODUCTION GUARD: Placeholder adapter "${adapterName}" cannot be initialized in production when DEMO_MODE is not "true".`
  );
}
```
**It is impossible to deploy production on fake data by accident.** To launch production, set `DEMO_MODE=false` (or remove it) and supply live vendor keys.

---

## 4. Mobile & Android WebView Compatibility Checklist

The frontend has been built strictly adhering to Android WebView and mobile Safari requirements:
1. **No Popup Windows**: Avoided all `window.open()` popups that get silently blocked by WebView webChromeClients. All checkouts and authentications happen via in-app full-page views.
2. **Session Persistence**: NextAuth uses standard HTTP-only JWT cookies with secure attributes, avoiding local storage drops during WebView activity re-creations.
3. **Form Resiliency**: Booking forms save in-progress state to `sessionStorage` on step transitions, preventing data loss when users switch apps to copy UPI references.
4. **Touch Target Dimensions**: All buttons, form selects, and interactive links meet or exceed the mandatory 44px minimum touch target height.
5. **Authenticated File Streams**: PDF downloads (Invoices and Kundli Vault dossiers) are served via server routes (`/api/invoice/[id]`, `/api/vault/[id]`) with standard `Content-Disposition: attachment` headers, triggering native download managers reliably.

---

## 5. Security & Rate Limiting Specifications

1. **Role Verification**: Admin routes and APIs call `requireAdmin()` and `guardApiAdmin()`, which re-query the PostgreSQL database on every request to confirm the current user role (`Role.ADMIN`). Tampered or revoked JWT tokens are rejected immediately.
2. **Database Rate Limiting**: Managed via the `RateLimit` table:
   - OTP Requests: 3 per phone/60s, 10 per IP/60s.
   - Admin Login: 5 failed attempts per email/15min, locked per IP.
   - Public Order Tracker: 15 per IP/60s, 5 per orderNumber/60s.
   - Reverse Proxy: `x-forwarded-for` headers are trusted only when `TRUST_PROXY=true` in environment.
3. **Idempotent Sequential Sequences**:
   - Order numbers (`MKJK-2026-XXXX`) and Invoice numbers (`INV-2026-XXXX`) use atomic PostgreSQL transaction increments on the `Counter` model.
4. **Order Expiry**: Unpaid orders expire after 30 minutes, releasing conditionally claimed slots and coupon limits.
