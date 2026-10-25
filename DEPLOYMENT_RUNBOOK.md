# Maharshi Kanad Jyotish Kendra (महर्षि कणाद ज्योतिष केंद्र)
# Production Deployment Runbook & Key Management Guide

> **Target Domain**: `https://kanadjyotishkendra.vercel.app/`  
> **Database**: PostgreSQL (Prisma ORM)  
> **Framework**: Next.js 14 (App Router) + NextAuth + next-intl (Hindi/English)

---

## 1. Master Encryption Key (`CREDENTIALS_ENCRYPTION_KEY`)

The system utilizes an **AES-256-GCM authenticated cipher** to encrypt third-party API credentials (Razorpay secrets, MSG91 auth key, Facebook app secret, AstroSage API key) at rest in the PostgreSQL database (`AdminSettings` table).

### 1.1 Key Generation
Generate a cryptographically secure 32-byte (256-bit) base64 string before initial production deployment:

```bash
# On Linux / macOS / Git Bash:
openssl rand -base64 32

# On Windows PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 1.2 Configuration
Add this key into the Vercel Project Environment Variables:
```env
CREDENTIALS_ENCRYPTION_KEY="your-generated-32-byte-base64-string"
```

### 1.3 Key Backup Procedure (Critical)
1. Store this master key in the client's corporate password manager (e.g., 1Password, Bitwarden, or secure vault).
2. Maintain an offline, encrypted backup with the Kendra lead administrator.

### 1.4 Loss Consequences & Fail-Closed Behavior
- **Fail-Closed Security**: In `production` (`NODE_ENV=production`), if `CREDENTIALS_ENCRYPTION_KEY` is missing or undefined, the server halts and refuses to decrypt or write credentials, returning `HTTP 503 Service Unavailable`.
- **Key Loss**: If the key is permanently lost or overwritten, existing encrypted secrets in the database **cannot be recovered or decrypted**. The administrator must log into `/admin/settings/keys` and re-enter all API keys.

---

## 2. Complete Environment Variables Checklist

Set these in Vercel **Settings > Environment Variables**:

| Variable | Required in Prod | Description / Where to Obtain |
| :--- | :---: | :--- |
| `DATABASE_URL` | **Yes** | PostgreSQL connection string with connection pool (`postgresql://...`) |
| `NEXTAUTH_URL` | **Yes** | `https://kanadjyotishkendra.vercel.app` |
| `NEXTAUTH_SECRET` | **Yes** | Random 32+ character string (`openssl rand -base64 32`) |
| `CREDENTIALS_ENCRYPTION_KEY` | **Yes** | Master AES-256-GCM key for DB credentials vault |
| `INITIAL_ADMIN_PASSWORD` | **Yes** | Strong password for initial `admin@kanadastro.org` seed |
| `CRON_SECRET` | **Yes** | Bearer secret for Vercel Cron (`/api/cron/expire-reservations`) |
| `TRUST_PROXY` | **Yes** | Set to `"true"` on Vercel so rate limiter reads real client IP |
| `NEXT_PUBLIC_APP_URL` | **Yes** | `https://kanadjyotishkendra.vercel.app` |
| `DEMO_PAYMENT_ALLOWED` | Recommended `false` | Set to `"false"` in production for live Razorpay payments |
| `RAZORPAY_KEY_ID` | Optional in Env | Can be set in `/admin/settings/keys` or env |
| `RAZORPAY_KEY_SECRET` | Optional in Env | Can be set in `/admin/settings/keys` or env |
| `RAZORPAY_WEBHOOK_SECRET` | Optional in Env | Can be set in `/admin/settings/keys` or env |
| `MSG91_AUTH_KEY` | Optional in Env | Can be set in `/admin/settings/keys` or env |
| `MSG91_SENDER_ID` | Optional in Env | 6-character registered DLT sender ID |
| `MSG91_OTP_TEMPLATE_ID` | Optional in Env | Registered DLT OTP template ID |
| `GOOGLE_CLIENT_ID` | Optional in Env | Can be set in `/admin/settings/keys` or env |
| `GOOGLE_CLIENT_SECRET` | Optional in Env | Can be set in `/admin/settings/keys` or env |
| `ASTROSAGE_USER_ID` | Optional in Env | Can be set in `/admin/settings/keys` or env |
| `ASTROSAGE_API_KEY` | Optional in Env | Can be set in `/admin/settings/keys` or env |
| `GOOGLE_ANALYTICS_ID` | Optional in Env | Can be set in `/admin/settings/keys` or env (`G-XXXXXXXXXX`) |

---

## 3. Deployment Steps

### 3.1 Initial Database Setup
Apply all committed Prisma migrations:
```bash
npx prisma migrate deploy
```

### 3.2 Database Seeding (First Time Only)
Populates demo catalog, default admin credentials, site settings, and initial translations:
```bash
npx prisma db seed
```

### 3.3 Production Build Verification
Verify TypeScript types, linting, and Next.js static asset build:
```bash
npm run typecheck
npm run build
```

### 3.4 Automated Testing
Ensure all Vitest test suites and Playwright E2E suites are green:
```bash
npm test
npx playwright test
```

---

## 4. Admin Setup Post-Deployment

Once deployed:
1. Log in to `https://kanadjyotishkendra.vercel.app/en/auth/signin` with `admin@kanadastro.org` and `INITIAL_ADMIN_PASSWORD`.
2. Navigate to **Admin Panel > API Keys & Integrations** (`/admin/settings/keys`).
3. Paste client API keys:
   - Razorpay Key ID & Key Secret
   - MSG91 SMS Auth Key & DLT Template IDs
   - Google & Facebook OAuth Credentials
   - AstroSage API Key & User ID
   - Google Analytics ID (`G-...`)
   - Google Map Embed Iframe URL
4. Navigate to **Site Settings** (`/admin/settings`) to update Sanctum phone numbers, email, addresses, and social media handles. All changes take effect immediately across Header, Footer, and Floating Action components without any code deployments.
