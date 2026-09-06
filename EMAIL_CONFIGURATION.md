# Transactional Email Configuration

The backend uses Nodemailer with SMTP for booking, contact, and payment notifications.

Set these environment variables before starting the server:

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=hotel@example.com
SMTP_PASS=your-smtp-password
EMAIL_FROM=Hatsey Kaleb Hotel <hotel@example.com>
HOTEL_NOTIFICATION_EMAIL=reservations@example.com
```

`SMTP_HOST`, `EMAIL_FROM`, and `HOTEL_NOTIFICATION_EMAIL` are required to enable delivery. When SMTP is not configured, workflows continue safely and return `emailSent: false`; the application does not claim that a message was sent.

Notifications currently connected:

- New booking request to the guest and hotel notification address
- Contact form notification to the hotel notification address
- Successful payment confirmation to the guest and hotel notification address
- Booking cancellation to the guest and hotel notification address, including refund status

The shared service exposes `sendBookingConfirmation`, `sendHotelNotification`,
`sendPaymentConfirmation`, and `sendCancellationEmail`. Delivery remains non-blocking:
booking and payment workflows continue when SMTP is unavailable, with `emailSent: false`.

## Local SMTP smoke test

Mailtrap is suitable for local verification. Add its SMTP credentials and a test recipient:

```env
EMAIL_TEST_RECIPIENT=your-mailtrap-inbox@example.com
```

Then run:

```bash
npm run email:test
```

The command exits successfully only when Nodemailer reports a sent message. Confirm the
message appears in the Mailtrap inbox before marking email delivery complete.

## Stripe payment configuration

Payments require both a server secret and a browser publishable key:

```env
STRIPE_SECRET_KEY=sk_live_your-secret-key
VITE_STRIPE_PUBLIC_KEY=pk_live_your-publishable-key
```

The backend creates and verifies PaymentIntents. The booking page uses Stripe Elements when `VITE_STRIPE_PUBLIC_KEY` is available. Payment setup is rejected until both Stripe keys are configured; there is no local payment simulator or fake confirmation path.
