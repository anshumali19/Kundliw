---
title: Project Documentation
subtitle: Maharshi Kanad Jyotish Kendra - Website and Admin Platform
version: 1.0
audience: Client, developers and future maintainers
---

# 1. Introduction

## 1.1 Purpose of this document

This document describes the Maharshi Kanad Jyotish Kendra web platform: what it does, how it is built, how it is run and how it is kept safe. It is the main handover document. A separate manual, "Admin Panel Manual", explains day-to-day use for the Kendra's staff.

## 1.2 The project in one paragraph

The platform lets visitors learn about the Kendra's Vedic astrology services, see the day's Panchang, use free Kundli and Kundli-matching tools, book a service online, pay by UPI or bank transfer, upload their Kundli, and follow the progress of their order. The Kendra manages everything through a private Admin Panel without touching code. An associate (referral partner) programme lets partners earn commission on bookings they bring. The site works in Hindi (default) and English and is designed to work well on phones.

## 1.3 Who uses it

| Role | What they can do |
|---|---|
| Visitor | Browse services, Panchang, tools, blog, gallery, certificates; contact the Kendra; chat with the assistant |
| User (customer) | Everything a visitor can, plus book and pay, upload files, track orders, download invoices |
| Associate | Share a referral link, see referrals and commission, request payouts |
| Super Admin | Full control of content, orders, payments, settings, associates, backups |

# 2. Feature summary

## 2.1 Public website

- Home page with a one-line bar showing time, day, date, paksha, tithi, lunar month and Vikram Samvat (calculated daily by the site).
- Services and plans, service detail pages, Other services.
- Panchang, Kundli and Kundli-matching pages using AstroSage's free tools embedded in the page, each switchable on or off by the admin.
- Prashna Kundli request form.
- Offers page, certificates (GST, MSME, Trademark, ISO) with view, download and print.
- Blog (articles), gallery, reviews, FAQ, founder page, help, contact page with map and enquiry form.
- Social media links with icons (YouTube, WhatsApp, Facebook, Instagram, Twitter/X, LinkedIn, Telegram) controlled by the admin.
- Floating Call, WhatsApp, AI and Chat buttons (two on each side) that slide away while scrolling.
- AI-assisted chat widget with admin-managed answers.
- Mobile bottom bar (Home, Menu, Services, Booking, Offers, Account) and a menu sheet.
- Scrolling notice strip that visitors can pause and close.

## 2.2 Booking and payment

1. The customer chooses a service and plan and signs in.
2. Birth details are entered (and a partner's details for matching).
3. Plans that include a consultation call require a free appointment slot.
4. A promo code may be applied; the server checks minimum order, services, dates, usage limits and the customer's own usage.
5. The price is computed on the server (never trusted from the browser) with GST.
6. The customer pays by the Kendra's UPI, QR or bank details and submits the reference (and optional screenshot).
7. The admin verifies the payment, which creates the invoice; the admin then moves the order through its stages.
8. The customer tracks the order, receives files in their vault and downloads the invoice.

Online card or UPI payment through Razorpay is prepared on the server side but needs the Kendra's Razorpay account and keys before it can be switched on.

## 2.3 Customer account and vault

- Sign in by mobile OTP, email and password, or Google.
- A private vault where the customer uploads their Kundli (PDF, images, video, audio, Word, Excel, PowerPoint, text; up to 4 MB). A preview appears beside the upload button; Word and Excel files download.
- Orders list, invoice download, logout.

## 2.4 Associate programme

Registration with approval (or automatic approval), a personal referral link and QR, commission rules per service or plan, personal commission overrides, a commission life cycle (Pending, Earned, Paid, Cancelled), payout details and payout requests with a minimum amount.

## 2.5 Admin Panel

A grouped sidebar with: Dashboard; Orders, Services and plans, Other services, Appointment slots, Promo codes, Enquiries; Users, Associates, Customer files; Website settings (15 sections), Banners, Scrolling notice, Pages and legal, Articles, Gallery, Reviews, FAQ, Founder, Certificates, Translations, Chatbot; Business settings, API keys and Analytics, Backups. See the Admin Panel Manual.

# 3. Architecture

## 3.1 Overview

```
 Visitor / Customer / Admin (browser, phone, Android WebView)
                |
        HTTPS  v
   +----------------------------+
   |  Next.js application       |   Pages (server rendered), API routes,
   |  (hosted on Vercel)        |   proxy for locale and route guards
   +--+----------+----------+---+
      |          |          |
      v          v          v
  PostgreSQL   Vercel Blob   Outside services
  (Prisma)     (uploads)     Razorpay, MSG91, SMTP, Google sign-in,
                             AstroSage embeds, Gemini AI, OpenStreetMap
```

## 3.2 Technology

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 3 with a colour-token palette (saffron, maroon, yellow, red on cream) |
| Languages | next-intl (Hindi default, English) plus admin-editable translation overrides |
| Database | PostgreSQL through Prisma 5 (migrations in /prisma/migrations) |
| Sign-in | NextAuth 4 with JWT sessions: mobile OTP, email and password, Google |
| Validation | Zod schemas on every API input |
| File storage | Vercel Blob (private); local disk for development |
| PDF | pdfkit for invoices |
| Tests | Vitest (unit and API-level tests) |
| Hosting | Vercel (cron jobs configured in vercel.json) |

## 3.3 Folder map

| Folder | Contents |
|---|---|
| src/app/[locale] | Public and admin pages |
| src/app/api | API routes (auth, booking, payments, vault, admin, cron, health) |
| src/components | Shared interface parts (header, footer, menus, banners, viewers) |
| src/features | Feature modules (booking, admin screens, auth, contact, associates) |
| src/lib | Business logic (booking, offers, payments, associates, backups, Panchang, site settings, storage) |
| prisma | Database schema, migrations and seed |
| messages | Hindi and English text |
| docs | Documentation (this handbook, guides, legal drafts, client documents) |
| tests | Automated tests |
| android-app | Android WebView wrapper |

## 3.4 Key design decisions

- Prices, discounts and GST are always computed on the server from database records.
- Money is stored in paise (integers) to avoid rounding errors.
- Orders reserve appointment slots and promo-code usage for 30 minutes; unpaid reservations are released automatically.
- Everything the Kendra may want to change lives in the database (Website settings, Pages, Banners and so on), not in code.
- The Panchang is calculated from the Sun's and Moon's positions (Lahiri ayanamsha, Varanasi), so it needs no outside service.

# 4. Data model

The database holds these main groups of records (Prisma models).

| Group | Models |
|---|---|
| Accounts | User, Account, VerificationToken, OtpVerification, RateLimit |
| Catalogue | Service, Plan, OtherService, Offer |
| Orders and payments | Order, OrderStatusEvent, Slot, Counter, ProcessedWebhookEvent |
| Customer files | VaultFile |
| Associates | AssociateProfile, CommissionRule, Commission, PayoutRequest |
| Content | StaticPage, BlogPost, Banner, MarqueeItem, MediaGalleryItem, Testimonial, FaqItem, FounderProfile, Credential, TranslationOverride, ChatbotQA, ContactEnquiry |
| Settings | AdminSettings (business, payment, map, associate rules, backups), SiteConfig (website settings sections) |
| Operations | BackupRecord, PanchangCache |

Migrations 0 to 10 are applied automatically at each deployment (the build runs "prisma migrate deploy").

# 5. Security

| Area | How it is protected |
|---|---|
| Passwords | Stored only as bcrypt hashes |
| Sessions | Signed JWT cookies, HTTP-only, secure |
| Roles | Server-side checks on every admin, associate and customer API; admin pages re-check the role in the database |
| Cross-site requests | Origin check (CSRF protection) on every state-changing API |
| Brute force | Database-backed rate limits on login, OTP, coupon checks, uploads, tracking; admin lockout after repeated failures |
| Input | Zod validation on all input; links are limited to safe web addresses |
| Uploads | File type is verified from the file's actual content (not its name); executable, HTML and SVG files are refused; size limits; files are private and served only to the owner or admin with safe headers |
| Secrets | Third-party keys saved in the admin panel are encrypted at rest (AES-256-GCM) and never shown or exported; backups exclude secrets and password hashes |
| Payments | Amounts come from the server; webhooks are signature-checked and processed once |
| Headers | HSTS, no framing of the site, no content-type sniffing, strict referrer policy |
| Privacy | Customer files and details are visible only to the customer and the admin; the legal pages describe use of data |
| Backups | Automatic daily, weekly and monthly copies stored in the database; manual and downloadable copies |

# 6. External services and configuration

## 6.1 Services

| Service | Purpose | Account owner | Cost |
|---|---|---|---|
| Vercel | Hosting, cron jobs, file storage | Kendra | Free tier exists, but a paid plan is advised for a business |
| PostgreSQL (Prisma Postgres) | Database | Kendra | Free tier then paid |
| Razorpay | Online payments (optional until keys exist) | Kendra | Per-transaction fee |
| MSG91 | OTP by SMS (needs DLT registration in India) | Kendra | Per SMS |
| Gmail or SMTP | Order emails | Kendra | Free with a Gmail App Password (limits apply) |
| Google Cloud | Sign in with Google | Kendra | Free |
| Google Analytics and Search Console | Visitor statistics and search presence | Kendra | Free |
| Gemini (Google AI) | Chat assistant answers | Kendra | Free tier with limits |
| AstroSage | Free Panchang, Kundli and Matching tools shown inside pages | AstroSage | Free (no key) |
| OpenStreetMap or Google Maps | Map | none or Kendra | Free |

## 6.2 Environment variables

Set in the hosting dashboard. Values saved in the Admin Panel (API keys) take priority over these.

| Variable | Purpose |
|---|---|
| DATABASE_URL | Database connection |
| NEXTAUTH_SECRET, NEXTAUTH_URL | Session signing key and the public address of the site |
| CREDENTIALS_ENCRYPTION_KEY | Key used to encrypt API keys saved in the admin panel |
| INITIAL_ADMIN_PASSWORD | Password for the first admin account |
| CRON_SECRET | Authorises the scheduled jobs |
| BLOB_READ_WRITE_TOKEN | File storage (set automatically by Vercel Blob) |
| GEMINI_API_KEY | AI chat |
| RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET | Online payment |
| MSG91_AUTH_KEY (and sender and template) | OTP SMS |
| SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM | Email |
| GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET | Google sign-in |
| NEXT_PUBLIC_GA_MEASUREMENT_ID | Google Analytics (or set it in the admin panel) |
| DEMO_MODE | Developer switch for sample behaviour; keep it off for a fully live launch once SMS and storage are configured |

> Keys must never be placed in the code or sent in messages. Enter them in the hosting dashboard or in Admin, API keys and Analytics.

# 7. Deployment and operations

## 7.1 How a release happens

1. Code is committed to the main branch of the repository.
2. Vercel builds automatically: it applies database migrations, then builds the site.
3. If the build succeeds, the new version goes live in a few minutes. If it fails, the old version stays online.

## 7.2 Scheduled jobs

| Job | Time (UTC) | What it does |
|---|---|---|
| expire-orders | 02:00 daily | Releases unpaid reservations (slots and promo uses) |
| backup | 20:30 daily (02:00 India) | Creates a daily backup, plus weekly on Sundays and monthly on the 1st, and removes old copies |

## 7.3 Health check

The address /api/health returns {"status":"ok"} when the site and database are working. It can be used with a free uptime monitor.

## 7.4 Backups and restore

- Content and records are copied to the database daily and can be downloaded as JSON from Admin, Backups.
- Uploaded files live in file storage and should be backed up separately if they are critical.
- Restore is performed by the developer from a chosen backup.
- The hosting database provider also keeps its own point-in-time backups according to its plan.

## 7.5 Monitoring and maintenance

- Check the Vercel dashboard for failed builds and errors.
- Review Google Analytics monthly.
- Update dependencies and apply security patches every quarter.
- Renew the domain yearly.

# 8. Quality assurance

- More than 540 automated tests cover pricing and GST, promo-code rules, booking and slots, payments and webhooks, order status rules, associates and commissions, uploads and file-type checks, backups, site settings, Panchang calculation and security checks.
- Every release is checked with the linter, the type checker and the full test suite.
- Key flows were exercised end to end on a production build: registration, sign-in, booking, payment proof, admin approval, status updates, tracking, invoice, vault upload, associates, backups and settings.

# 9. Known limitations and next steps

| Item | Status | Needed to complete |
|---|---|---|
| Online payment (Razorpay) | Prepared, not yet switched on | Razorpay account, keys, and about one day to connect and test |
| Mobile OTP by SMS | Needs a provider | MSG91 account, DLT registration, keys |
| Uploads | Up to 4 MB per file (hosting limit) | A larger plan or direct-to-storage upload if bigger files are needed |
| Word and Excel preview | Downloaded, not previewed in the browser | Not planned |
| Free tools | Embedded from AstroSage and subject to their availability | Admin can change the address or switch the page off |
| Hindi legal pages | The approved texts are in English | Hindi translation after the lawyer approves |
| Native mobile app | A WebView app exists; a full React Native app is planned | See the App Development Plan |

# 10. Handover checklist

Accounts and access:

- [ ] Domain bought in the Kendra's name and connected
- [ ] Hosting (Vercel) and database accounts in the Kendra's name
- [ ] Admin password changed from the initial one
- [ ] Razorpay, MSG91, Gmail App Password, Google keys, own Gemini key entered
- [ ] Google Analytics and Search Console set up

Content:

- [ ] Real address, phone, email, UPI, bank, GSTIN entered
- [ ] Logo, social links, certificates uploaded
- [ ] Legal pages approved by the lawyer and published
- [ ] Services, plans and appointment slots reviewed

Launch tests:

- [ ] A real booking and payment test (small amount)
- [ ] OTP login test on a real phone
- [ ] Invoice, tracking and email checks
- [ ] A backup downloaded and stored safely

# 11. Glossary

| Term | Meaning |
|---|---|
| Panchang | The Hindu almanac: tithi, nakshatra, yoga, karana and timings |
| Tithi, Paksha | Lunar day and the bright (Shukla) or dark (Krishna) half of the month |
| Vikram Samvat | The Hindu calendar year count |
| Kundli, Janampatri | Birth chart |
| Prashna Kundli | Chart cast for the moment a question is asked |
| Vault | The customer's private file area |
| Slot | A bookable time for a consultation call |
| Associate | A referral partner who earns commission |
| UTR | The reference number of a bank or UPI payment |
| GST | Goods and Services Tax |
| Webhook | An automatic message from the payment provider confirming a payment |
| Migration | A versioned change to the database structure |

# 12. Document set

| Document | Use |
|---|---|
| Project Documentation (this document) | Overview, architecture, security, operations |
| Admin Panel Manual | Daily use of the Admin Panel |
| Free and Paid Services guide | What costs money and what is free |
| App Development Plan | Plan for the native mobile app |
| Legal drafts and client documents | Privacy, terms and related texts |
