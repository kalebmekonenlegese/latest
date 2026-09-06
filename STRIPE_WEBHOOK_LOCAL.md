# Local Stripe Webhooks

## Prerequisites

1. Install and authenticate the Stripe CLI.
2. Start the backend with `node server.js`.
3. Confirm the backend responds at `http://localhost:3000/health`.

## Listen and configure the secret

Start forwarding events to the raw-body webhook route:

```powershell
stripe listen --forward-to http://localhost:3000/api/payments/webhook
```

The CLI prints a signing secret beginning with `whsec_`. Put that value in the local `.env` file:

```dotenv
STRIPE_WEBHOOK_SECRET=whsec_your_listener_secret
```

Restart `node server.js` after changing `.env`. Do not commit `.env` or the signing secret.

## Trigger a test event

```powershell
stripe trigger payment_intent.succeeded
```

The listener should show a forwarded request with HTTP `200`. The backend records webhook handling in `logs/audit.log` with `action` set to `payment_webhook`.

The fixture event may be marked `ignored` when its PaymentIntent does not match a local payment record. To verify booking processing, replay a real successful event whose PaymentIntent ID exists in the local `Payment` table:

```powershell
stripe events resend evt_your_matching_event_id
```

A processed event has `status: "success"`, `eventType: "payment_intent.succeeded"`, and the matching `bookingId` in the audit log.

## Signature failure check

An invalid `Stripe-Signature` header should return HTTP `400`. A missing `STRIPE_WEBHOOK_SECRET` returns HTTP `503`, which indicates the backend must be restarted or configured before webhook validation can succeed.