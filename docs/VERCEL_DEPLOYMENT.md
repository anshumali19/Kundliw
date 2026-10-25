# Deploying to Vercel

Everything runs on Vercel: the Next.js app (pages + API routes), Postgres, and private
file storage (Vercel Blob). `render.yaml` is kept only as an alternative.

## One-time setup

1. **Project**: Vercel > Add New > Project > import `anshumali19/Kundliw` (branch `main`).
   Framework is detected automatically. Every push to `main` redeploys.
2. **Database**: Vercel > Storage > create/connect a Postgres database (or reuse the
   existing one). Make sure `DATABASE_URL` is set for Production.
3. **File storage**: Vercel > Storage > Create > **Blob** > choose **Private**, connect to
   the project. This adds `BLOB_READ_WRITE_TOKEN` automatically.
4. **Environment variables** (Project > Settings > Environment Variables, Production):

| Variable | Value |
| :--- | :--- |
| `DATABASE_URL` | from the database (step 2) |
| `NEXTAUTH_URL` | your public URL, e.g. `https://kanadjyotishkendra.vercel.app` |
| `NEXTAUTH_SECRET` | random string: `openssl rand -base64 32` |
| `CREDENTIALS_ENCRYPTION_KEY` | random string: `openssl rand -base64 32` (back it up) |
| `INITIAL_ADMIN_PASSWORD` | your chosen Super Admin password (first seed only) |
| `CRON_SECRET` | random string; Vercel Cron sends it as a Bearer token |
| `TRUST_PROXY` | `true` |
| `DEMO_MODE` | `true` until live payment keys are added |

Paid/third-party keys (Razorpay, MSG91, SMTP, Google/Facebook, AstroSage, GA4) stay empty
until you have them; add them later in **Admin > Settings > Keys** (encrypted in the DB).

## What happens on each deploy

`vercel-build` runs `prisma migrate deploy` and then `next build`. A failing migration
fails the deploy, so a broken schema never goes live. The order-expiry job runs daily
(`vercel.json`); expiry also runs on demand inside the booking endpoints. On the Pro plan
you can change the schedule to `*/10 * * * *`.

## First-time content

On an empty database run once from your computer (set `DATABASE_URL` to the Vercel DB):

```bash
node scripts/render-init.js
```

It seeds demo content only when no admin exists. Then sign in at `/hi/auth/signin/super-admin`
with `admin@kanad-jyotish.in` and `INITIAL_ADMIN_PASSWORD`.

## Notes

- Without `BLOB_READ_WRITE_TOKEN`, uploads fail on Vercel (read-only filesystem).
- Uploaded files are private: they are only served through `/api/storage/...`, after the
  ownership/role checks.
