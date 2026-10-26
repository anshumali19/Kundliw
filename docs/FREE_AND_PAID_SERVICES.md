# What is free and what costs money
# क्या मुफ़्त है और किसका खर्च है

Prices and free limits of outside companies change. The figures below are indicative (late 2026): check each company's pricing page before you commit.

## 1. Built into the website (no extra fee)
| Feature | Where | Note |
|---|---|---|
| Panchang (tithi, nakshatra, Rahu Kaal, sunrise…) | Home bar + Panchang page | Calculated by our own code. Free forever. |
| Hindi Panchang Calendar, Free Kundli, Kundli Matching | Menu → Panchang / Kundli / Matching | AstroSage's free tools shown inside our site. Free, but owned by AstroSage: they may change or remove them. Admin can switch any of them off or change the address (Admin → Website → Tools). |
| Map | Contact page and footer | OpenStreetMap is free. A Google Maps embed is free to paste too. |
| Social media links | Header, home page, footer | Admin → Website → Social media. Free. |
| Backups, credentials, marquee, banners, offers, SEO, hero text | Admin panel | Free, no code needed. |

## 2. Free third-party services (with limits)
| Service | Used for | Free limit / catch |
|---|---|---|
| **Google Analytics 4** | Visitor statistics | Free. Create a property at analytics.google.com, copy the *Measurement ID* (looks like `G-XXXXXXXXXX`), paste it in **Admin → API keys → Google Analytics ID**. Statistics appear in Google Analytics after about 24 hours. |
| **Google Search Console** | Appearing in Google search | Free. Add the site, copy the verification code into **Admin → Website → SEO → Google Search Console code**. |
| **Google login** | "Sign in with Google" button | Free. Needs the client's own Google Cloud project (Client ID and Secret); paste them in Admin > API keys. |
| **Gmail / SMTP email** | Order emails | Free with a Gmail app password (about 500 mails a day). |
| **AI chat assistant (Gemini)** | Website chat | Free tier has daily limits and slower answers at busy times. The key now in use is the developer's own: the client must create their own key. |
| **Hosting (Vercel) and database (Prisma Postgres)** | The website | Free "Hobby" plans exist, but Vercel's Hobby plan is for personal, non-commercial use. A business website taking payments should use a paid plan (about US$20 per month). |
| **File storage (Vercel Blob)** | Uploaded Kundli, certificates, images | Small free allowance, then pay per use. |

## 3. Paid (cannot be free)
| Item | Typical cost | Why |
|---|---|---|
| **Domain name** (e.g. kanadjyotish.in) | about ₹700–1,500 per year | Needed for a proper web address and email. |
| **Razorpay payments** | no setup fee; about 2% + GST per payment | Customers pay online by UPI/card. Until it is connected, customers pay to the Kendra's UPI/bank and enter the reference number. |
| **SMS OTP (MSG91)** | pay per SMS; India needs DLT registration | Without it, mobile-OTP login cannot send codes. Password and Google login still work. |
| **Google Play account** | US$25 one time | To publish the Android app. |
| **Apple Developer account** | US$99 per year | Only if an iPhone app is wanted. |
| Hosting upgrade, if traffic grows | from about US$20 per month | See above. |

## 4. How to see visitor numbers (Google Analytics) – 5 steps
1. Sign in at analytics.google.com with the Kendra's Google account → *Create property* → choose *Web* → enter the site address.
2. Copy the **Measurement ID** (`G-…`).
3. On the website: **Admin → API keys & Analytics → Google Analytics ID** → paste → Save.
4. Open the live site once, then check Google Analytics → *Reports → Realtime*: you should see yourself.
5. To pause all tracking at any time: **Admin → Website settings → Analytics → Allow visitor statistics** off.

## 5. Before the site goes fully live – checklist for the client
- [ ] Domain bought and pointed to the site
- [ ] Razorpay account approved (keys added in Admin → API keys)
- [ ] MSG91 account and DLT template (for OTP)
- [ ] Gmail app password (order emails)
- [ ] Google Analytics ID and Search Console code
- [ ] Own Gemini key, Google login keys
- [ ] Legal texts approved (Privacy, Terms and so on)
- [ ] Real address, phone and UPI/bank details in Admin → Settings
