# TERRAA HOTELS — Netlify Deployment Guide

This guide covers everything required to deploy the TERRAA HOTELS production website and booking engine to **Netlify** with zero downtime, full database migrations, Razorpay webhook signature verification, and automated scheduled hold release functions.

---

## 1. Connecting the Git Repository to Netlify

1. Log into your [Netlify Dashboard](https://app.netlify.com/).
2. Click **"Add new site"** > **"Import an existing project"**.
3. Select your Git provider (GitHub, GitLab, or Bitbucket) and authorize access.
4. Choose the `terraa-hotels` repository.
5. In **Build settings**:
   - **Base directory:** Leave blank (root).
   - **Build command:** `npm run build` (or `npx prisma migrate deploy && npm run build` once Postgres DB is connected).
   - **Publish directory:** `.next`
   - **Node version:** Netlify will read `NODE_VERSION = "20"` from `netlify.toml`.
6. Click **Deploy terraa-hotels**.

---

## 2. Environment Variables Checklist

Navigate to **Site configuration** > **Environment variables** in the Netlify Dashboard and add the following keys:

| Environment Variable | Description | Example / Note |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string (Netlify Database or Neon Postgres) | `postgres://user:password@ep-xyz.neon.tech/terraa?sslmode=require` |
| `RAZORPAY_KEY_ID` | Razorpay API Key ID from Dashboard | `rzp_live_xxxxxxxxxxxxxx` (or `rzp_test_...` for test mode) |
| `RAZORPAY_KEY_SECRET` | Razorpay API Secret | `xxxxxxxxxxxxxxxxxxxxxxxx` |
| `RAZORPAY_WEBHOOK_SECRET` | Secret configured on the Razorpay Webhook | A secure random string, e.g. `trh_whsec_9843924823` |
| `RESEND_API_KEY` | Resend API key for transactional booking confirmation emails | `re_xxxxxxxxxxxxxxxxxxxx` |
| `AUTH_SECRET` | 32+ character random string for NextAuth JWT encryption | Generate via `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Canonical URL of your site | `https://terraa-hotels.netlify.app` or custom domain |
| `GOOGLE_MAPS_API_KEY` | Optional Google Maps API key for map tiles / directions | `AIzaSy...` |

---

## 3. Exact Razorpay Webhook Configuration

1. Log in to your [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. In the left navigation, go to **Settings** > **Webhooks**.
3. Click **Add New Webhook**.
4. Enter the **Webhook URL**:
   ```
   https://terraa-hotels.netlify.app/api/razorpay/webhook
   ```
   *(Replace `terraa-hotels.netlify.app` with your custom domain once linked)*.
5. In the **Secret** field, enter the value matching your `RAZORPAY_WEBHOOK_SECRET` environment variable.
6. Under **Active Events**, check the following checkboxes:
   - `order.paid`
   - `payment.captured`
   - `payment.failed`
7. Click **Save Webhook**.

---

## 4. Prisma Database Migrations on Production

When `DATABASE_URL` is configured in Netlify:
- The build command configured in `netlify.toml` executes Prisma migrations against the live database automatically before compiling Next.js:
  ```bash
  npx prisma migrate deploy && npm run build
  ```
- To seed the initial 8 hotels, room types, rate plans, and 90-day inventory calendar into a fresh database:
  ```bash
  npx prisma db seed
  ```

---

## 5. Adding a Custom Domain with Automatic HTTPS

1. Go to **Site configuration** > **Domain management** in Netlify.
2. Click **Add a domain** and enter your domain name (e.g., `terraahotels.com`).
3. Set your DNS records at your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.):
   - **Apex domain (`@`):** Add an `A` record pointing to `75.2.60.5` (Netlify load balancer).
   - **Subdomain (`www`):** Add a `CNAME` record pointing to your site slug (e.g. `terraa-hotels.netlify.app`).
4. Under **SSL/TLS Certificate**, click **Verify DNS configuration** and then **Provision Certificate** for Let's Encrypt automatic free SSL renewal.

---

## 6. Scheduled Function (15-Minute Inventory Hold Release)

- The scheduled function `netlify/functions/release-holds.mts` runs every **5 minutes** on cron `*/5 * * * *`.
- It automatically finds expired holds (`expiresAt < NOW()`), restores the held inventory to available rooms, and cleans up hold tokens.
