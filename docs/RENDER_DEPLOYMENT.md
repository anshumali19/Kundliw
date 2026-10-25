# Deploying to Render

The whole stack (web app, PostgreSQL, persistent file disk, order-expiry cron) is
described in [`render.yaml`](../render.yaml).

## First deploy

1. Push this repository to GitHub (already connected: `anshumali19/Kundliw`).
2. Render Dashboard > **New > Blueprint** > pick the repository > **Apply**.
3. When prompted, fill in:
   - `INITIAL_ADMIN_PASSWORD`: a strong password you choose. It becomes the
     **Super Admin** password for `admin@kanad-jyotish.in` (first deploy only).
   - Everything else marked `sync: false` can stay **empty** for now (paid/third-party
     API placeholders: Razorpay, MSG91, SMTP, Google/Facebook login, AstroSage, GA4).
4. Render builds, runs `prisma migrate deploy`, then `scripts/render-init.js`
   (seeds demo content only if no admin exists), and starts the app.
5. Open `https://<service>.onrender.com/hi` and log in at `/hi/auth/signin/super-admin`.

## Adding paid API keys later

Either set the environment variable in Render, or (recommended) sign in as Super Admin
and use **Admin > Settings > Keys**. Keys saved there are AES-256-GCM encrypted in the
database. Until real keys exist the placeholder adapters stay active (`DEMO_MODE=true`).

When going live with real payments, set `DEMO_MODE=false`, add the Razorpay keys, and
note that production mode requires a real storage provider decision: file storage
currently uses the persistent disk at `/var/data` through `STORAGE_PATH`.

## Important

- **Back up `CREDENTIALS_ENCRYPTION_KEY`** (Render > Environment). If it is lost, saved
  API keys cannot be decrypted and must be re-entered.
- Custom domain: add it in Render, then set `NEXTAUTH_URL` to `https://your-domain`.
- Razorpay webhook URL: `https://<domain>/api/webhooks/razorpay`.
- `prisma/seed.ts` is destructive. It runs automatically only on an empty database.
- Costs: web `starter`, cron `starter`, Postgres `basic-256mb` and a 2 GB disk are paid
  Render resources. Adjust plans in `render.yaml` if needed.
