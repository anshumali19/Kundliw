# Maharshi Kanad Jyotish Kendra (महर्षि कणाद ज्योतिष केंद्र)
### Vedic Ephemeris & Astronomical Jyotish Siddhanta Web Platform

A high-precision, bilingual (Hindi & English) Vedic astrology and consultation web portal built to canonical specifications from Dashashwamedh Ghat, Varanasi.

🌐 **Live Production URL**: [https://kanad-jyotish-kendra.vercel.app](https://kanad-jyotish-kendra.vercel.app)

---

## 📚 Documentation Directory

Complete system and operational documentation is organized in the [`docs/`](file:///C:/Users/anshu/Desktop/ClientWork/docs) directory:

| Document | Description | Path |
| :--- | :--- | :--- |
| **System Architecture** | High-level architecture, design system, Lenis scroll engine, state machine, and provider patterns | [docs/ARCHITECTURE.md](file:///C:/Users/anshu/Desktop/ClientWork/docs/ARCHITECTURE.md) |
| **REST API Reference** | Complete endpoint documentation, request/response payloads, and authentication guards | [docs/API_DOCUMENTATION.md](file:///C:/Users/anshu/Desktop/ClientWork/docs/API_DOCUMENTATION.md) |
| **Database Schema** | Complete Prisma PostgreSQL models, relations, field dictionaries, and Mermaid ER diagram | [docs/DATABASE_SCHEMA.md](file:///C:/Users/anshu/Desktop/ClientWork/docs/DATABASE_SCHEMA.md) |
| **Deployment Guide** | Vercel production deployment, PostgreSQL setup, environment variables, and custom domains | [docs/DEPLOYMENT_GUIDE.md](file:///C:/Users/anshu/Desktop/ClientWork/docs/DEPLOYMENT_GUIDE.md) |
| **Administrator Manual** | Operating manual for Kendra staff managing services, orders, vault, coupons, and content | [docs/ADMIN_MANUAL.md](file:///C:/Users/anshu/Desktop/ClientWork/docs/ADMIN_MANUAL.md) |
| **Engineering Handoff** | Production integration instructions for SMS, Razorpay, Swiss Ephemeris, and AWS S3 | [HANDOFF.md](file:///C:/Users/anshu/Desktop/ClientWork/HANDOFF.md) |

---

## 🌟 Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Smooth Scrolling**: Lenis (`lenis/react`) configured at root layout (`lerp: 0.1`, `duration: 1.2`)
- **Styling**: Tailwind CSS with custom Vedic Broadsheet design system (editorial serifs, saffron/maroon accents, 44px min touch targets, left-aligned full-width layouts)
- **Internationalization**: `next-intl` (all copy in `messages/hi.json` and `messages/en.json`, zero hardcoded UI strings)
- **Database & ORM**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js / Auth.js (Credentials OTP with rate-limiting, Admin Email/Password with lockout, Google OAuth ready)
- **Billing & Tax**: Sequential GST Invoice numbering (`INV-YYYY-XXXX`), PDFKit invoice generation with "DEMO INVOICE" watermark
- **Astro Subsystems**: Vedic ephemeris calculations, 8-Pillar Ashtakoot Gun Milan, Prashna horary form, daily Panchang with database caching
- **Private Storage**: Magic-bytes validation (`%PDF-`, PNG, JPEG, WEBP), 10MB upload ceiling, customer Kundli Vault
- **Testing**: Vitest suite with 97 passing unit tests across 17 test suites

---

## 🚀 Quickstart & Demo Setup

### 1. Prerequisites
- **Node.js**: v18.18.0 or later
- **PostgreSQL**: Local or hosted database instance running at port 5432

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure the demo flags are set:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kanad_jyotish_dev?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev_secret_key_at_least_32_characters_long_for_kanad_demo"
DEMO_MODE="true"
NODE_ENV="development"
INITIAL_ADMIN_PASSWORD="ChangeMeInAdminSettings@2026"
```

### 3. Install & Initialize Database
```bash
# 1. Install dependencies
npm install

# 2. Push schema to PostgreSQL
npx prisma db push

# 3. Generate Prisma client
npx prisma generate

# 4. Run the comprehensive demo seed dataset
npx ts-node prisma/seed.ts
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Login Credentials

The seed script creates realistic demo accounts with pre-populated orders across all 6 canonical statuses and sample vault documents:

### Administrator Account
- **URL**: [http://localhost:3000/en/auth/signin](http://localhost:3000/en/auth/signin) (toggle "Admin Login" tab)
- **Email**: `admin@kanad-jyotish.in`
- **Password**: `ChangeMeInAdminSettings@2026`
- **Phone**: `+919999900001` (demo fake phone)
- **Access**: Full Admin CMS (`/admin`), Services & Plans CRUD, Coupon Management, Order Lifecycle Transitions, Customer Vault Uploads, Promotional Banners, Marquee Announcements, Static Pages, Articles, Reviews, and Kendra Settings.

### Customer Account
- **URL**: [http://localhost:3000/en/auth/signin](http://localhost:3000/en/auth/signin) (Mobile OTP tab)
- **Phone**: `+919999900002` (demo fake phone)
- **Sign-in Method**: Mobile OTP only. In development, click "Send OTP" and the 6-digit code prints to the terminal console (or use demo code `123456`).
- **Security Rule**: In strict compliance with Kendra security guidelines, customer accounts sign in exclusively via Mobile OTP. Email and password authentication is strictly reserved for administrative personnel.
- **Pre-seeded Data**: 6 demo consultation orders representing each lifecycle stage, downloadable GST invoices, and an authenticated Kundli PDF dossier in `/vault`.

### Optional Demo Portal Passkey Gate
If `DEMO_ACCESS_PASSWORD` is defined in `.env`:
- Unauthenticated visitors are redirected to `/[locale]/demo-gate`.
- Entering the configured passkey grants a secure 7-day session cookie (`demo_access`).
- Leave `DEMO_ACCESS_PASSWORD=""` (default) to disable the gate.

---

## 🗺️ Key Routes & Features Walkthrough

### 1. Public & Free Astrological Calculators
- **Homepage (`/`)**: Ephemeris bar with daily Panchang widget, hero callouts, Vedic lineage overview, service catalog, and customer reviews.
- **Daily Almanac (`/panchang`)**: Full 5-limb Vedic ephemeris (Tithi, Vaar, Nakshatra, Yoga, Karana), Abhijit Muhurat, Rahu Kaal, Sunrise/Sunset, and Samvat details with date selector.
- **Janampatri Calculator (`/kundli`)**: Free Vedic chart computation, 9-planet coordinates, ascendant, Vimshottari Mahadasha, and direct booking upsell. Matches canonical broadsheet dashboard interface.
- **Horoscope Matching (`/kundli/matching`)**: 36-Guna Ashtakoot Milapak calculator with Manglik and Nadi Dosha review.
- **Horary Prashna (`/kundli/prashna`)**: Horary question intake dashboard logging a `PRASHNA_KUNDLI` order for Pandit examination.

### 2. Consultation Booking & Payments (Phases 3 to 6)
- **Services Catalog (`/services`)**: Filterable service listings with plans in Paise.
- **Service Detail (`/services/[slug]`)**: Plan comparisons, delivery timelines, consultation inclusions, and customer reviews.
- **Booking Flow (`/booking`)**: 3-step wizard with atomic slot locking, coupon validation, jataka form pre-filling, and payment mode selection.
- **Demo Checkout (`/booking/checkout/[id]`)**: Full-page checkout with "Simulate Success" and "Simulate Failure" buttons executing genuine state-machine transitions.
- **Manual Payments**: Direct UPI VPA transfer, bank NEFT/RTGS details, and QR code upload with admin audit verification.
- **GST Invoices (`/api/invoice/[id]`)**: Authenticated server-generated PDF invoices with sequential numbering.

### 3. Order Lifecycle Tracker & Vault (Phases 7 to 8)
- **Customer Dashboard (`/account`)**: Order history, current stage badges, and invoice downloads.
- **Public Order Tracker (`/track`)**: Rate-limited tracking portal requiring Order Number + Phone Number. Stepper tracks all 6 canonical stages:
  1. `ORDER_RECEIVED`
  2. `KUNDLI_IN_PROGRESS`
  3. `KUNDLI_COMPLETE`
  4. `DISPATCHED` (with courier name and tracking code)
  5. `DELIVERED`
  6. `EXECUTION_COMPLETE`
- **Customer Kundli Vault (`/vault`)**: Authenticated document repository for downloading archival PDF charts.

### 4. Admin CMS Control Center (Phase 10)
- **Services & Plans (`/admin/services`)**: Bilingual title/description editing, rupee-to-paise conversion, inclusions management.
- **Offers & Coupons (`/admin/offers`)**: Flat or percentage discount coupons with usage ceilings and validity windows.
- **Orders Manager (`/admin/orders`)**: Stage updates, audit notes, courier dispatch tracking, manual payment verification/rejection.
- **Customer Vault Manager (`/admin/vault`)**: PDF upload with magic-bytes verification and customer account assignment.
- **Banners (`/admin/banners`)**: Top/Bottom/Left/Right banners with local file upload.
- **Marquee Notices (`/admin/marquee`)**: Bilingual announcements, scroll speeds, and px font sizes.
- **Static Pages (`/admin/pages`)**: Bilingual content for About, Founder Lineage, Help, and Legal pages.
- **Articles & Blogs (`/admin/blogs`)**: Publishing astrological treatises and essays.
- **Customer Testimonials (`/admin/testimonials`)**: Client reviews with verified client badge toggling.
- **Media Gallery (`/admin/gallery`)**: Photo uploads for the sanctum archive.
- **Settings (`/admin/settings`)**: Real contact numbers (+91-9827991224, +91-7509124672), bank accounts, UPI VPA, QR code, and GSTIN.

---

## 🧪 Automated Test Suite

Run the complete test suite with Vitest:
```bash
npm test
```
The project includes **97 passing tests across 17 suites**:
- `tests/auth.test.ts`: Role guards, session token policies, admin password validation
- `tests/otp.test.ts`: OTP hashing, rate-limiting per phone and IP, expiry checks
- `tests/services.test.ts`: Rupee/paise conversions, service/plan CRUD validations
- `tests/offers.test.ts`: Discount calculations, usage limit enforcement
- `tests/hardening.test.ts`: Atomic conditional slot/offer updates, order expiry release
- `tests/booking.test.ts`: Idempotency keys, booking state machine
- `tests/payments.test.ts`: Demo payment provider state transitions, manual verification
- `tests/razorpay.test.ts`: HMAC-SHA256 signature verification, webhook deduplication
- `tests/invoice.test.ts`: Sequential invoice numbering, GST tax math
- `tests/orderStatus.test.ts`: 6-stage lifecycle transitions, audit note logs
- `tests/tracker.test.ts`: Rate limits, strict privacy guarding against number enumerations
- `tests/vault.test.ts`: PDF magic-bytes `%PDF-` verification, 10MB upload ceiling, ownership checks
- `tests/astro.test.ts`: AstroProvider demo outputs, AstroSage production guards, Kundli/Matching
- `tests/cms.test.ts`: Canonical SRS contact numbers, banner/marquee/testimonial rules
- `tests/panchang.test.ts`: Ephemeris output validation, database cache hit/miss logic
- `tests/csrf.test.ts`: Server-side state and token protections

Check TypeScript types and ESLint:
```bash
npm run typecheck
npm run lint
```
