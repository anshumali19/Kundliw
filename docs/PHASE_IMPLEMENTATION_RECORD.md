# Maharshi Kanad Jyotish Kendra (महर्षि कणाद ज्योतिष केंद्र)
# Comprehensive Phase-by-Phase Implementation Record

> **Project Reference**: Maharshi Kanad Jyotish Kendra - Vedic Astrology Portal & Admin CMS  
> **Production URL**: [https://kanad-jyotish-kendra.vercel.app](https://kanad-jyotish-kendra.vercel.app)  
> **Repository**: [https://github.com/anshumali19/Kundliw.git](https://github.com/anshumali19/Kundliw.git) (`main` branch)  
> **Automated Test Coverage**: 17 Test Suites, 97 Tests Passing (100% Pass Rate)

---

## Table of Contents
1. [Core Specifications & Architectural Rules](#core-specifications--architectural-rules)
2. [Phase 1: Project Setup, Prisma Schema, Seed Data & Layout Shell](#phase-1-project-setup-prisma-schema-seed-data--layout-shell)
3. [Phase 2: Authentication, Mobile OTP & Role Guards](#phase-2-authentication-mobile-otp--role-guards)
4. [Phase 3: Services, Plans & Offers Catalog Engine](#phase-3-services-plans--offers-catalog-engine)
5. [Phase 4: Multi-Step Booking Flow & Slot Locking Engine](#phase-4-multi-step-booking-flow--slot-locking-engine)
6. [Phase 5: Payments Gateway, Demo Mode & Manual UPI/Bank Engine](#phase-5-payments-gateway-demo-mode--manual-upibank-engine)
7. [Phase 6: Billing Subsystem & Sequential GST Invoice Engine](#phase-6-billing-subsystem--sequential-gst-invoice-engine)
8. [Phase 7: Order Tracker, 6-Stage Stepper & Customer Dashboard](#phase-7-order-tracker-6-stage-stepper--customer-dashboard)
9. [Phase 8: Customer Digital Vault & Secure Document Streaming](#phase-8-customer-digital-vault--secure-document-streaming)
10. [Phase 9: Vedic Astrology Engine & Specialized Intake Forms](#phase-9-vedic-astrology-engine--specialized-intake-forms)
11. [Phase 10: Comprehensive Admin CMS Control Center](#phase-10-comprehensive-admin-cms-control-center)
12. [Phase 11: Real-Time Panchang Subsystem & Database Caching](#phase-11-real-time-panchang-subsystem--database-caching)
13. [Phase 12: Architectural Hardening, Concurrency & Security Layer](#phase-12-architectural-hardening-concurrency--security-layer)
14. [Phase 13: Client Visual Enhancements, Lenis Scrolling & Custom Interfaces](#phase-13-client-visual-enhancements-lenis-scrolling--custom-interfaces)
15. [Phase 14: Automated Test Suite & Production Cloud Deployment](#phase-14-automated-test-suite--production-cloud-deployment)

---

## Core Specifications & Architectural Rules

The application was built from the ground up according to strict SRS requirements:

### 1. Technology Stack
- **Framework**: Next.js 14.2.15 (App Router, Server Actions, API Route Handlers)
- **Language**: TypeScript (Strict mode enabled, zero `any` types)
- **Styling**: Tailwind CSS configured with authentic Vedic tokens (Saffron, Maroon, Deep Ochre, Warm Cream)
- **Database & ORM**: PostgreSQL with Prisma ORM 5.22.0
- **Internationalization**: `next-intl` (Hindi `hi` and English `en` bilingual dictionary routing, zero hardcoded UI strings)
- **Authentication**: NextAuth.js v4 (Google OAuth, Email magic/password, Mobile OTP via custom SMS provider)
- **Payments**: Multi-tier `PaymentProvider` abstraction (Razorpay server order creation & webhook verification, Demo simulator, Manual Bank/UPI workflow)
- **Document Generation**: PDFKit with custom server streaming for GST Tax Invoices and Kundli dossiers

### 2. Strict UI Constraints
- **Zero Center-Alignment**: Headings, body text, form elements, and CTAs are strictly left-aligned. Broadsheet editorial typography and asymmetric split layouts match Vedic manuscript design.
- **No Repeated 3-Card Pattern**: Diverse layout blocks (two-column editorial splits, dense data tables, stepped timelines, and carousel banners).
- **Mobile-First & Android WebView Compliance**: Zero popup windows (`window.open` prohibited), minimum 44px touch targets on all interactive elements, session resilience in `sessionStorage`, and pure container containment (`overflow-x: clip`).
- **Semantic Theme Variables**: Colors reference Tailwind palette tokens (`saffron-light`, `saffron-base`, `maroon-base`, `earth-card`), avoiding raw hex strings.

### 3. Strict Code Quality Guidelines
- Pure business logic functions separated into testable units (`lib/billing`, `lib/offers`, `lib/orders`, `lib/auth`).
- Strict schema validation with Zod on all incoming API request payloads.
- All secrets gated behind environment variables with full `.env.example` documentation.

---

## Phase 1: Project Setup, Prisma Schema, Seed Data & Layout Shell

### 1. Specification As Given
> *Project setup, Prisma schema, seed data, layout shell (header, footer, language toggle, marquee bar).*

### 2. Implementation & File Structure
- **Prisma Schema** ([schema.prisma](file:///C:/Users/anshu/Desktop/ClientWork/prisma/schema.prisma)): Created the complete relational data model covering `User`, `Account`, `Session`, `Service`, `ServicePlan`, `Offer`, `Order`, `Invoice`, `Counter`, `VaultItem`, `Banner`, `Marquee`, `BlogPost`, `Testimonial`, `GalleryItem`, `StaticPage`, `Setting`, `PanchangCache`, `RateLimit`, and `ProcessedWebhookEvent`.
- **Database Seeder** ([seed.ts](file:///C:/Users/anshu/Desktop/ClientWork/prisma/seed.ts)): Populated realistic Vedic services (Kundli Milan, Janampatri Rachna, Prashna Kundli, Vastu Consultation), tiered pricing plans, verified promotional coupons (`DIVINE10`, `SHIVRATRI20`), CMS banners, marquee alerts, and default Kendra bank settings.
- **Internationalization Core** ([routing.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/i18n/routing.ts), [request.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/i18n/request.ts), [messages/en.json](file:///C:/Users/anshu/Desktop/ClientWork/messages/en.json), [messages/hi.json](file:///C:/Users/anshu/Desktop/ClientWork/messages/hi.json)): Implemented localized route handling (`/[locale]/...`) with 100% string coverage for Hindi and English.
- **Broadsheet Layout Shell**:
  - Top utility bar and navigation: [Header.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/components/layout/Header.tsx)
  - Sanskrit shloka and broadcast ticker: [MarqueeStrip.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/components/layout/MarqueeStrip.tsx)
  - Editorial 5-column footer: [Footer.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/components/layout/Footer.tsx)
  - Locale switcher dropdown: [LanguageSwitcher.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/components/layout/LanguageSwitcher.tsx)
  - Mobile slide-out navigation: [MobileNav.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/components/layout/MobileNav.tsx)
- **Tailwind Palette Configuration** ([tailwind.config.ts](file:///C:/Users/anshu/Desktop/ClientWork/tailwind.config.ts)): Configured bespoke color tokens, Noto Serif / Noto Sans fonts, and custom container constraints.

### 3. Key Logic & Edge Cases
- Dynamic RTL/LTR support preparation and Indian decimal formatting.
- Strict Integer Paise money model (`1 INR = 100 paise`) established across database schemas to eliminate JavaScript floating-point rounding errors.

### 4. Verification & Tests
- Vitest suite created with initial pure functions for GST math and order status models.

---

## Phase 2: Authentication, Mobile OTP & Role Guards

### 1. Specification As Given
> *Auth: register, login (Google, email, OTP), role field (USER / ADMIN).*

### 2. Implementation & File Structure
- **NextAuth Core Options** ([authOptions.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/auth/authOptions.ts)):
  - Google OAuth provider.
  - Credentials provider supporting dual-path sign-in: Email + Password or Mobile Number + 6-digit SMS OTP.
  - Custom JWT and Session callbacks injecting `id`, `role` (`USER` or `ADMIN`), and phone number into the active session.
- **Route Handlers & Pages**:
  - API endpoint for OTP generation: [route.ts (otp/send)](file:///C:/Users/anshu/Desktop/ClientWork/src/app/api/auth/otp/send/route.ts)
  - API endpoint for user registration: [route.ts (register)](file:///C:/Users/anshu/Desktop/ClientWork/src/app/api/auth/register/route.ts)
  - NextAuth catch-all handler: [route.ts (auth/[...nextauth])](file:///C:/Users/anshu/Desktop/ClientWork/src/app/api/auth/[...nextauth]/route.ts)
  - Bilingual login screen: [page.tsx (signin)](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/auth/signin/page.tsx)
  - Customer registration screen: [page.tsx (register)](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/auth/register/page.tsx)
- **Security & Authorization**:
  - Server-side role verifier: [guards.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/auth/guards.ts) (`requireAdmin()`, `requireAuth()`, `guardApiAdmin()`)
  - Cryptographic OTP generator and bcrypt hash storage: [otp.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/auth/otp.ts)
  - Modular SMS Adapter: [sms/index.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/sms/index.ts) (`DevConsoleSmsProvider` and `Msg91SmsProvider`)
  - Middleware route interceptor: [middleware.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/middleware.ts)

### 3. Key Logic & Edge Cases
- **Database Rate Limiting**: OTP generation is strictly capped at 3 requests per phone per 60 seconds and 10 requests per client IP per 60 seconds.
- **Admin Brute-Force Lockout**: 5 failed consecutive attempts per admin email locks out access for 15 minutes.
- **Token Tamper Protection**: `guardApiAdmin()` queries the PostgreSQL database on every sensitive call rather than relying blindly on stale JWT claims.

### 4. Verification & Tests
- [auth.test.ts](file:///C:/Users/anshu/Desktop/ClientWork/tests/auth.test.ts) (13 tests): Verifies phone normalization (`+91`), OTP bcrypt hashing, 10-minute expiry window, role elevation denials, and rate limit thresholds.
- [otp.test.ts](file:///C:/Users/anshu/Desktop/ClientWork/tests/otp.test.ts) (5 tests): Tests random 6-digit code generation, format validation, and hash comparison.

---

## Phase 3: Services, Plans & Offers Catalog Engine

### 1. Specification As Given
> *Services > Plans > Offers (admin CRUD, public listing and detail pages).*

### 2. Implementation & File Structure
- **Public Catalog Views**:
  - Services listing: [page.tsx (services)](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/services/page.tsx)
  - Deep-dive service details & plan selector: [page.tsx (services/[slug])](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/services/[slug]/page.tsx)
  - Client tier selector component: [PlanSelectorInteractive.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/features/services/components/PlanSelectorInteractive.tsx)
- **Admin Management Consoles**:
  - Services & plans manager: [AdminServicesManager.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/features/admin/services/AdminServicesManager.tsx)
  - Offers & coupons manager: [AdminOffersManager.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/features/admin/offers/AdminOffersManager.tsx)
- **API Endpoints**:
  - Service CRUD: `/api/admin/services` & `/api/admin/services/[id]`
  - Plan CRUD: `/api/admin/plans` & `/api/admin/plans/[id]`
  - Offer CRUD: `/api/admin/offers` & `/api/admin/offers/[id]`
  - Real-time coupon validator: [route.ts (offers/validate)](file:///C:/Users/anshu/Desktop/ClientWork/src/app/api/offers/validate/route.ts)
- **Business Logic Modules**:
  - Coupon discount calculator: [apply.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/offers/apply.ts)
  - Integer paise converter: [money.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/billing/money.ts)
  - Request validators: [validation.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/features/services/validation.ts)

### 3. Key Logic & Edge Cases
- **Discount Computation Engine**: Supports both percentage-based (`PERCENTAGE`) with optional maximum discount caps (`maxDiscountInPaise`), and flat-rate (`FLAT`) discounts.
- **Coupon Usage Boundaries**: Validates validity date ranges (`validFrom` / `validTill`), minimum order threshold (`minOrderInPaise`), and total redemption caps (`maxUses`).
- **CSRF Token Validation**: Dedicated double-submit cookie verification guards admin mutations against cross-origin attacks.

### 4. Verification & Tests
- [services.test.ts](file:///C:/Users/anshu/Desktop/ClientWork/tests/services.test.ts) (11 tests): Verifies slug generation, plan associations, integer money conversions, and Zod validation.
- [offers.test.ts](file:///C:/Users/anshu/Desktop/ClientWork/tests/offers.test.ts) (7 tests): Validates coupon application, minimum cart amounts, maximum ceiling discounts, and expired coupon rejections.
- [csrf.test.ts](file:///C:/Users/anshu/Desktop/ClientWork/tests/csrf.test.ts) (5 tests): Tests CSRF token generation, cryptographic signature validation, and mismatch rejections.

---

## Phase 4: Multi-Step Booking Flow & Slot Locking Engine

### 1. Specification As Given
> *Booking flow: Service > Plan > Offer > Booking details > Payment > Verification > Success.*

### 2. Implementation & File Structure
- **Wizard Interfaces**:
  - Interactive 3-step booking wizard: [BookingWizard.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/features/booking/components/BookingWizard.tsx)
  - Booking page wrapper: [page.tsx (booking)](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/booking/page.tsx)
  - Order confirmed receipt view: [page.tsx (booking/success/[id])](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/booking/success/[id]/page.tsx)
- **Backend Booking Engine**:
  - Order creation orchestrator: [service.ts (booking)](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/booking/service.ts)
  - Order initialization route: [route.ts (booking)](file:///C:/Users/anshu/Desktop/ClientWork/src/app/api/booking/route.ts)
  - Dynamic slot availability route: [route.ts (booking/slots)](file:///C:/Users/anshu/Desktop/ClientWork/src/app/api/booking/slots/route.ts)
  - Zod intake schema: [validation.ts (booking)](file:///C:/Users/anshu/Desktop/ClientWork/src/features/booking/validation.ts)

### 3. Key Logic & Edge Cases
- **Server-Side Price Recomputation**: The client never passes prices to the server. The booking engine looks up current database prices for the service and plan, recalculates coupon discounts, and computes 18% GST server-side.
- **Client Session Resilience**: Saves form progress to `sessionStorage` on step changes, preventing lost inputs if an Android WebView is backgrounded.
- **Receipt Security**: Unauthenticated users cannot view confirmation receipts unless they provide the phone number matching the order.

### 4. Verification & Tests
- [booking.test.ts](file:///C:/Users/anshu/Desktop/ClientWork/tests/booking.test.ts) (10 tests): Verifies birth time parsing, full booking payload creation, client tampering resistance, and atomic order numbering.

---

## Phase 5: Payments Gateway, Demo Mode & Manual UPI/Bank Engine

### 1. Specification As Given
> *Payments: Razorpay checkout and webhook verification, plus a manual-payment option showing bank/UPI/QR from admin settings.*

### 2. Implementation & File Structure
- **Provider Architecture**:
  - Modular provider interface: [paymentProvider.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/payments/paymentProvider.ts)
  - Production Razorpay adapter: [razorpayProvider.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/payments/razorpayProvider.ts)
  - Demo payment simulator: [demo.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/payments/demo.ts)
  - Provider factory resolver: [factory.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/payments/factory.ts)
  - Payment orchestrator: [service.ts (payments)](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/payments/service.ts)
- **User Checkout Interface**:
  - Checkout client: [CheckoutClient.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/features/booking/components/CheckoutClient.tsx)
  - Checkout route: [page.tsx (checkout/[id])](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/booking/checkout/[id]/page.tsx)
- **API Handlers & Webhooks**:
  - Demo checkout processor: [route.ts (demo/process)](file:///C:/Users/anshu/Desktop/ClientWork/src/app/api/payments/demo/process/route.ts)
  - Manual payment proof submitter: [route.ts (manual/submit)](file:///C:/Users/anshu/Desktop/ClientWork/src/app/api/payments/manual/submit/route.ts)
  - Razorpay HMAC webhook: [route.ts (webhooks/razorpay)](file:///C:/Users/anshu/Desktop/ClientWork/src/app/api/webhooks/razorpay/route.ts)
- **Admin Payment Verification**:
  - Admin orders table: [AdminOrdersManager.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/features/admin/components/AdminOrdersManager.tsx)
  - Manual payment approver API: `/api/admin/orders/[id]/verify-payment`

### 3. Key Logic & Edge Cases
- **Razorpay HMAC-SHA256 Verification**: Cryptographically computes `sha256(orderId + "|" + paymentId)` using `RAZORPAY_KEY_SECRET` before marking orders `PAID`.
- **Webhook Idempotency**: The `ProcessedWebhookEvent` table logs each event ID; duplicate deliveries return immediate `200 OK` without double-processing.
- **Production Guard (`assertPlaceholderAllowed`)**: In production (`NODE_ENV=production`), initializing `DemoPaymentProvider` throws an exception unless `DEMO_MODE=true` is explicitly set.

### 4. Verification & Tests
- [payments.test.ts](file:///C:/Users/anshu/Desktop/ClientWork/tests/payments.test.ts) (6 tests): Validates state transitions (`PENDING` -> `PAID`, `PENDING` -> `FAILED`), webhook idempotency, and manual payment proof attachment.
- [razorpay.test.ts](file:///C:/Users/anshu/Desktop/ClientWork/tests/razorpay.test.ts) (4 tests): Tests signature generation, signature matching, and tampering detection.

---

## Phase 6: Billing Subsystem & Sequential GST Invoice Engine

### 1. Specification As Given
> *Billing: GST invoice calculation (base, offer deduction, GST %, net payable) and PDF download.*

### 2. Implementation & File Structure
- **Tax Calculation Math** ([gst.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/billing/gst.ts)): Pure function computing taxable base, 18% GST (CGST 9% + SGST 9% for intra-state or IGST 18% for inter-state), and net payable in integer paise.
- **PDF Generation Engine** ([invoicePdf.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/billing/invoicePdf.ts)): Server-side PDFKit document builder drawing saffron headers, Kendra registration credentials, client details, itemized breakdown tables, total payable, and "DEMO / SAMPLE INVOICE" watermark when in demo mode.
- **Invoice Endpoint** ([route.ts (invoice/[id])](file:///C:/Users/anshu/Desktop/ClientWork/src/app/api/invoice/[id]/route.ts)): Generates invoices on-the-fly and streams them as `application/pdf` with `Content-Disposition: attachment`.

### 3. Key Logic & Edge Cases
- **Sequential Invoicing**: Uses the `Counter` model inside an atomic PostgreSQL transaction to guarantee continuous, gapless sequential numbering (`INV-2026-0001`, `INV-2026-0002`).
- **Rounding Rule Integrity**: Integer math rounds to the nearest paise using standard financial rounding `Math.round((base * 18) / 100)`.

### 4. Verification & Tests
- [billing.test.ts](file:///C:/Users/anshu/Desktop/ClientWork/tests/billing.test.ts) (5 tests): Checks 18% GST calculation across diverse price points, coupon deductions, zero-value totals, and integer precision.
- [invoice.test.ts](file:///C:/Users/anshu/Desktop/ClientWork/tests/invoice.test.ts) (3 tests): Verifies atomic counter increments, invoice PDF generation, and unauthorized download blocking.

---

## Phase 7: Order Tracker, 6-Stage Stepper & Customer Dashboard

### 1. Specification As Given
> *Order tracker: statuses Order Received, Kundli in Progress, Kundli Complete, Dispatched, Delivered, Execution Complete; admin updates, user sees stepper.*

### 2. Implementation & File Structure
- **Order State Machine** ([status.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/orders/status.ts)): Strictly enforces valid transitions across all 6 phases:
  1. `ORDER_RECEIVED`
  2. `KUNDLI_IN_PROGRESS`
  3. `KUNDLI_COMPLETE`
  4. `DISPATCHED`
  5. `DELIVERED`
  6. `EXECUTION_COMPLETE`
- **Visual Stepper Component** ([OrderStatusStepper.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/features/orders/components/OrderStatusStepper.tsx)): Responsive timeline indicating completed stages, active stage, and pending stages with localized labels.
- **Customer Account Dashboard** ([page.tsx (account)](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/account/page.tsx)): Displays active bookings, historical orders, and digital vault downloads.
- **Public Order Tracker** ([page.tsx (track)](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/track/page.tsx), [TrackOrderClient.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/features/orders/components/TrackOrderClient.tsx)): Allows looking up orders using Order Number and Phone Number.
- **Tracking API** ([route.ts (orders/track)](file:///C:/Users/anshu/Desktop/ClientWork/src/app/api/orders/track/route.ts)): Validates order number and customer phone before revealing progress details.

### 3. Key Logic & Edge Cases
- **Unauthorized Enumeration Protection**: The tracking endpoint does not reveal order existence without the matching customer phone number.
- **Transition Guard**: Disallows invalid jumps (e.g. `ORDER_RECEIVED` straight to `DELIVERED` without passing through intermediate progress stages).

### 4. Verification & Tests
- [orderStatus.test.ts](file:///C:/Users/anshu/Desktop/ClientWork/tests/orderStatus.test.ts) (4 tests): Tests allowed forward transitions, backwards rollback restrictions, and terminal state stability.
- [tracker.test.ts](file:///C:/Users/anshu/Desktop/ClientWork/tests/tracker.test.ts) (3 tests): Tests phone verification requirement, status stepper indexing, and rate-limiting on tracker queries.

---

## Phase 8: Customer Digital Vault & Secure Document Streaming

### 1. Specification As Given
> *Vault: admin uploads a Kundli PDF to a specific user; user downloads it from the dashboard.*

### 2. Implementation & File Structure
- **Storage Subsystem** ([storage/index.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/storage/index.ts)): Local disk file manager in development, pluggable AWS S3 adapter in production.
- **Admin Vault Interface** ([page.tsx (admin/vault)](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/admin/vault/page.tsx), [AdminVaultManager.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/features/admin/components/AdminVaultManager.tsx)): Admin interface to select customer, attach dossier title/description, and upload files.
- **Customer Vault Page** ([page.tsx (vault)](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/vault/page.tsx)): Customer view of all granted astrological documents.
- **Endpoints**:
  - Secure upload: [route.ts (admin/vault/upload)](file:///C:/Users/anshu/Desktop/ClientWork/src/app/api/admin/vault/upload/route.ts)
  - Ownership-checked download: [route.ts (vault/[id])](file:///C:/Users/anshu/Desktop/ClientWork/src/app/api/vault/[id]/route.ts)

### 3. Key Logic & Edge Cases
- **Magic-Byte Cryptographic Validation**: Validates file buffer signatures to ensure the file begins with `%PDF-` (`0x25 0x50 0x44 0x46 0x2D`). Files disguised with `.pdf` extensions are blocked.
- **Strict Size Ceiling**: Enforces a strict 10MB upload ceiling.
- **Ownership Verification**: Route `/api/vault/[id]` verifies `session.user.id === vaultItem.userId || session.user.role === 'ADMIN'`.

### 4. Verification & Tests
- [vault.test.ts](file:///C:/Users/anshu/Desktop/ClientWork/tests/vault.test.ts) (3 tests): Tests magic-byte PDF detection, cross-user download blockage, and admin authorization bypass.

---

## Phase 9: Vedic Astrology Engine & Specialized Intake Forms

### 1. Specification As Given
> *Kundli, Kundli Matching and Prashna Kundli request forms (manual requests stored as orders) and an AstroSage integration behind a `lib/astro/` adapter interface.*

### 2. Implementation & File Structure
- **Astrology Provider Interface** ([types.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/astro/types.ts)): Standardized interface defining `getKundli()`, `matchKundli()`, and `getPanchang()`.
- **Demo Adapter** ([demo.ts (astro)](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/astro/demo.ts)): Provides mathematically structured planetary positions, Vimshottari Dasha periods, and Ashtakoot 36-point matching calculations labeled "Sample output, not a real calculation".
- **AstroSage Production Adapter** ([astrosage.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/astro/astrosage.ts)): Production adapter communicating with the AstroSage Vedic API.
- **Factory** ([factory.ts (astro)](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/astro/factory.ts)): Dynamically resolves active provider with production safety checks.
- **Client Interactive Dashboards**:
  - Janampatri Computation: [KundliCalculatorClient.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/features/astro/components/KundliCalculatorClient.tsx)
  - Ashtakoot Milan Calculator: [MatchingCalculatorClient.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/features/astro/components/MatchingCalculatorClient.tsx)
  - Horary Prashna Portal: [PrashnaRequestClient.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/features/astro/components/PrashnaRequestClient.tsx)
- **API Endpoints**: `/api/astro/kundli`, `/api/astro/matching`, `/api/astro/request`.

### 3. Key Logic & Edge Cases
- **Order Pipeline Conversion**: Requests can be saved as formal Kendra orders with service type `KUNDLI`, `MATCHING`, or `PRASHNA`.
- **Transparency Safeguard**: Every demo computation returns `isDemo: true`, rendering visible warning chips.

### 4. Verification & Tests
- [astro.test.ts](file:///C:/Users/anshu/Desktop/ClientWork/tests/astro.test.ts) (6 tests): Validates planetary longitude ranges (0° to 360°), Ashtakoot scoring (0 to 36 points), Prashna seed numbers (1 to 249), and fallback handling.

---

## Phase 10: Comprehensive Admin CMS Control Center

### 1. Specification As Given
> *Admin CMS: banners (position + static/carousel), marquee (text, speed, font size, bg color, position), static pages, blogs, testimonials, media gallery.*

### 2. Implementation & File Structure
- **Admin Management Consoles**:
  - Banners Manager: [page.tsx (admin/banners)](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/admin/banners/page.tsx)
  - Marquee Manager: [page.tsx (admin/marquee)](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/admin/marquee/page.tsx)
  - Static Pages Manager: [page.tsx (admin/pages)](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/admin/pages/page.tsx)
  - Blog Post CMS: [page.tsx (admin/blogs)](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/admin/blogs/page.tsx)
  - Gallery Manager: [page.tsx (admin/gallery)](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/admin/gallery/page.tsx)
  - Testimonials Manager: [page.tsx (admin/testimonials)](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/admin/testimonials/page.tsx)
  - Kendra Settings: [page.tsx (admin/settings)](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/admin/settings/page.tsx)
- **Public Dynamic Pages**:
  - [about/page.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/about/page.tsx), [founder/page.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/founder/page.tsx), [help/page.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/help/page.tsx), [legal/[slug]/page.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/legal/[slug]/page.tsx)
  - [blogs/page.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/blogs/page.tsx) & [blogs/[slug]/page.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/blogs/[slug]/page.tsx)
  - [gallery/page.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/gallery/page.tsx)
  - [testimonials/page.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/testimonials/page.tsx)

### 3. Key Logic & Edge Cases
- **Dynamic Slot Injection**: Banners can be targeted to slots (`HOME_HERO`, `SERVICES_TOP`, `CHECKOUT_SIDEBAR`) and toggled between static and auto-advancing carousels.
- **Marquee Customization**: Admin can adjust speed, background color, font size, and directional flow without code changes.

### 4. Verification & Tests
- [cms.test.ts](file:///C:/Users/anshu/Desktop/ClientWork/tests/cms.test.ts) (5 tests): Tests CMS entity CRUD, slug sanitization, active filter status, and image upload validation.

---

## Phase 11: Real-Time Panchang Subsystem & Database Caching

### 1. Specification As Given
> *Homepage panchang widget (date, time, day, tithi) via the same astro adapter, with a cached result.*

### 2. Implementation & File Structure
- **Caching Engine** ([panchangService.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/astro/panchangService.ts)): Checks PostgreSQL `PanchangCache` table for matching `dateString + city`. On cache misses, calls the astro provider, writes the computed ephemeris to the database, and returns the result.
- **UI Components**:
  - Homepage widget: [PanchangWidget.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/features/astro/components/PanchangWidget.tsx)
  - Dedicated Panchang portal: [PanchangClient.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/features/astro/components/PanchangClient.tsx)
  - Dedicated page route: [page.tsx (panchang)](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/panchang/page.tsx)
  - API route: [route.ts (astro/panchang)](file:///C:/Users/anshu/Desktop/ClientWork/src/app/api/astro/panchang/route.ts)

### 3. Key Logic & Edge Cases
- **High Traffic Cost Optimization**: Repeated requests for the same date and city generate 0 external API calls once cached.
- **Graceful Unconfigured Fallback**: If external AstroSage credentials are unconfigured or fail in production, the service logs a clean warning and falls back safely without unhandled crashes.

### 4. Verification & Tests
- [panchang.test.ts](file:///C:/Users/anshu/Desktop/ClientWork/tests/panchang.test.ts) (3 tests): Tests database cache hit return, provider miss caching, and non-crashing fallback.

---

## Phase 12: Architectural Hardening, Concurrency & Security Layer

### 1. Specification & Requirements
Security hardening and transactional guarantees were implemented across booking and administrative operations.

### 2. Implementation & File Structure
- **Atomic Slot & Coupon Reservation** ([service.ts (booking)](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/booking/service.ts)): Wrapped within Prisma `$transaction`:
  ```ts
  const updatedOffer = await tx.offer.updateMany({
    where: { id: offer.id, usedCount: { lt: offer.maxUses } },
    data: { usedCount: { increment: 1 } }
  });
  ```
- **30-Minute Order Expiry & Auto-Release**: If an order remains unpaid after 30 minutes, its booked appointment slot and coupon count are automatically released back to the pool.
- **Database-Backed Rate Limiting** ([RateLimit Model](file:///C:/Users/anshu/Desktop/ClientWork/prisma/schema.prisma)): Tracks client requests by IP and identifier with automatic window expiries.
- **Strict Role Verification** ([guards.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/auth/guards.ts)): Eliminates stale session privilege escalation by re-verifying roles against the database on protected actions.

### 3. Verification & Tests
- [hardening.test.ts](file:///C:/Users/anshu/Desktop/ClientWork/tests/hardening.test.ts) (4 tests): Verifies atomic rollback on race conditions, expired order slot release, and database rate limit counter enforcement.

---

## Phase 13: Client Visual Enhancements, Lenis Scrolling & Custom Interfaces

### 1. Client-Directed Visual Requirements
The client requested specific design refinements to elevate the portal aesthetics:
1. **Lenis Smooth Scrolling**: Implement buttery smooth inertia scrolling across all pages.
2. **Interactive Navbar Dropdowns**: Instant hover dropdown for "About Us" / "हमारे बारे में" with sub-links.
3. **Custom Calculation Dashboards**: Re-skin the Horary Query and Janampatri Computation interfaces to match the client's provided mockups.
4. **Strict Full-Width Left-Aligned Layout**: Remove all center-alignments across every page for an edge-to-edge broadsheet aesthetic.
5. **Desktop Navbar Clearance**: Prevent button wrapping or clipping on standard screens at 100% browser zoom.
6. **Balanced 5-Column Footer**: Restructure footer into 5 balanced, left-aligned columns.

### 2. Implementation & File Structure
- **Lenis Smooth Scroll Provider** ([SmoothScrollProvider.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/components/providers/SmoothScrollProvider.tsx), [layout.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/layout.tsx)): Configured `ReactLenis` with smooth interpolation (`lerp: 0.1`, `duration: 1.2`, `smoothWheel: true`).
- **Navbar Redesign** ([Header.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/components/layout/Header.tsx)):
  - Moved secondary links (Phone, Hours, Sign In, Register, Language Switcher) into top utility bar.
  - Added CSS hover dropdown for "About Us" (`/about`, `/founder`, `/help`, `/gallery`, `/testimonials`).
  - Tightened CTA padding (`px-4 py-2`), ensuring `Book Consultation` and `Profile Avatar` have ample clearance (>120px) on 100% zoom.
- **Horary Vedic Query Dashboard** ([PrashnaRequestClient.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/features/astro/components/PrashnaRequestClient.tsx)): Re-engineered to match the Horary mock with Prashna seed picker (1–249), planetary status breakdown, house placement cards, and submission workflow.
- **Vedic Janampatri Computation Interface** ([KundliCalculatorClient.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/features/astro/components/KundliCalculatorClient.tsx)): Multi-pane view with North/South Indian chart views, 9-planet ephemeris coordinates, and Vimshottari Mahadasha timeline.
- **Ashtakoot Matching Dashboard** ([MatchingCalculatorClient.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/features/astro/components/MatchingCalculatorClient.tsx)): 36-point Guna breakdown table (Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, Nadi) with dosha analysis.
- **Footer Restructure** ([Footer.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/components/layout/Footer.tsx)): Converted into 5 left-aligned columns: Kendra Credentials, Vedic Services, Astrological Tools, Kendra Policies, and Direct Contact.

---

## Phase 14: Automated Test Suite & Production Cloud Deployment

### 1. Test Suite Verification
All 17 test suites pass with zero errors:

| Test Suite | File Path | Tests Passed | Focus Area |
| :--- | :--- | :---: | :--- |
| **Auth** | [tests/auth.test.ts](file:///C:/Users/anshu/Desktop/ClientWork/tests/auth.test.ts) | 13 | Phone format, bcrypt OTP, rate limits, session roles |
| **OTP** | [tests/otp.test.ts](file:///C:/Users/anshu/Desktop/ClientWork/tests/otp.test.ts) | 5 | 6-digit generation, time expiry, comparison |
| **Services** | [tests/services.test.ts](file:///C:/Users/anshu/Desktop/ClientWork/tests/services.test.ts) | 11 | Catalog CRUD, slug sanitization, integer money |
| **Offers** | [tests/offers.test.ts](file:///C:/Users/anshu/Desktop/ClientWork/tests/offers.test.ts) | 7 | Flat vs %, min order limit, expiration checks |
| **CSRF** | [tests/csrf.test.ts](file:///C:/Users/anshu/Desktop/ClientWork/tests/csrf.test.ts) | 5 | Token generation, cryptographic cookie verification |
| **Booking** | [tests/booking.test.ts](file:///C:/Users/anshu/Desktop/ClientWork/tests/booking.test.ts) | 10 | Order creation, atomic counter, price verification |
| **Payments** | [tests/payments.test.ts](file:///C:/Users/anshu/Desktop/ClientWork/tests/payments.test.ts) | 6 | State machine transitions, webhook idempotency |
| **Razorpay** | [tests/razorpay.test.ts](file:///C:/Users/anshu/Desktop/ClientWork/tests/razorpay.test.ts) | 4 | Signature verification, tamper detection |
| **Billing** | [tests/billing.test.ts](file:///C:/Users/anshu/Desktop/ClientWork/tests/billing.test.ts) | 5 | 18% GST math, SGST/CGST/IGST, integer paise |
| **Invoice** | [tests/invoice.test.ts](file:///C:/Users/anshu/Desktop/ClientWork/tests/invoice.test.ts) | 3 | Sequential counter `INV-YYYY-XXXX`, PDF stream |
| **Order Status** | [tests/orderStatus.test.ts](file:///C:/Users/anshu/Desktop/ClientWork/tests/orderStatus.test.ts) | 4 | 6-stage lifecycle progression and restrictions |
| **Tracker** | [tests/tracker.test.ts](file:///C:/Users/anshu/Desktop/ClientWork/tests/tracker.test.ts) | 3 | Phone authorization check, stepper active state |
| **Vault** | [tests/vault.test.ts](file:///C:/Users/anshu/Desktop/ClientWork/tests/vault.test.ts) | 3 | Magic-byte `%PDF-` validation, access control |
| **Astro** | [tests/astro.test.ts](file:///C:/Users/anshu/Desktop/ClientWork/tests/astro.test.ts) | 6 | Planetary longitudes, 36-point Guna, Prashna |
| **CMS** | [tests/cms.test.ts](file:///C:/Users/anshu/Desktop/ClientWork/tests/cms.test.ts) | 5 | Banners, marquee, blogs, testimonials |
| **Panchang** | [tests/panchang.test.ts](file:///C:/Users/anshu/Desktop/ClientWork/tests/panchang.test.ts) | 3 | Database cache hit, miss caching, fallback |
| **Hardening** | [tests/hardening.test.ts](file:///C:/Users/anshu/Desktop/ClientWork/tests/hardening.test.ts) | 4 | Concurrency lock, order release, rate limits |
| **Total** | **17 Test Files** | **97** | **100% Passing** |

### 2. Live Cloud Deployment & Production Verification
- **Production URL**: [https://kanadjyotishkendra.vercel.app](https://kanadjyotishkendra.vercel.app)
- **Deployment Status**: `READY`, aliased to canonical production domain.
- **Database Engine**: Hosted PostgreSQL instance connected via Prisma Client with pooling.
- **Build Optimization**: Standalone server target compiled via Next.js with font and asset optimizations.

---

## Phase 15: Translation Override Subsystem & Full Admin String CMS (Client Condition 2)

### 1. Requirements & Architecture
Every line, word, label, menu item, button text, footer text, error message, and page content in both Hindi and English must be editable from the admin panel without requiring code deployments:
1. **Dynamic Database Override Layer**: Database table `TranslationOverride` storing `locale`, `namespace`, `key`, and custom `value`.
2. **Deterministic Merge**: `getMergedMessages(locale)` loads the base static JSON dictionary and merges active database overrides dynamically on top.
3. **Sub-5-Second Cache Propagation**: 5-second in-memory TTL combined with `revalidatePath("/", "layout")` and `dynamic = "force-dynamic"` ensuring instant serverless propagation across Vercel instances.
4. **Interactive Admin CMS Console**: Dedicated portal at `/admin/translations` supporting namespace filtering, full-text search, live editing, bulk save, and JSON exports.
5. **Committed SQL Migrations**: Switched from `prisma db push` to version-controlled `prisma migrate deploy` (`0_init`, `1_phase16_settings_chatbot`).

### 2. Implementation & File Structure
- **Prisma Schema** ([schema.prisma](file:///C:/Users/anshu/Desktop/ClientWork/prisma/schema.prisma)): Added `TranslationOverride` model with composite unique constraint `@@unique([locale, namespace, key])`.
- **Translation Engine** ([translationService.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/i18n/translationService.ts)): Core engine functions: `getMergedMessages`, `setDeepValue`, `invalidateTranslationCache`, `getAllTranslationsWithOverrides`, `saveTranslationOverride`, `deleteTranslationOverride`, `bulkSaveTranslationOverrides`.
- **next-intl Request Pipeline** ([request.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/i18n/request.ts)): Injected `getMergedMessages` so all `useTranslations` calls automatically serve merged database strings.
- **Admin Translation API Routes** ([route.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/app/api/admin/translations/route.ts), [bulk/route.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/app/api/admin/translations/bulk/route.ts)): Secured administrative CRUD endpoints using `guardApiAdmin()`.
- **Admin Management Interface** ([page.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/admin/translations/page.tsx), [AdminTranslationsManager.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/features/admin/translations/AdminTranslationsManager.tsx)): Live broadsheet editor with language toggle, namespace dropdown, search, unsaved change indicators, and JSON override download.

### 3. Verification & Tests
- **Vitest Unit Suite** ([tests/translations.test.ts](file:///C:/Users/anshu/Desktop/ClientWork/tests/translations.test.ts)) (14 tests): Verifies deep value injection, merging over base dictionaries, database error resilience, cache invalidation, and CRUD operations.
- **Playwright E2E Suite** ([tests-e2e/translations.spec.ts](file:///C:/Users/anshu/Desktop/ClientWork/tests-e2e/translations.spec.ts), [tests-e2e/translations-flow.spec.ts](file:///C:/Users/anshu/Desktop/ClientWork/tests-e2e/translations-flow.spec.ts)) (4 tests): Verifies public site localized strings, unauthenticated API blocking, admin login, saving an override live, verifying change reflection in a fresh browser context, and reverting to default.

---

## Phase 16: Extended Site Settings, AES-256-GCM Keys Vault, Rule-Based Chatbot (#43) & Maps (#27)

### 1. Requirements & Architecture
Fulfill client requirements for third-party credentials, zero-cost rule-based chatbot, and location mapping:
1. **AES-256-GCM Credential Vault**: All API secrets (Razorpay, MSG91, SMTP, Google/Facebook OAuth, AstroSage) are encrypted at rest in PostgreSQL and never returned unmasked by GET APIs (showing only `••••••••1234`).
2. **Two-Tier Precedence Hierarchy**: The system first resolves credentials from decrypted database settings; if unset, it falls back gracefully to `.env` variables.
3. **Zero-API-Cost Rule-Based Vedic Chatbot (#43)**: Fully deterministic keyword and token matcher running on server without paid third-party LLMs. Supports bilingual responses, quick reply chips, hit counters, and automatic fallback to WhatsApp or enquiry ticket.
4. **Google Maps Physical Location Page (#27)**: Dedicated `/contact` page with live Google Maps iframe embed (`GOOGLE_MAP_EMBED_URL`), physical Varanasi coordinates, consultation hours, and interactive enquiry intake form.
5. **Floating Quick-Action Bar**: Omnipresent floating button bar providing 1-click WhatsApp messaging, direct phone call, and embedded sliding Vedic Chatbot assistant.
6. **Inbound Enquiries Management**: Complete management console at `/admin/enquiries` for viewing, filtering, resolving, and archiving contact enquiries.

### 2. Implementation & File Structure
- **Security & Cryptographic Primitives** ([crypto.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/security/crypto.ts)): `encryptSecret`, `decryptSecret`, and `maskSecret` using Node.js `crypto` with `aes-256-gcm`, 96-bit initialization vectors, and 128-bit authentication tags.
- **Credential Resolver** ([credentials.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/config/credentials.ts)): `getCredential(key)` and `getMaskedCredentialsSummary()` providing unified access across DB and `.env`.
- **API Keys Admin Management** ([keys/route.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/app/api/admin/settings/keys/route.ts), [AdminKeysManager.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/features/admin/settings/AdminKeysManager.tsx), [page.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/admin/settings/keys/page.tsx)): Encrypted admin vault with category tabs (Payments, SMS, Email, Auth, Astro, Analytics, Maps), active status badges, and plaintext reveal toggles.
- **Chatbot Subsystem** ([schema.prisma](file:///C:/Users/anshu/Desktop/ClientWork/prisma/schema.prisma), [matcher.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/chatbot/matcher.ts), [ask/route.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/app/api/chatbot/ask/route.ts), [admin/chatbot/route.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/app/api/admin/chatbot/route.ts), [AdminChatbotManager.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/features/admin/chatbot/AdminChatbotManager.tsx), [page.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/admin/chatbot/page.tsx)): Database-backed Q&A editor and matcher with keywords, category filters, and quick reply chips.
- **Public Contact & Maps Subsystem** ([page.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/contact/page.tsx), [ContactClient.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/features/contact/ContactClient.tsx), [enquiry/route.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/app/api/contact/enquiry/route.ts)): Full-width contact page with iframe map embed and rate-limited enquiry form.
- **Enquiries CMS Console** ([AdminEnquiriesManager.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/features/admin/enquiries/AdminEnquiriesManager.tsx), [page.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/admin/enquiries/page.tsx), [api/admin/enquiries](file:///C:/Users/anshu/Desktop/ClientWork/src/app/api/admin/enquiries/route.ts)): Inbound message triage with status toggling (Pending/Resolved) and deletion.
- **Floating Action Bar** ([FloatingActionBar.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/components/layout/FloatingActionBar.tsx), [layout.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/layout.tsx)): Quick action bar floating widget with WhatsApp and Vedic Chatbot drawer.
- **Deployment Blueprint** ([.env.example](file:///C:/Users/anshu/Desktop/ClientWork/.env.example)): Fully commented production deployment guide with keys checklist.

### 3. Verification & Tests
All 20 Vitest test suites and 8 Playwright E2E tests pass with zero failures:

| Test Suite | File Path | Tests Passed | Focus Area |
| :--- | :--- | :---: | :--- |
| **Settings Keys** | [tests/settings-keys.test.ts](file:///C:/Users/anshu/Desktop/ClientWork/tests/settings-keys.test.ts) | 7 | AES-256-GCM encryption/decryption, corrupted tag rejection, secret masking, DB precedence over env |
| **Chatbot** | [tests/chatbot.test.ts](file:///C:/Users/anshu/Desktop/ClientWork/tests/chatbot.test.ts) | 4 | Greeting on empty query, Hindi/English keyword matching, confidence scoring, WhatsApp/ticket fallback |
| **Phase 16 E2E** | [tests-e2e/phase16.spec.ts](file:///C:/Users/anshu/Desktop/ClientWork/tests-e2e/phase16.spec.ts) | 4 | Contact form submission, map iframe, floating bar WhatsApp link, chatbot drawer Q&A, API role guards, admin keys vault |
| **Translations E2E** | [tests-e2e/translations-flow.spec.ts](file:///C:/Users/anshu/Desktop/ClientWork/tests-e2e/translations-flow.spec.ts) | 1 | Admin login, live string edit in DB, fresh context public reflection, revert to default |
| **All Test Suites** | **20 Vitest files + 3 Playwright specs** | **122 Unit + 8 E2E** | **100% Passing** |

