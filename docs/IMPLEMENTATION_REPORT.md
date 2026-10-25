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
| Added requirement 49 (Associate panel) | Built (see row 49) |
| Added conditions (backups, PDF guides, Android app) | Built or partly built (see rows C3 to C5) |
| Automated tests | 479 unit tests pass. Browser (Playwright) tests exist but were not run in this review |
| Production build, type check, lint | Pass |
| Deployment | Live on Vercel, database connected, health check passes |
| Security review of dependencies | Open: Next.js 14 has known advisories (see section 6) |

## 2. Requirement-by-requirement status

Status key: **Built**, **Partial**, **Not built**. "Needs client" means it cannot work for
real users until the client provides a key, account or content (section 7).

| # | Requirement | Status | Notes |
| :-: | :--- | :-: | :--- |
| 1 | Dynamic custom CMS, admin control | Built | Admin covers services, plans, offers, orders, appointments, associates, vault, banners, marquee, blogs, gallery, founder, FAQ, testimonials, pages and guides, translations, settings, keys, chatbot, enquiries, other services, backup |
| 2 | Mobile responsive, usable in an Android app | Partial | Responsive and tested at 375px. The Android WebView project is not built |
| 3 | Hindi and English | Built | Language switch and editable text overrides. Some admin screens still contain fixed bilingual strings |
| 4 | Theme: saffron, yellow, maroon, high contrast | Built | Contrast measured, two fixes applied (section 5) |
| 5 | Menu items | Built | All listed items present |
| 6 | User panel, registration | Built | User and Associate registration are now separate |
| 7 | Login options (Gmail, OTP, Google, Facebook) | Built, needs client keys | Mobile OTP and email login work. Google and Facebook sign-in create or match a customer account and show their buttons only when GOOGLE_CLIENT_ID/SECRET or FACEBOOK_APP_ID/SECRET are set as Vercel environment variables. Not tested against the live providers |
| 8 | Founder page and CMS | Built | |
| 9 | Admin panel with full CMS control | Partial | See point 1 |
| 10 | Dashboard with service reporting and analysis | Not built | The admin home redirects to the services list. No charts or reports |
| 11 | Gallery with image and video upload, links, YouTube | Built | |
| 12 | Service content: image, itinerary, samagri, links, YouTube | Partial | Database and API done. The admin form for these fields is still being finished |
| 13 | Other services (Bharat Darshan, Matrimonial) | Built | Both entries are live with the client's URLs |
| 14 | Appointment reporting and approval | Built | Each booked slot starts as pending. Admin approves, rejects (frees the slot) or completes it, with an email to the customer. The customer sees the status in My Account |
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
| 35 | Service, booking, appointment, enquiry | Built | Booking, appointment approval and enquiry are connected |
| 36 | Service list view and grid view | Built | Toggle on the services page |
| 37 | Date, time, day, tithi on the home page | Partial | Date, time and day are live. The tithi is labelled DEMO sample data until a real panchang source is connected. Needs client |
| 38 | Founder details page and CMS | Built | |
| 39 | File upload and URL link options | Partial | Works on Vercel with Blob storage. Not every admin form offers both options |
| 40 | Admin PDF upload for a user, user download | Built | |
| 41 | Android app download page with link and QR, admin control | Built | /app shows the link and a QR code from Admin > Settings. Shows a coming-soon note until a link is saved |
| 42 | "Free API Ask" integration | Not built | The requirement is unclear and needs the client's explanation |
| 43 | Free assistance chatbot | Built | Rule-based, answers editable in admin. It is not an AI model |
| 44 | Social media integration | Built | |
| 45 | Back and Next icons on pages | Built | Shown on every page except the home page |
| 46 | Notifications by email, SMS, OTP | Partial, needs client | OTP SMS adapter exists. Email is sent for payment confirmation, appointment decisions, associate approval and payouts once SMTP details are saved under API Keys. Status SMS needs DLT-approved templates. Needs client |
| 47 | Additional links and YouTube links | Partial | Done for services, gallery and blog data. Some admin forms do not expose them yet |
| 48 | Google Analytics | Built | Needs the client's measurement ID |
| 49 | Associate panel | Built, awaiting client confirmation of rules | Registration with admin approval, own login and dashboard, referral link /r/code (30 days), admin assignment of bookings, commission rules per service or plan, earnings, payout requests (admin marks paid, money moves outside the system), admin console. Detailed functions still to be confirmed against vindhyavivahsanskar.com |
| C3 | Automated and manual backups | Partial | Admin > Backup downloads a JSON copy (no secrets). Automatic backups rely on the database provider's own backup feature |
| C4 | PDF guides for admin, user, associate | Built | Starter guides in Hindi and English at /guides/user, /guides/associate and /guides/admin, editable under Admin > Pages, saved as PDF from the Print button |
| C5 | Android WebView app and download page | Partial | Project in android-app/ and installable web app manifest. It still has to be built, signed and published by the client's Play Console |

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

## 5. Colour and theme

The client specified four colours, used in high contrast across the whole site:

| Colour | Hex | Where it is used |
| :--- | :--- | :--- |
| Saffron | `#F4C430` | Buttons, highlights, marquee strip, table headers |
| Yellow | `#FFFF00` | Button hover state, soft page and card backgrounds (lighter tints) |
| Maroon | `#800000` | Headings, text, borders, icons. As a filled background only in the footer Quick Links |
| Red | `#FF0000` | Accent: the line under the header, card top edges, active menu underline, the AI button |

Body text is a maroon-tinted black (`#1A0000`) on white or pale yellow.

Measured contrast: maroon on white 10.9:1, maroon on yellow 10.2:1, maroon on saffron 6.7:1,
black text on saffron 12.8:1, white or yellow text on the maroon footer 10:1 or better.
Red is only 4.0:1 against white, so it is never used for small text. A scan of about 2,000
text elements on 12 pages at desktop and phone width found no remaining contrast failures
and no maroon backgrounds outside the footer.

Success states (for example "Paid") keep a green tick or badge because it is a universal signal.
This is the one deliberate exception to the four colours.

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
