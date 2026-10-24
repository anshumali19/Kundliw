# Production Deployment & Environment Guide

> **Maharshi Kanad Jyotish Kendra (महर्षि कणाद ज्योतिष केंद्र)**  
> Comprehensive Guide for Vercel, PostgreSQL, and Continuous Integration

---

## 1. Live Production Details

- **Production URL**: [https://kanad-jyotish-kendra.vercel.app](https://kanad-jyotish-kendra.vercel.app)
- **Vercel Project**: `kanad-jyotish-kendra` (Team / Account: `anshu-be4d`)
- **GitHub Repository**: [https://github.com/anshumali19/Kundliw.git](https://github.com/anshumali19/Kundliw.git)
- **Production Branch**: `main`

---

## 2. Environment Variables Matrix

Create a production `.env` file or populate the environment variables within your Vercel Project Settings (`Settings` → `Environment Variables`):

| Variable | Required | Default / Example | Purpose |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | **Yes** | `postgresql://user:pass@host:5432/db?sslmode=require` | Connection string to hosted PostgreSQL instance. |
| `NEXTAUTH_URL` | **Yes** | `https://kanad-jyotish-kendra.vercel.app` | Canonical domain for authentication callback URLs. |
| `NEXTAUTH_SECRET` | **Yes** | `min_32_characters_random_string` | Secret key used to encrypt NextAuth session JWTs. |
| `DEMO_MODE` | **Yes** | `"true"` (Demo) / `"false"` (Live) | Safety guard. When `false`, requires real vendor credentials. |
| `INITIAL_ADMIN_PASSWORD` | **Yes** | `ChangeMeInAdminSettings@2026` | Seed password for default admin account. |
| `DEMO_ACCESS_PASSWORD` | No | `""` or `secretpass2026` | Optional site-wide password gate protecting demo site. |
| `GA_MEASUREMENT_ID` | No | `G-XXXXXXXXXX` | Google Analytics ID. Loaded only when populated. |
| `RAZORPAY_KEY_ID` | Prod | `rzp_live_xxxxxxxxxxxx` | Live Razorpay merchant Key ID. |
| `RAZORPAY_KEY_SECRET` | Prod | `live_secret_key` | Live Razorpay API secret key. |
| `RAZORPAY_WEBHOOK_SECRET` | Prod | `whsec_xxxxxxxxxxxx` | Secret for HMAC-SHA256 signature verification. |
| `MSG91_AUTH_KEY` | Prod | `auth_key_string` | MSG91 SMS gateway authentication key. |
| `MSG91_SENDER_ID` | Prod | `KANADJ` | 6-character DLT-registered sender ID. |
| `MSG91_OTP_TEMPLATE_ID` | Prod | `dlt_template_id` | Approved SMS DLT template for OTP verification. |
| `ASTROSAGE_USER_ID` | Prod | `astrosage_user_id` | Production astronomical calculations API account. |
| `ASTROSAGE_API_KEY` | Prod | `astrosage_api_key` | AstroSage mathematical ephemeris access key. |
| `AWS_S3_BUCKET_NAME` | Prod | `kanad-jyotish-private-vault` | S3 bucket for private Kundli chart dossiers. |
| `AWS_S3_REGION` | Prod | `ap-south-1` | AWS Mumbai region for low-latency Indian access. |
| `AWS_ACCESS_KEY_ID` | Prod | `AKIA...` | IAM user with S3 read/write permissions. |
| `AWS_SECRET_ACCESS_KEY` | Prod | `secret_access_key` | IAM secret access key. |

---

## 3. Database Setup & Initialization

### 3.1 Supported PostgreSQL Providers
The platform is compatible with any modern PostgreSQL (v14+) database:
- **Vercel Postgres / Neon**: Zero-config serverless PostgreSQL with connection pooling.
- **Supabase**: Managed PostgreSQL with connection pooler (`port 6543` / `sslmode=require`).
- **AWS RDS / Railway**: Traditional persistent PostgreSQL instances.

### 3.2 Initialize Database Schema
Run the following commands locally or via CI/CD pipelines connected to the target database:

```bash
# 1. Generate Prisma Client
npx prisma generate

# 2. Push schema to database
npx prisma db push

# 3. Seed demo dataset (services, plans, demo accounts, sample orders, and Kendra settings)
npx ts-node prisma/seed.ts
```

---

## 4. Deploying to Vercel

### 4.1 Automated Git Deployments (Recommended)
Any push to the `main` branch of `https://github.com/anshumali19/Kundliw.git` automatically triggers a zero-downtime deployment on Vercel:

```bash
git add -A
git commit -m "feat: your feature description"
git push origin main
```

### 4.2 Manual Vercel CLI Deployment
You can also deploy directly from your local terminal using the Vercel CLI:

```bash
# Build and deploy directly to production
npx vercel --prod --yes
```

---

## 5. Build & Verification Pipeline

Every deployment executes the following automated verification checks:

1. **TypeScript Typecheck**:
   ```bash
   npm run typecheck
   # Output: tsc --noEmit (0 errors)
   ```
2. **Automated Unit & Integration Tests**:
   ```bash
   npm test
   # Output: 97 passed across 17 test suites (Vitest)
   ```
3. **Next.js Production Build**:
   ```bash
   npm run build
   # Output: Next.js 14 App Router compiled successfully with static & dynamic routes
   ```

---

## 6. Custom Domain & SSL Setup

1. In the **Vercel Dashboard**, navigate to **Project Settings** → **Domains**.
2. Add your custom domain (e.g., `kanadastro.org` and `www.kanadastro.org`).
3. In your DNS provider (Cloudflare, GoDaddy, Namecheap), add the corresponding records:
   - **Apex domain (`@`)**: `A` record pointing to `76.76.21.21`.
   - **Subdomain (`www`)**: `CNAME` record pointing to `cname.vercel-dns.com`.
4. Vercel automatically provisions and renews SSL/TLS certificates via Let's Encrypt with HTTP/2 and HTTP/3 support.
