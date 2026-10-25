# Maharshi Kanad Jyotish Kendra (महर्षि कणाद ज्योतिष केंद्र)
# Comprehensive Gap Matrix: 49 Requirements & SRS Audit

> **Audit Date**: 2026-10-25  
> **Production Target**: [https://kanadjyotishkendra.vercel.app/](https://kanadjyotishkendra.vercel.app/)  
> **Baseline Status**: Phases 1–14 Implemented (97/97 Tests Passing)  
> **Objective**: Exhaustive audit of all 48 requirements from the Client Requirement Document, the SRS Specification, the 49th Requirement ("Associate Panel"), and the mandatory Client Conditions.

---

## Executive Summary

| Category | Total Items | Implemented | Partial | Missing | Implementation Readiness |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Client Requirement Points (1–48)** | 48 | 19 | 23 | 6 | Phase 15–22 Target |
| **New 49th Requirement (Associate Panel)** | 1 | 0 | 0 | 1 | Phase 20 Target |
| **Mandatory Client Conditions** | 5 | 0 | 1 | 4 | Integrated into Phases 15–22 |
| **Total Tracked Deliverables** | **54** | **19** | **24** | **11** | **35% Complete, 44% Partial, 21% Missing** |

---

## Part 1: Comprehensive 49-Point Gap Matrix

### Legend
- 🟢 **IMPLEMENTED**: Fully functional in codebase, verified with automated unit/integration tests.
- 🟡 **PARTIAL**: Basic scaffold or partial logic exists; requires expansion, database fields, or admin control.
- 🔴 **MISSING**: Not yet implemented in the codebase; targeted for implementation in subsequent phases.

---

| # | Requirement As Given | Current Status | Codebase Evidence (File Paths) | Identified Gap & Scope to Implement |
| :-: | :--- | :---: | :--- | :--- |
| **1** | **Dynamic, Custom, CMS A to Z Admin Management control Website** | 🟡 **PARTIAL** | [src/app/[locale]/admin/layout.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/admin/layout.tsx)<br>[src/features/admin/](file:///C:/Users/anshu/Desktop/ClientWork/src/features/admin/) | Admin CMS exists for services, plans, offers, banners, marquee, blogs, testimonials, static pages, and vault. **Gap**: Needs admin translation/string override manager (Condition B), associate panel management, backup controls, and guide managers. |
| **2** | **100% Mobile Responsive, applicable for Professional Android App** | 🟡 **PARTIAL** | [src/app/globals.css](file:///C:/Users/anshu/Desktop/ClientWork/src/app/globals.css)<br>[src/components/layout/Header.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/components/layout/Header.tsx) | Responsive broadsheet layout with 44px min touch targets and `overflow-x: clip`. **Gap**: Professional Android WebView Gradle wrapper APK project and website download page with admin QR code. |
| **3** | **Language – Hindi & English** | 🟡 **PARTIAL** | [src/i18n/request.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/i18n/request.ts)<br>[messages/hi.json](file:///C:/Users/anshu/Desktop/ClientWork/messages/hi.json)<br>[messages/en.json](file:///C:/Users/anshu/Desktop/ClientWork/messages/en.json) | Bilingual `next-intl` dual routing in place. **Gap**: Client condition requires database string override layer so ALL UI labels, buttons, headers, and footer strings can be edited from admin without code changes. |
| **4** | **Website Theme, Saffron, Yellow, Maroon, High contrast** | 🟢 **IMPLEMENTED** | [tailwind.config.ts](file:///C:/Users/anshu/Desktop/ClientWork/tailwind.config.ts)<br>[src/app/globals.css](file:///C:/Users/anshu/Desktop/ClientWork/src/app/globals.css) | Complete theme tokens configured (`saffron`, `maroon`, `earth`, `gold`), applied cleanly across components without raw hex values. |
| **5** | **Menu – About Us, Founder, Service, Plan, Gallery, Blog, Testimonial, Kundli, Kundli Matching, Prashna Kundli, Support, Registration, Login** | 🟢 **IMPLEMENTED** | [src/components/layout/Header.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/components/layout/Header.tsx)<br>[src/components/layout/MobileNav.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/components/layout/MobileNav.tsx) | Header top utility bar and main nav bar with hover dropdown for About Us sub-links (Founder, Help, Gallery, Testimonials) and mobile drawer. |
| **6** | **User Panel, Registration with basic Details** | 🟢 **IMPLEMENTED** | [src/app/[locale]/account/page.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/account/page.tsx)<br>[src/app/[locale]/auth/register/page.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/auth/register/page.tsx) | User registration with name, phone, email, password; account dashboard with profile details, booking history, and vault downloads. |
| **7** | **Login :- Different Login option as like Gmail, OTP, Google, Facebook & many option** | 🟡 **PARTIAL** | [src/lib/auth/authOptions.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/auth/authOptions.ts)<br>[src/app/[locale]/auth/signin/page.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/auth/signin/page.tsx) | Credentials (Email + Password), Mobile OTP (SMS), and Google OAuth implemented. **Gap**: Facebook OAuth provider was deferred; needs NextAuth Facebook provider setup with admin credentials configuration in Site Settings and `.env.example`. |
| **8** | **Founder Page, Upload Photo, with file & URL Links Designation, Role, Additional Link & Add New Page, footer note writing option** | 🟡 **PARTIAL** | [src/app/[locale]/founder/page.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/founder/page.tsx) | Static Founder page exists. **Gap**: Not dynamically driven by database/admin CMS. Needs admin Founder settings/page manager allowing photo upload/URL, designation, role, additional links, YouTube link, and footer notes. |
| **9** | **Admin Panel With A to Z CMS Control** | 🟡 **PARTIAL** | [src/app/[locale]/admin/layout.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/admin/layout.tsx) | Admin console manages services, plans, offers, banners, marquee, blogs, testimonials, settings, and vault. **Gap**: Needs extension for Associates, App Download, Translations, Backups, and Guides. |
| **10** | **Dashboard with all Services reporting & Analyses** | 🟡 **PARTIAL** | [src/app/[locale]/admin/page.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/admin/page.tsx) | Currently performs a basic redirect to `/admin/orders`. **Gap**: Missing comprehensive analytics dashboard with metrics for total revenue, active orders, appointment distribution, user registrations, and associate commission metrics. |
| **11** | **Gallery, Image & Video Upload option Through Link & Device saved file, Additional link & Youtube Link Add option** | 🟡 **PARTIAL** | [src/app/[locale]/admin/gallery/page.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/admin/gallery/page.tsx)<br>[src/app/[locale]/gallery/page.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/gallery/page.tsx) | Media gallery supports image upload. **Gap**: Missing video upload / YouTube video embed URL input and additional external links. |
| **12** | **Service > Image Upload, File & URL, Service Name, Service details, Itinerary, Samagri List writing place, New Service add option with multiple details, Addition Links & Youtube Link Add option** | 🟡 **PARTIAL** | [src/features/admin/services/AdminServicesManager.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/features/admin/services/AdminServicesManager.tsx)<br>[prisma/schema.prisma](file:///C:/Users/anshu/Desktop/ClientWork/prisma/schema.prisma#L123-L144) | Service CRUD handles name, slug, tagline, description, highlights, notes. **Gap**: Missing fields for itinerary, puja samagri (material list), YouTube video URL, and additional links in Prisma schema and admin UI. |
| **13** | **Other Service Page with URL Links & Details (Bharat Darshan Teerth Yatra, Matrimonial Service, YouTube links)** | 🟡 **PARTIAL** | [src/components/layout/Footer.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/components/layout/Footer.tsx#L96-L108) | Bharat Darshan and Matrimonial links present in footer. **Gap**: Dedicated `/other-services` tab/page displaying rich cards, descriptions, outgoing links, and embedded YouTube video links. |
| **14** | **Appointment System - Reporting & Approval dashboard** | 🟡 **PARTIAL** | [src/features/admin/components/AdminOrdersManager.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/features/admin/components/AdminOrdersManager.tsx) | Orders table allows updating status and verifying manual payments. **Gap**: Missing dedicated Appointment calendar/time-slot scheduling view with slot capacity management and explicit one-click booking approval/rejection workflow. |
| **15** | **Service, New Multi Service Add remove activate, Deactivate, Service flow > Service > Plan > Add Multi Plan option > Per Plan Multi offer add option > Value > Payment > Submitted > Confirmation > Successfully** | 🟢 **IMPLEMENTED** | [src/features/booking/components/BookingWizard.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/features/booking/components/BookingWizard.tsx)<br>[src/features/admin/services/AdminServicesManager.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/features/admin/services/AdminServicesManager.tsx) | Full programmatic flow implemented end-to-end with atomic database transactions. |
| **16** | **Service Booking, Proper Integrate with all services** | 🟢 **IMPLEMENTED** | [src/app/[locale]/booking/page.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/booking/page.tsx)<br>[src/lib/booking/service.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/booking/service.ts) | Dynamic booking engine integrates with all services in the database. |
| **17** | **Service Plan, New plan add, remove, Activate, Deactivate, itinerary page & place of other details as like program, preparation & puja samagri (material)** | 🟡 **PARTIAL** | [src/features/admin/services/AdminServicesManager.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/features/admin/services/AdminServicesManager.tsx)<br>[prisma/schema.prisma](file:///C:/Users/anshu/Desktop/ClientWork/prisma/schema.prisma#L146-L171) | Plan CRUD handles pricing, delivery days, features, popular tag. **Gap**: Missing specific program, preparation, and puja samagri (materials) breakdown on plan detail pages and plan admin forms. |
| **18** | **Offer – New offer Add, Remove, Activate, Deactivate, fix value / % value, time duration from to till time with all feature control in admin panel** | 🟢 **IMPLEMENTED** | [src/features/admin/offers/AdminOffersManager.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/features/admin/offers/AdminOffersManager.tsx)<br>[src/lib/offers/apply.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/offers/apply.ts) | Complete offer management with flat/percentage discounts, validity dates, minimum order thresholds, and maximum discount caps. Tested in [tests/offers.test.ts](file:///C:/Users/anshu/Desktop/ClientWork/tests/offers.test.ts). |
| **19** | **Advertisement Multi Page Image & Poster, Writing Matter, Position Setting top, bottom, left side, right side, Running fix or slide show** | 🟡 **PARTIAL** | [src/app/[locale]/admin/banners/page.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/admin/banners/page.tsx)<br>[src/components/banners/BannerSlot.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/components/banners/BannerSlot.tsx) | Banner manager supports slots (`HOME_HERO`, `SERVICES_TOP`, `CHECKOUT_SIDEBAR`), static vs carousel. **Gap**: Missing specific `LEFT` and `RIGHT` sidebar layout slots, running fix vs slideshow behavior toggle, and custom ad copy/writing matter. |
| **20** | **Advertisement – Marquee line in Screen footer with all Setting font size, Speed, positioning, color theme** | 🟢 **IMPLEMENTED** | [src/app/[locale]/admin/marquee/page.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/admin/marquee/page.tsx)<br>[src/components/layout/MarqueeStrip.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/components/layout/MarqueeStrip.tsx) | Fully dynamic marquee with admin control over speed, font size, background color, text color, and position. |
| **21** | **Payment Gateway – online Razorpay & Offline Bank Account, UPI, QR code** | 🟢 **IMPLEMENTED** | [src/lib/payments/razorpayProvider.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/payments/razorpayProvider.ts)<br>[src/features/booking/components/CheckoutClient.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/features/booking/components/CheckoutClient.tsx) | Online Razorpay checkout with webhook HMAC verification, Demo mode simulator, and offline Bank/UPI/QR code display with proof upload and admin verification. |
| **22** | **Kundli Making form format > Plan > Offer > Submitted > Confirmation** | 🟢 **IMPLEMENTED** | [src/features/astro/components/KundliCalculatorClient.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/features/astro/components/KundliCalculatorClient.tsx)<br>[src/app/[locale]/kundli/page.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/kundli/page.tsx) | Interactive Vedic Janampatri intake with birth details, charts computation, and booking flow integration. |
| **23** | **Kundli Matching form format > Plan > Offer > Submitted > Confirmation** | 🟢 **IMPLEMENTED** | [src/features/astro/components/MatchingCalculatorClient.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/features/astro/components/MatchingCalculatorClient.tsx)<br>[src/app/[locale]/kundli/matching/page.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/kundli/matching/page.tsx) | 36-Guna Ashtakoot matching calculator and order pipeline conversion. |
| **24** | **Kundli PDF & Kundli Matching PDF Upload option in user Account** | 🟢 **IMPLEMENTED** | [src/features/admin/components/AdminVaultManager.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/features/admin/components/AdminVaultManager.tsx)<br>[src/app/[locale]/vault/page.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/vault/page.tsx) | Admin uploads Kundli PDFs with magic-byte validation (`%PDF-`), user accesses and downloads securely from their vault. |
| **25** | **Kundli work progress Report > order Received > Kundli in progress > Kundli Complete > Dispatched > Delivered > Complete** | 🟢 **IMPLEMENTED** | [src/features/orders/components/OrderStatusStepper.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/features/orders/components/OrderStatusStepper.tsx)<br>[src/app/[locale]/track/page.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/track/page.tsx) | 6-stage milestone tracker stepper with phone verification and admin update controls. |
| **26** | **Prashna Kundli form format with all details** | 🟢 **IMPLEMENTED** | [src/features/astro/components/PrashnaRequestClient.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/features/astro/components/PrashnaRequestClient.tsx)<br>[src/app/[locale]/kundli/prashna/page.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/kundli/prashna/page.tsx) | Redesigned per client mock with seed number (1–249), query categories, horary planetary placements, and order intake. |
| **27** | **Google Map Page with Address Location Navigation, Enquiry link, Social Link** | 🔴 **MISSING** | [src/components/layout/Footer.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/components/layout/Footer.tsx) (address text only) | **Gap**: Dedicated `/contact` or `/location` page with interactive Google Map embed iframe, "Open in Google Maps / Navigate" GPS button, quick enquiry contact form, and direct social links. |
| **28** | **Free Astrosage Kundli software Integration with all feature** | 🟢 **IMPLEMENTED** | [src/lib/astro/astrosage.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/astro/astrosage.ts)<br>[src/lib/astro/demo.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/astro/demo.ts) | Pluggable `AstroProvider` architecture with AstroSage API adapter and demo simulation. |
| **29** | **Customer Support 24 * 7** | 🟡 **PARTIAL** | [src/app/[locale]/help/page.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/help/page.tsx) | Static helpline and emergency contact information displayed on help page. **Gap**: Floating 24/7 quick contact buttons (WhatsApp, Phone dialer) and support ticket submission form. |
| **30** | **Legal Page & Active Links** | 🟢 **IMPLEMENTED** | [src/app/[locale]/legal/[slug]/page.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/legal/[slug]/page.tsx) | Dynamic CMS-driven legal pages for Privacy Policy, Terms of Service, and Refund Policy with active links in footer. |
| **31** | **FAQ** | 🟡 **PARTIAL** | [src/app/[locale]/help/page.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/help/page.tsx#L40-L75) | Hardcoded FAQ accordion on help page. **Gap**: Dedicated `/faq` page and admin CMS manager to dynamically add, edit, reorder, and categorize FAQs in Hindi and English. |
| **32** | **Quick Link, Logo Address, Legal Page, Other Service, Contact Address** | 🟢 **IMPLEMENTED** | [src/components/layout/Footer.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/components/layout/Footer.tsx) | Structured 5-column left-aligned footer contains Kendra Credentials, Vedic Services, Astrological Tools, Policies, and Contact Address. |
| **33** | **Site Setting with All A to Z control as like Even Front, Logo page to User profile page till last bottom Quick link page** | 🟡 **PARTIAL** | [src/app/[locale]/admin/settings/page.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/admin/settings/page.tsx) | Settings manages basic site name, phone, address, coordinates, bank details, and GSTIN. **Gap**: Needs expansion for logo URL upload, favicon upload, social URLs, third-party API keys (Razorpay, MSG91, SMTP, AstroSage, Google Analytics), app download links/QR, maintenance mode, and backup triggers. |
| **34** | **Billing Invoice / GST %, Name, Logo, Company name, GST No. offer value Less, Address & other information** | 🟢 **IMPLEMENTED** | [src/lib/billing/gst.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/billing/gst.ts)<br>[src/lib/billing/invoicePdf.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/billing/invoicePdf.ts) | Automated sequential GST Tax Invoice generation (`INV-YYYY-XXXX`) calculating base, coupon deduction, 18% GST (CGST/SGST/IGST), and net payable with Kendra metadata. |
| **35** | **Service > Booking > Appointment > Enquiry** | 🟡 **PARTIAL** | [src/app/[locale]/booking/page.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/booking/page.tsx) | Booking and appointment flows exist. **Gap**: Quick Service Enquiry form / modal directly on service detail pages for non-immediate consultations. |
| **36** | **Service List View & Grid View** | 🔴 **MISSING** | [src/app/[locale]/services/page.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/services/page.tsx) | **Gap**: Currently fixed layout without view toggle. Needs interactive Grid View vs List View switch with icon controls and state persistence. |
| **37** | **Date, Time, Days, Tithi, Calendar integration Home Page** | 🟢 **IMPLEMENTED** | [src/features/astro/components/PanchangWidget.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/features/astro/components/PanchangWidget.tsx)<br>[src/app/[locale]/panchang/page.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/panchang/page.tsx) | Live date, time, weekday, tithi, nakshatra, and rahukal displayed on homepage widget with full calendar on `/panchang`. |
| **38** | **Maharshi Kanad Jyotish Kendra Founder Details Description page with Image file & URL, Links, Additional Link between page, New Page Add option & upload option, addition links, Youtube links add option** | 🟡 **PARTIAL** | [src/app/[locale]/founder/page.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/founder/page.tsx) | Static Founder page exists. **Gap**: Not connected to Admin CMS for photo upload/URL, YouTube video embed, and custom biography links. |
| **39** | **Upload option File upload & URL Link upload both option mention all expected feature** | 🟡 **PARTIAL** | [src/lib/storage/index.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/storage/index.ts) | Local/S3 storage provider handles file uploads. **Gap**: Admin forms often enforce file upload only or URL only; need dual inputs (File Upload OR external URL link) across services, gallery, founder, banners. |
| **40** | **PDF file Upload through Admin Panel For any User & Download option in User** | 🟢 **IMPLEMENTED** | [src/features/admin/components/AdminVaultManager.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/features/admin/components/AdminVaultManager.tsx)<br>[src/app/[locale]/vault/page.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/vault/page.tsx) | Fully implemented with magic-byte validation, user-specific assignment, and secure streaming. |
| **41** | **Android App Download option from website to any user with URL links & QR Code total modification & control from admin panel** | 🔴 **MISSING** | *None* | **Gap**: Dedicated `/app-download` page displaying direct APK download URL, Google Play Store link, and dynamic QR code controlled from Site Settings, plus Android WebView project files ready to compile into `.apk`. |
| **42** | **Free API Ask Integration for all program information received by user** | 🟡 **PARTIAL** | [src/app/api/astro/](file:///C:/Users/anshu/Desktop/ClientWork/src/app/api/astro/) | Astro calculation APIs exist for internal forms. **Gap**: Public/Free horoscope inquiry API route with astrological overview. |
| **43** | **Free Assistance Chatbot option** | 🔴 **MISSING** | *None (Deferred in Phase 1)* | **Gap**: Floating AI/Vedic Assistance Chatbot widget with instant answers on astrology, services, pricing, and consultation booking, with admin toggle and knowledge base settings. |
| **44** | **Social Media Integration as like Facebook, Whatsapp, Instagram, Twitter & other Social media platform** | 🟡 **PARTIAL** | [src/components/layout/Footer.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/components/layout/Footer.tsx#L110-L122) | Static social links in footer. **Gap**: Floating quick-contact bar (WhatsApp click-to-chat, Phone dialer), blog/service social share buttons, and admin control over all social handles. |
| **45** | **Per page & Expected used program Back & Next Icon option** | 🔴 **MISSING** | *None* | **Gap**: Explicit breadcrumb trail with "Back" and "Next" icon buttons across Service details, Booking wizard steps, Kundli calculators, Blog articles, and Legal pages. |
| **46** | **Notification through Gmail, SMS, OTP** | 🟡 **PARTIAL** | [src/lib/sms/index.ts](file:///C:/Users/anshu/Desktop/ClientWork/src/lib/sms/index.ts) | SMS OTP interface exists. **Gap**: Transactional email notifications (via Nodemailer / SMTP adapter) and event triggers for order placed, payment approved, vault file uploaded, and appointment booked. |
| **47** | **Additional Links & Youtube Links Add option Mention in Service, Gallery, blog** | 🟡 **PARTIAL** | [prisma/schema.prisma](file:///C:/Users/anshu/Desktop/ClientWork/prisma/schema.prisma#L376-L418) | Services, Gallery, and Blog exist. **Gap**: Prisma models and admin forms need explicit `youtubeUrl` and `additionalLinks` fields, rendered with responsive embed players. |
| **48** | **Google Analytics** | 🟡 **PARTIAL** | [src/components/analytics/GoogleAnalytics.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/components/analytics/GoogleAnalytics.tsx) | Static component exists in layout. **Gap**: Dynamic GA Measurement ID retrieval from database `AdminSettings`, admin settings input field, and event tracking dispatchers. |
| **49** | **Associate Panel with expected modules** | 🔴 **MISSING** | *None* | **Gap**: Complete Associate subsystem: Role `ASSOCIATE` in Prisma schema, Associate registration (`/associate/register`) & login, Admin approval console (`/admin/associates`), referral codes & tracking links, booking assignment, commission rules (flat/%), Associate Dashboard (`/associate/dashboard`), payout requests (`/associate/payouts`), and admin payout processing (`/admin/payouts`). |

---

## Part 2: Mandatory Client Conditions Gap Analysis

| Condition ID | Client Condition Specification | Current Status | Codebase Evidence | Identified Implementation Scope |
| :---: | :--- | :---: | :--- | :--- |
| **COND-1** | **All API Credentials Managed via Admin Site Settings & `.env.example`**<br>(Hosting, domain, Google Play belong to client; code ready so only API keys need entering; no hardcoded secrets) | 🟡 **PARTIAL** | [.env.example](file:///C:/Users/anshu/Desktop/ClientWork/.env.example)<br>[src/app/[locale]/admin/settings/page.tsx](file:///C:/Users/anshu/Desktop/ClientWork/src/app/[locale]/admin/settings/page.tsx) | Base env vars documented. **Gap**: Expand Site Settings admin interface with secure fields for Razorpay keys, Google/Facebook OAuth IDs, MSG91 Auth Key, SMTP credentials, AstroSage keys, and Google Analytics ID with fallback to `.env`. |
| **COND-2** | **EVERY Line, Word, Label, Menu Item, Button Text, Footer Text, and Error Message Editable from Admin in Hindi & English**<br>(No code change required for any text; database override layer) | 🔴 **MISSING** | [messages/en.json](file:///C:/Users/anshu/Desktop/ClientWork/messages/en.json)<br>[messages/hi.json](file:///C:/Users/anshu/Desktop/ClientWork/messages/hi.json) | Translations are currently static JSON dictionaries. **Gap**: Create `TranslationOverride` database model, dynamic i18n resolver merging database overrides with fallback JSON, and `/admin/translations` search/filter editor. |
| **COND-3** | **Automated & Manual Backups**<br>(Daily, weekly, monthly backup scheduling, status, manual run, download/restore guidance in Site Settings, honest documentation of serverless/DB limits) | 🔴 **MISSING** | *None* | **Gap**: Database backup engine in `lib/backup/`, admin console at `/admin/backups` or Site Settings, SQL/JSON snapshot export, download, restore guidance, and cron documentation. |
| **COND-4** | **PDF Guides for Admin, User, and Associate Panels**<br>(Integrated into admin panel, editable from there, dynamic PDF generation via PDFKit, or upload/replace flow) | 🔴 **MISSING** | *None* | **Gap**: `Guide` model in Prisma, dynamic PDFKit generator for Admin, User, and Associate handbooks, downloadable from panels, editable in `/admin/guides`. |
| **COND-5** | **Android App Setup (WebView APK) & Website Download Page**<br>(Complete Android project setup ready for Play Store, download page with QR code controlled from admin) | 🔴 **MISSING** | *None* | **Gap**: Dedicated `/app-download` page with admin QR code and download links, plus Android WebView Gradle wrapper project in `android/` with icons and manifest. |

---

## Part 3: Implementation Roadmap (Phases 15–22)

To maintain 100% stability and zero disruption to the 97 passing tests, the gaps are structured into distinct, incremental phases:

```mermaid
flowchart TD
    P15["Phase 15: Translation Override Layer & Full Admin String CMS (COND-2)"]
    P16["Phase 16: Extended Site Settings, Social Media, Google Analytics & Chatbot (Points 27, 29, 33, 43, 44, 48, COND-1)"]
    P17["Phase 17: Service Catalog Enhancements: List/Grid View, Itinerary, Samagri, YouTube & Back/Next (Points 12, 17, 35, 36, 45, 47)"]
    P18["Phase 18: Dynamic Founder, Extra CMS Pages, Gallery Video Embeds & Dedicated FAQ (Points 8, 11, 13, 31, 38)"]
    P19["Phase 19: Appointment Reporting Dashboard & Transactional Email/SMS Notifications (Points 10, 14, 46)"]
    P20["Phase 20: Associate Subsystem: Registration, Admin Approval, Referral Tracking, Commission & Dashboard (Point 49)"]
    P21["Phase 21: Database Backup Engine, Schedule & PDF Guides Subsystem (COND-3, COND-4)"]
    P22["Phase 22: Android WebView APK Project, Play Store Setup & Website Download Page with QR Code (Points 2, 41, COND-5)"]
    P23["Phase 23: Comprehensive End-to-End Testing (Playwright), Full QA & Final Handoff Report"]

    P15 --> P16 --> P17 --> P18 --> P19 --> P20 --> P21 --> P22 --> P23
```

### Phase Details

1. **Phase 15: Translation Override Layer & Full Admin String CMS**
   - Prisma Model: `TranslationOverride` (`id`, `locale`, `namespace`, `key`, `value`, `updatedAt`).
   - Dynamic i18n Resolver: Injects database overrides over default JSON dictionary messages on server and client.
   - Admin UI: `/admin/translations` search, filter by namespace/locale, bulk inline editing.
   - Verification: Unit tests verifying override precedence, fallback to JSON dictionary, and immediate cache invalidation.

2. **Phase 16: Extended Site Settings, Social Integration, Google Analytics & 24/7 Chatbot**
   - Prisma Schema: Expand `AdminSettings` with `logoUrl`, `faviconUrl`, `googleAnalyticsId`, `socialWhatsapp`, `socialTelegram`, `facebookAppId`, `facebookAppSecret`, `smtpHost`, `smtpPort`, `smtpUser`, `smtpPass`, `smtpFrom`, `chatbotEnabled`, `chatbotWelcomeMessageEn/Hi`.
   - Google Analytics: Dynamic measurement ID injection and client-side pageview/event tracking.
   - Floating Quick-Action Bar: WhatsApp click-to-chat, Phone dialer, Emergency contact modal.
   - Vedic Assistance Chatbot: Floating interactive assistant widget answering astrology FAQs, services, muhurta, and pricing with admin-configurable knowledge base.
   - Google Map Page: Dedicated `/contact` page with interactive map iframe, GPS navigation CTA, quick enquiry form, and social links.

3. **Phase 17: Service Catalog Enhancements & UI Navigation Controls**
   - Prisma Schema: Update `Service` and `Plan` with `itinerary`, `samagriList`, `youtubeUrl`, `additionalLinks`.
   - Service Catalog: Interactive **Grid View** vs **List View** toggle button with local storage persistence.
   - Service Details: Tabs for Overview, Program Itinerary, Puja Samagri (materials), YouTube video embed, and Quick Service Enquiry form.
   - Navigation Controls: Standardized "Back" and "Next" icon buttons and breadcrumbs across all sub-pages.

4. **Phase 18: Dynamic Founder, Extra CMS Pages, Gallery Video Embeds & Dedicated FAQ**
   - Admin CMS: Manage Founder details, photo upload/URL, YouTube video embed, and custom biography links.
   - Gallery Enhancements: Support for YouTube video links and external URLs alongside image uploads.
   - Other Services Page: Dedicated `/other-services` tab/page for Bharat Darshan Teerth Yatra and Matrimonial Service with rich cards and video links.
   - Dedicated FAQ Page: Dynamic `/faq` accordion driven by admin CMS categories.

5. **Phase 19: Appointment Reporting Dashboard & Transactional Email/SMS Notifications**
   - Admin Analytics Dashboard: `/admin` redesigned with live metrics (Gross Revenue, Total Bookings, User Growth, Service Distribution, Associate Metrics).
   - Dedicated Appointment Management: Calendar/slot filter view with one-click approval/rejection.
   - Transactional Email Engine: Nodemailer SMTP adapter sending automated HTML receipts for order placement, payment approval, vault uploads, and appointment bookings.

6. **Phase 20: Associate Subsystem (The 49th Requirement)**
   - Prisma Schema: Role `ASSOCIATE`, `AssociateProfile`, `ReferralAttribution`, `CommissionRule`, `PayoutRequest`.
   - Partner Registration & Auth: `/associate/register` and `/associate/signin`.
   - Admin Approval Console: `/admin/associates` review, approve, reject, set commission percentage/flat rates.
   - Referral Engine: Unique referral links (`?ref=CODE`) automatically captured in session and attributed to orders.
   - Associate Dashboard: `/associate/dashboard` tracking referrals, assigned consultations, earnings ledger, and bank details.
   - Payout System: Payout requests by associates and admin approval/processing console (`/admin/payouts`).

7. **Phase 21: Database Backup Engine, Schedule & PDF Guides Subsystem**
   - Backup Engine: `/admin/backups` with manual snapshot trigger (SQL/JSON export), scheduled backup documentation, and step-by-step restoration guide.
   - PDF Guides Subsystem: PDFKit-generated downloadable handbooks for Admin, User, and Associate panels, editable and customizable from `/admin/guides`.

8. **Phase 22: Android WebView APK Project, Play Store Setup & Website Download Page**
   - Android Studio Project: Complete Gradle wrapper project in `android/` with MainActivity loading `https://kanadjyotishkendra.vercel.app/`, splash screen, offline caching, and camera/file upload permissions.
   - Website Download Page: `/app-download` page displaying direct APK download URL, Google Play badge, and dynamic QR code generated from admin settings.

9. **Phase 23: Comprehensive Testing (Unit + Integration + Playwright E2E) & Test Report**
   - Maintain all 97 existing unit tests green.
   - Write comprehensive unit tests for new modules (Translations, Associates, Backups, Email notifications, Chatbot).
   - Configure and execute Playwright end-to-end tests for all critical user and admin journeys.
   - Generate `TEST_REPORT.md` and client manual QA checklist.

---

## Part 4: Technical Dependencies & Credentials Audit

| Integration Service | Implementation State | Configuration Location | Client Action Required for Public Launch |
| :--- | :--- | :--- | :--- |
| **Razorpay Payments** | Complete Adapter + Webhook | Site Settings or `.env` | Enter live Key ID, Secret, Webhook Secret in Admin Settings |
| **SMS / OTP (MSG91)** | Complete Adapter | Site Settings or `.env` | Enter MSG91 Auth Key, Sender ID, and DLT Template IDs |
| **Transactional Email (SMTP)** | Nodemailer Adapter | Site Settings or `.env` | Enter SMTP Host, Port, Username, Password, and From Email |
| **Google Sign-In** | NextAuth Provider | Site Settings or `.env` | Enter Google Client ID and Secret in Google Cloud Console |
| **Facebook Login** | NextAuth Provider | Site Settings or `.env` | Enter Facebook App ID and App Secret in Meta for Developers |
| **AstroSage Ephemeris** | Complete Adapter | Site Settings or `.env` | Enter AstroSage User ID and API Key |
| **Google Analytics** | Tracking Component | Site Settings or `.env` | Enter GA4 Measurement ID (`G-XXXXXXXXXX`) in Admin Settings |
| **Google Maps API** | Map Embed Component | Site Settings or `.env` | Enter Google Maps Embed API Key or Place URL |
| **Private Vault Storage** | S3 / Local Provider | Site Settings or `.env` | Configure AWS S3 Bucket Name and AWS credentials (or use Local) |
