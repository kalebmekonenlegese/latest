# Deployment Guide

This guide explains how to deploy the Hatsey Kaleb Hotel project safely and consistently across local development, Render, Vercel, and production services.

## 1. Prerequisites

- Node.js 22+
- PostgreSQL database (local or Supabase)
- Prisma CLI
- Render account for backend hosting
- Vercel account for frontend hosting
- Stripe account for payments
- SMTP provider for email notifications
- Optional SMS provider for guest messaging

## 2. Local development setup

1. Copy `.env.example` to `.env`.
2. Fill in only your local values.
3. Start PostgreSQL locally or connect to Supabase.
4. Run Prisma migration setup:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```
5. Start the backend:
   ```bash
   node server.js
   ```
6. Start the frontend:
   ```bash
   npm run dev -- --host 127.0.0.1 --port 5173
   ```

## 3. Supabase setup

1. Create a new Supabase project.
2. Open Project Settings → Database.
3. Copy the connection strings:
   - `DATABASE_URL`
   - `DIRECT_URL` (if used by Prisma)
4. Enable SSL and use the pooler or direct connection depending on your deployment model.
5. Create database tables by running Prisma migrations:
   ```bash
   npx prisma migrate deploy
   ```
6. Optional: enable row-level security rules if you intend to expose the database directly to the frontend.

## 4. Prisma migrations

Run the following in the project root:

```bash
npx prisma generate
npx prisma migrate dev
npx prisma db push
```

For production deployment use:

```bash
npx prisma migrate deploy
```

## 5. Render environment variables

Set the following in Render:

```env
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-frontend-domain.com
CORS_ORIGIN=https://your-frontend-domain.com
BACKEND_URL=https://your-backend-domain.com
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
JWT_SECRET=your-jwt-secret
COOKIE_SECRET=your-cookie-secret
SESSION_SECRET=your-session-secret
CSRF_SECRET=your-csrf-secret
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
EMAIL_FROM=noreply@your-domain.com
HOTEL_NOTIFICATION_EMAIL=reservations@your-domain.com
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CURRENCY=usd
SENTRY_DSN=
SENTRY_RELEASE=hatsey-kaleb-hotel@1.0.0
LOG_LEVEL=info
```

After setting the production database URL, run the tracked migrations before accepting traffic:

```bash
npm ci
npx prisma generate
npm run db:migrate:deploy
```

The backend startup log prints the effective environment, cookie policy, CORS origins, and backend CSP origin. In production it should report `sameSite=none` and `secure=true`.

Use Render’s environment variable editor or dashboard to add each value.

## 6. Vercel environment variables

For the frontend site, add:

```env
VITE_API_URL=https://your-backend-url.com
VITE_GA_MEASUREMENT_ID=
VITE_GTM_ID=
VITE_CLARITY_PROJECT_ID=
VITE_STRIPE_PUBLIC_KEY=pk_live_...
VITE_DEPLOYMENT_ENV=production
```

In Vercel, set these in Project Settings → Environment Variables.

## 7. Stripe configuration

1. Create a Stripe account.
2. Copy the secret key from the dashboard.
3. Add the publishable key to the frontend env.
4. Create a webhook endpoint for events such as checkout and payment status changes.
5. Set the webhook secret in `STRIPE_WEBHOOK_SECRET`.
6. Confirm the endpoint is configured for the correct production backend URL.

Recommended webhook events:
- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.failed`

## 8. SMTP configuration

Use any standard SMTP provider such as:
- SendGrid
- Mailgun
- Resend
- Postmark
- Custom SMTP relay

Required variables:

```env
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=
HOTEL_NOTIFICATION_EMAIL=
```

If SMTP is missing, the app should gracefully skip email delivery instead of crashing.

## 9. SMS provider configuration

If SMS notifications are enabled in the future, configure one of the following providers:
- Twilio
- MessageBird
- Vonage

Example env values:

```env
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

Keep the values in the deployment environment, never in the repository.

## 10. Secrets and Git hygiene

- Never commit `.env` files.
- Keep `.env.example` as the tracked template only.
- Verify `.gitignore` contains `.env` and related local env files.
- Use a secret manager when moving to production-level operations.

## 11. Suggested production checklist

- [ ] Supabase project created and database accessible
- [ ] Prisma migrations applied successfully
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] Stripe keys and webhook configured
- [ ] SMTP credentials validated
- [ ] Health endpoint responds
- [ ] Booking flow tested end-to-end
- [ ] No secrets remain in Git history or tracked files
