# Mobile App Development Plan
**Project:** Maharshi Kanad Jyotish Kendra – Android (and later iOS) app
**Status:** Plan for approval · Prepared 26 Oct 2026

---

## 1. Where we are today

| Item | State |
|---|---|
| Website / backend | Live (Next.js, Postgres, Vercel). Bookings, payments, vault, associates, admin panel, Panchang, AI chat, backups. |
| Android app | A **WebView wrapper** exists in `android-app/` (opens the live site; pull-to-refresh, offline screen, external links). Not yet published. |
| Panchang | Real calculation (done). Kundli and Matching use embedded AstroSage tools (done). |
| Legal documents | 5 client documents saved untouched in `docs/client-documents/` (see §9 – they need a decision before use). |

## 2. Decision to make first: which kind of app?

| Option | What it is | Cost / time | Quality | Verdict |
|---|---|---|---|---|
| **A. WebView wrapper** (what we have) | Website inside an app shell | Days | Feels like a website; weak offline; Play Store may reject "thin" apps | Quick start only |
| **B. React Native (Expo)** | Real mobile app, one codebase for Android + iOS, uses the same backend | 6–8 weeks | Native feel, push notifications, camera/file upload, offline cache | **Recommended** |
| **C. Fully native Kotlin + Swift** | Two separate apps | 4+ months | Best, most costly | Not needed for this business |

**Recommendation:** Ship A to Play Store *now* as a stop-gap only if the client needs a presence this month; build **B** as the real app. Both talk to the same backend, so no admin changes are needed.

## 3. Scope of version 1.0 (B)

**Visitor / customer**
1. Home: banners, Panchang card, services, offers, marquee, social links (from Admin → Website).
2. Services → details → **Booking** → payment (Razorpay) → order tracking.
3. Kundli, Kundli Matching, Panchang (embedded tools, full screen).
4. Login: mobile OTP, email + password, Google (native sign-in). Logout, delete account.
5. My Documents (vault): upload Kundli (camera/gallery/files), in-app viewer for PDF/image/video, download, share.
6. Credentials (GST, MSME, Trademark, ISO): view, download, print/share.
7. Contact: call, WhatsApp, map, enquiry form. AI chatbot.
8. Language: Hindi (default) / English.
9. Push notifications: booking confirmed, status updates, reports ready, offers.

**Associate**: dashboard, referral link/QR share, commissions, payout details, payout requests.

**Admin (v1.1, optional):** order status updates and push broadcast. Full admin stays on the web panel.

**Out of scope for 1.0:** video consultation, in-app purchases, iOS release (follows after Android).

## 4. Architecture

```
React Native (Expo) app ──HTTPS/JSON──► Existing Next.js backend (/api/mobile/v1/*)
                                          ├─ Postgres (Prisma)
                                          ├─ Razorpay, MSG91, Vercel Blob
                                          └─ Firebase Cloud Messaging (push)
```

Backend work required (new, in this repo):
- `/api/mobile/v1` – token auth (short-lived access token + refresh token, stored in the phone's secure storage). The website's cookie sessions are not used by the app.
- Device registration table + push sending (FCM).
- Endpoints for the lists above (most already exist as web APIs – wrap, version and document them).
- Rate limiting and the same role checks as web (USER / ASSOCIATE / ADMIN).
- Public API docs (`docs/MOBILE_API.md`) and automated tests for each endpoint.

## 5. Phases, deliverables, acceptance

| Phase | Duration* | Deliverable | Done when |
|---|---|---|---|
| **0. Setup** | 2–3 days | Expo project, CI build, app name/ID (`in.kanadjyotish.app`), Firebase project, design tokens from the website theme | Hello-world APK installs |
| **1. Backend mobile API** | 1 week | Auth, device tokens, public content endpoints, tests | All endpoints pass tests; API doc complete |
| **2. Core screens** | 2 weeks | Home, Services, Booking flow, Payment, Orders, Login/OTP, Profile | A test booking completes with a test payment |
| **3. Vault, credentials, tools** | 1 week | Upload/view files, credentials, Panchang/Kundli/Matching, contact, chatbot | Upload + view for PDF, image, video, Word (download) works |
| **4. Associate module + push** | 1 week | Associate dashboard, payouts, push notifications | Push arrives for status change |
| **5. QA & hardening** | 1 week | Test on 5+ real devices (low-end included), accessibility, performance, security review | Zero critical/high bugs open |
| **6. Store release** | 3–5 days + Google review | Signed AAB, store listing, screenshots (Hindi + English), privacy/data-safety forms | Live on Google Play |

\*Estimates for one developer working full time; add buffer for Google review (a few days) and client feedback rounds.

## 6. Quality gates (every phase)

- All new code covered by automated tests; `lint`, `type-check` and test suite pass before merge.
- No secrets in the app. Production keys only on the server.
- Demo/sample data never shown to real users (the rule we just applied to Panchang/Kundli).
- Release checklist: signed build, crash reporting (Sentry/Crashlytics), version number, changelog, rollback plan (previous AAB retained).
- Staged rollout: internal testing → closed testing (client + 10 users) → 20% → 100%.

## 7. Security & privacy requirements

- Tokens in Expo SecureStore; HTTPS only; certificate-safe API base URL.
- Uploaded Kundli files stay private (owner + admin only), as on the web.
- Account deletion in-app (Google Play requirement) and data-safety form accuracy.
- OTP rate limits, payment verified on the server (webhook), never trusted from the app.
- Permissions requested only when needed (camera/files for upload, notifications).

## 8. What we need from the client (blocking items)

1. **Google Play Console account** ($25 one-time) in the client's name.
2. **Final app name, icon** (Logo.jpeg is in use) and screenshots approval.
3. **Razorpay live keys**, **MSG91** (OTP) account/template, **Gmail SMTP**, **Google login keys**, **Gemini/AI key** – on the client's own accounts.
4. **Firebase** project (we can create it under the client's Google account).
5. **Legal documents for *this* business** (see §9).
6. Decision on iOS (Apple Developer account $99/year) – optional, later.

## 9. Legal documents – important

The five documents received (Privacy Policy, Terms & Conditions, Platform Guidelines, Member Agreement, Rules and Regulations) are written for **"Vindhya Vivah Sanskar"**, a matrimonial platform – a different business, with matrimonial-specific terms (profiles, matches, membership).

- They are stored **unchanged** in `docs/client-documents/`.
- They have **not** been published on this website or put in the app, because Google Play and users will see another business's name and clauses that do not apply (profiles, matchmaking).
- Next step: the client confirms whether (a) Vindhya Vivah Sanskar is a related business sharing this platform, or (b) these are templates. For (b) we adapt the wording to Maharshi Kanad Jyotish Kendra (consultations, Kundli, payments, refunds, associates) and the client/their lawyer approves the final text before it goes live and into the store listing.
- A privacy-policy URL is mandatory for the Play Store; the site already has `/legal/privacy` ready to hold the approved text.

## 10. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Play Store rejects thin WebView app | Delay | Build real RN app; use wrapper only as interim and with native features |
| Third-party embed (AstroSage) blocks or changes | Tools stop loading | Admin can change the tool address; fallback "open full screen" link |
| OTP/SMS provider not ready | Login blocked | Email+password and Google login as alternates |
| Payment compliance | Launch delay | Test mode first; live keys only after client KYC |
| Scope creep | Late delivery | Version 1.0 scope frozen in §3; new ideas go to 1.1 backlog |

## 11. Tonight (kick-off checklist)

1. Client/you approve **Option B** and the v1.0 scope in §3.
2. Create the Expo project and repo folder `mobile-app/`; connect Firebase.
3. Start Phase 1: design the `/api/mobile/v1` auth (access + refresh tokens) and write its tests first.
4. Ask the client for the items in §8 and the legal-document decision in §9.
