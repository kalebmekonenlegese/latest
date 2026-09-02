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
- Successful payment confirmation to the guest

## Stripe payment configuration

Payments require both a server secret and a browser publishable key:

```env
STRIPE_SECRET_KEY=sk_live_your-secret-key
VITE_STRIPE_PUBLIC_KEY=pk_live_your-publishable-key
```

The backend creates and verifies PaymentIntents. The booking page uses Stripe Elements when `VITE_STRIPE_PUBLIC_KEY` is available. Payment setup is rejected until both Stripe keys are configured; there is no local payment simulator or fake confirmation path.
