# Implementation Report: Maharshi Kanad Jyotish Kendra

Prepared 25 October 2026. Live site: https://kanadjyotishkendra.vercel.app

This report is based on a review of the code, the live deployment and the test suite. It
covers the 48 points of the client requirement document, the SRS, and the conditions
added later. "Built" means the feature exists in the code and is tested. Many built
features still need the client's own keys or content before they work for real users;
those are listed in section 7.

## 1. Summary

| Area | State |
| :--- | :--- |
| Requirement points (1 to 48) | 29 built, 16 partly built, 3 not built |
| Added requirement 49 (Associate panel) | Partly built: separate registration and login only |
| Added conditions (backups, PDF guides, Android app) | Not built |
| Automated tests | 425 unit tests pass. Browser (Playwright) tests exist but were not run in this review |
| Production build, type check, lint | Pass |
| Deployment | Live on Vercel, database connected, health check passes |
| Security review of dependencies | Open: Next.js 14 has known advisories (see section 6) |

## 2. Requirement-by-requirement status

Status key: **Built**, **Partial**, **Not built**. "Needs client" means it cannot work for
real users until the client provides a key, account or content (section 7).

| # | Requirement | Status | Notes |
| :-: | :--- | :-: | :--- |
| 1 | Dynamic custom CMS, admin control | Partial | Admin covers services, plans, offers, orders, vault, banners, marquee, blogs, gallery, founder, FAQ, testimonials, pages, translations, settings, keys, chatbot, enquiries, other services. Missing: reporting dashboard, backups, guides |
| 2 | Mobile responsive, usable in an Android app | Partial | Responsive and tested at 375px. The Android WebView project is not built |
| 3 | Hindi and English | Built | Language switch and editable text overrides. Some admin screens still contain fixed bilingual strings |
| 4 | Theme: saffron, yellow, maroon, high contrast | Built | Contrast measured, two fixes applied (section 5) |
| 5 | Menu items | Built | All listed items present |
| 6 | User panel, registration | Built | User and Associate registration are now separate |
| 7 | Login options (Gmail, OTP, Google, Facebook) | Partial | Mobile OTP and email login built. Google works once keys are added. Facebook login is not built (only the key fields exist). Needs client |
| 8 | Founder page and CMS | Built | |
| 9 | Admin panel with full CMS control | Partial | See point 1 |
| 10 | Dashboard with service reporting and analysis | Not built | The admin home redirects to the services list. No charts or reports |
| 11 | Gallery with image and video upload, links, YouTube | Built | |
| 12 | Service content: image, itinerary, samagri, links, YouTube | Partial | Database and API done. The admin form for these fields is still being finished |
| 13 | Other services (Bharat Darshan, Matrimonial) | Built | Both entries are live with the client's URLs |
| 14 | Appointment reporting and approval | Partial | Orders manager exists. No appointment calendar or approval workflow |
| 15 | Service, plan, offer, payment flow with add, remove, activate | Built | |
| 16 | Service booking integrated with all services | Built | |
| 17 | Plan details: program, preparation, samagri | Partial | Same as point 12 |
| 18 | Offers: fixed or percent value, date range, admin control | Built | |
| 19 | Advertisements on several pages, positions, slideshow | Partial | Top, bottom, left, right banners with admin control. Per-page targeting not built |
| 20 | Marquee line with font, speed, position, colour | Built | |
| 21 | Payments: Razorpay, bank, UPI, QR | Built | Razorpay needs the client's live keys. Manual bank, UPI and QR work now |
| 22 | Kundli form, plan, offer, confirmation | Built | |
| 23 | Kundli matching form and flow | Built | |
| 24 | Kundli and matching PDF upload to the user account | Built | Private storage on Vercel Blob |
| 25 | Order progress tracker (six stages) | Built | |
| 26 | Prashna Kundli form | Built | |
| 27 | Google Map page, address, enquiry, social links | Built | Needs the correct address and map link from the client |
| 28 | Free AstroSage integration | Partial | Adapter and page exist. Shows sample data until the client's AstroSage credentials are added. Needs client |
| 29 | Customer support 24x7 | Built | Help page, WhatsApp, rule-based chat. It is not staffed 24x7, only always available |
| 30 | Legal pages | Built | Text must be supplied by the client |
| 31 | FAQ | Built | Also published as structured data for search engines |
| 32 | Footer: quick links, address, legal, other services, contact | Built | |
| 33 | Site settings with full control | Partial | Extensive, but not every element of the layout is editable |
| 34 | GST invoice | Built | Needs the company GST details from the client |
| 35 | Service, booking, appointment, enquiry | Partial | Booking and enquiry exist. No appointment slot approval |
| 36 | Service list view and grid view | Built | Toggle on the services page |
| 37 | Date, time, day, tithi on the home page | Partial | Date, time and day are live. The tithi is labelled DEMO sample data until a real panchang source is connected. Needs client |
| 38 | Founder details page and CMS | Built | |
| 39 | File upload and URL link options | Partial | Works on Vercel with Blob storage. Not every admin form offers both options |
| 40 | Admin PDF upload for a user, user download | Built | |
| 41 | Android app download page with link and QR, admin control | Not built | |
| 42 | "Free API Ask" integration | Not built | The requirement is unclear and needs the client's explanation |
| 43 | Free assistance chatbot | Built | Rule-based, answers editable in admin. It is not an AI model |
| 44 | Social media integration | Built | |
| 45 | Back and Next icons on pages | Partial | Present on services, other services and AstroSage pages. Not yet on every page |
| 46 | Notifications by email, SMS, OTP | Partial | SMS OTP adapter exists. Email sending and order-status notifications are not built. Needs client |
| 47 | Additional links and YouTube links | Partial | Done for services, gallery and blog data. Some admin forms do not expose them yet |
| 48 | Google Analytics | Built | Needs the client's measurement ID |
| 49 | Associate panel | Partial | Separate registration and login exist. No associate dashboard, approval, referral or commission |
| C3 | Automated and manual backups | Not built | |
| C4 | PDF guides for admin, user, associate | Not built | |
| C5 | Android WebView app and download page | Not built | |

## 3. Frontend

Done:
- Next.js 14 App Router site, Hindi default and English at `/en`.
- Landing page rebuilt this round: short hero, free tools, services pulled from the
  catalogue, four booking steps, verified testimonials only. Placeholder testimonials,
  hard-coded planet positions, hard-coded prices and unverifiable claims were removed.
- Larger type on mobile and a small increase on desktop. Layout checked at 375px with no
  horizontal overflow on the main pages.
- Separate pages for User, Associate and Super Admin login, and for User and Associate
  registration.
- Chatbot button renamed "Help Chat" (it was labelled "Vedic AI", which was misleading).
  Emojis and inflated wording removed.

Remaining:
- Some pages and the footer are still long on mobile. The footer alone is about 2,000px.
- Back and Next navigation is missing on some pages (point 45).
- Real photos, logo and content from the client replace the demo content.

## 4. Backend and API

Done:
- Authentication with NextAuth: mobile OTP, email and password, Google (when keys exist).
  Each login page only admits its own account type, enforced on the server.
- Role guards re-read the role from the database on every protected call.
- Booking, offers, orders, payments (Razorpay and manual proof), GST invoices, vault
  files, FAQ, banners, marquee, blog, gallery, founder, chatbot, enquiries and other
  services all have API routes with validation.
- Rate limiting, CSRF origin checks and a security-headers set.
- API keys are stored encrypted (AES-256-GCM) and can be edited in the admin panel.
- Private file storage on Vercel Blob. Files are only served after an ownership check.
- Order-expiry job (daily on the free plan; also runs inside the booking endpoints).
- Health check at `/api/health`.

Remaining:
- Email sending, order-status notifications, backups, Facebook login, "Ask API" (point 42).

## 5. Colour and theme check

The PDF asks for saffron, yellow, maroon and high contrast.

| Colour | Value | Use |
| :--- | :--- | :--- |
| Saffron | `#e8751a` | Main buttons |
| Deep saffron | `#984700` | Links, hover |
| Maroon | `#6b1d1d` | Headings, header |
| Turmeric yellow | `#f9bd14` and `#bd8e00` | Highlights, badges |
| Text | `#241915` on `#fff8f6` | Body text |

Measured contrast (WCAG): body text 16.3:1, headings 11.0:1, white on maroon 11.6:1,
links 6.2:1, badges 13.3:1. Two failures were found and fixed:
- White text on the saffron button was 3.0:1. The text is now dark (about 5.9:1) and turns
  white when the button darkens on hover.
- The grey used for placeholders was 4.28:1. It is now 6.2:1.

The theme matches the PDF.

## 6. Database, security and quality

Database (PostgreSQL through Prisma): 28 models, 5 migrations applied. Migrations run
automatically on every Vercel deployment. Demo content is loaded; the seed command is
guarded so it cannot run against a live database by accident.

SEO and AEO (added this round):
- Page titles, descriptions, canonical links and Hindi and English alternates.
- Open Graph and Twitter tags, `sitemap.xml` (static pages, services, blog posts),
  `robots.txt` (private areas blocked), favicon.
- Structured data: business and website on every page, Service with price range on
  service pages, FAQ on the FAQ page.
- `llms.txt` summarising the site for AI assistants.
- Not verified: Google Search Console, Rich Results test and indexing. These need the
  client's domain access. A 1200x630 sharing image is still needed.

Security and quality:
- A dependency audit found known advisories in Next.js 14.2 (including a critical one) and
  `next-intl`. The fix is a major upgrade to Next.js 16, which needs its own test cycle.
  Recommended before launch to the public.
- `@vercel/blob` pulls in a vulnerable `zod` copy. It is not used on untrusted input here.
- Browser (Playwright) tests were not run in this review.
- Demo mode is on (`DEMO_MODE=true`) until live payment and astrology keys are added.

## 7. What to ask the client

Hosting and accounts
1. Who owns the hosting? Confirm Vercel (recommended) or their own server. If their own,
   they need Node 20 and PostgreSQL (MySQL-only shared hosting will not work).
2. Domain name and DNS access, or permission to connect it.
3. A Vercel account they own (we can transfer the project) and who pays for the database
   and storage.

Payments and billing
4. Razorpay live Key ID, Key Secret and webhook secret (the account must be activated).
5. Company name, GST number, address, PAN and logo for invoices; GST percentage.
6. Bank account details, UPI ID and QR image for manual payments.

Messaging
7. MSG91 account: auth key, sender ID and OTP template ID (India requires DLT
   registration, which can take days).
8. Email: SMTP host, user, password (a Gmail app password works) and sender address.

Login and analytics
9. Google Cloud OAuth client ID and secret, with the site URL as an allowed origin.
10. Facebook app ID and secret (needs a published privacy policy URL). Confirm they still
    want Facebook login, since it is not built yet.
11. Google Analytics measurement ID.

Astrology
12. AstroSage API user ID and key. Ask what "free AstroSage with all features" covers,
    because the free offering may not include everything.
13. Source for the daily tithi and panchang.

Content
14. Founder photo, biography and designation; real service descriptions, plans, prices and
    offers; real testimonials with permission; FAQ answers; gallery images and videos.
15. Privacy policy, terms and refund policy text.
16. Exact address, map location, phone numbers, WhatsApp number and social media links.
17. Confirm the two other portals (Bharat Darshan Teerth Yatra, Matrimonial) and supply
    logos and short descriptions.

Decisions needed
18. What does the Associate role do (referrals, commission, approval, a separate panel)?
19. What does point 42, "Free API Ask Integration", mean?
20. Backup frequency and who receives the backups.
21. Which events should send email or SMS (order received, status change, payment)?
22. Android app: app name, icon, package name and a Google Play developer account.

## 8. Suggested order of work

1. Collect the client items above. Without keys, payments, OTP, email, AstroSage and
   analytics cannot be verified end to end.
2. Upgrade Next.js and re-run the full browser tests.
3. Finish the admin forms for service and plan details (points 12 and 17).
4. Build the admin reporting dashboard (point 10) and appointment approval (point 14).
5. Email and order-status notifications (point 46).
6. Associate panel (point 49), then backups, guides and the Android app.
