const prisma = require('../utils/db');
const { frontendUrl, chapaSecretKey, chapaApiBaseUrl, chapaCallbackUrl, chapaReturnUrl } = require('../config');
const { createPaymentIntent: createLegacyPaymentIntent, confirmPayment: confirmLegacyPayment } = require('./paymentService');

const CHAPA_API_BASE_URL = process.env.CHAPA_API_BASE_URL || chapaApiBaseUrl || 'https://api.chapa.co/v1';
const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY || chapaSecretKey || 'chapa-test-secret';
const CHAPA_CALLBACK_URL = process.env.CHAPA_CALLBACK_URL || chapaCallbackUrl || `${frontendUrl || 'http://localhost:3000'}/api/payments/chapa/callback`;
const CHAPA_RETURN_URL = process.env.CHAPA_RETURN_URL || chapaReturnUrl || `${frontendUrl || 'http://localhost:3000'}/booking/success`;

const findBookingForPayment = ({ bookingId, userId, guestEmail }) => prisma.booking.findFirst({
  where: userId ? { id: bookingId, userId } : { id: bookingId, email: guestEmail }
});

const getDepositAmount = (booking) => {
  const nightlyRate = Number(booking.pricePerNight);
  const rooms = Number(booking.rooms) || 1;
  if (nightlyRate > 0) return nightlyRate * rooms;
  return Number(booking.totalPrice) / (Number(booking.nights) || 1);
};

const normalizeCurrency = (value) => {
  const normalized = String(value || 'ETB').trim().toUpperCase();
  return normalized === 'USD' ? 'USD' : 'ETB';
};

const shouldUseLegacyPaymentFlow = () => typeof globalThis.fetch !== 'function' || (!process.env.CHAPA_SECRET_KEY && !chapaSecretKey);

const initializeChapaPayment = async ({ bookingId, userId, guestEmail, ...rest }) => {
  if (shouldUseLegacyPaymentFlow()) {
    return createLegacyPaymentIntent({ bookingId, userId, guestEmail, ...rest });
  }

  if (!bookingId) {
    const error = new Error('Booking ID required');
    error.status = 400;
    throw error;
  }

  const booking = await findBookingForPayment({ bookingId, userId, guestEmail });
  if (!booking) {
    const error = new Error('Booking not found');
    error.status = 404;
    throw error;
  }

  const amount = Number(booking.totalPrice || getDepositAmount(booking) || 0);
  const txRef = `hotel-${booking.id}-${Date.now()}`;
  const currency = normalizeCurrency(booking.currency || 'ETB');

  const response = await fetch(`${CHAPA_API_BASE_URL}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: amount.toFixed(2),
      currency,
      email: booking.email || guestEmail || 'guest@example.com',
      first_name: booking.firstName || 'Guest',
      last_name: booking.lastName || 'User',
      phone_number: booking.phone || '+251900000000',
      tx_ref: txRef,
      callback_url: CHAPA_CALLBACK_URL,
      return_url: CHAPA_RETURN_URL,
      customization: {
        title: 'Hatsey Kaleb Hotel',
        description: `Payment for booking ${booking.id}`
      }
    })
  });

  const payload = await response.json();

  if (!response.ok || payload?.status !== 'success' || !payload?.data?.checkout_url) {
    const error = new Error(payload?.message || 'Chapa payment initialization failed');
    error.status = response.status || 502;
    throw error;
  }

  const payment = await prisma.payment.create({
    data: {
      bookingId: booking.id,
      amount,
      currency,
      status: 'pending',
      clientSecret: txRef,
      chapaTxRef: txRef,
      chapaCheckoutUrl: payload.data.checkout_url,
      chapaPaymentId: payload.data.payment_id || null,
      chapaStatus: 'pending'
    }
  });

  return {
    bookingId: booking.id,
    amount,
    currency,
    txRef,
    checkoutUrl: payload.data.checkout_url,
    paymentId: payment.id,
    status: 'pending',
    clientSecret: txRef,
    paymentIntentId: payment.id,
    stripePaymentIntentId: txRef,
    requestId: `chapa-${booking.id}`
  };
};

const verifyChapaPayment = async ({ tx_ref, bookingId, paymentIntentId, paymentMethodId, userId, guestEmail, ...rest }) => {
  if (shouldUseLegacyPaymentFlow()) {
    return confirmLegacyPayment({
      bookingId,
      paymentIntentId: paymentIntentId || tx_ref,
      paymentMethodId,
      userId,
      guestEmail: guestEmail || rest.email
    });
  }

  if (!tx_ref && paymentIntentId) {
    return confirmLegacyPayment({
      bookingId,
      paymentIntentId,
      paymentMethodId,
      userId,
      guestEmail: guestEmail || rest.email
    });
  }

  if (!tx_ref) {
    const error = new Error('Transaction reference required');
    error.status = 400;
    throw error;
  }

  const payment = await prisma.payment.findFirst({
    where: { chapaTxRef: tx_ref }
  });

  if (!payment) {
    const error = new Error('Payment not found');
    error.status = 404;
    throw error;
  }

  if (bookingId && payment.bookingId !== bookingId) {
    const error = new Error('Payment intent not found');
    error.status = 404;
    throw error;
  }

  const response = await fetch(`${CHAPA_API_BASE_URL}/transaction/verify/${tx_ref}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${CHAPA_SECRET_KEY}`
    }
  });

  const payload = await response.json();
  if (!response.ok || payload?.status !== 'success') {
    const error = new Error(payload?.message || 'Chapa payment verification failed');
    error.status = response.status || 502;
    throw error;
  }

  const verified = payload.data || {};
  const status = verified.status === 'success' ? 'success' : 'failed';

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status,
      chapaStatus: status,
      chapaPaymentId: verified.payment_id || payment.chapaPaymentId,
      currency: normalizeCurrency(verified.currency || payment.currency || 'ETB')
    }
  });

  if (status === 'success') {
    const booking = await prisma.booking.findUnique({ where: { id: payment.bookingId } });
    if (booking) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: 'CONFIRMED',
          paymentId: payment.id,
          confirmedAt: new Date()
        }
      });
    }

    const confirmedBooking = {
      bookingId: payment.bookingId,
      status: 'CONFIRMED',
      confirmationNumber: `CONF-${payment.bookingId.slice(0, 8).toUpperCase()}`,
      totalPrice: Number(payment.amount || 0)
    };

    return {
      success: true,
      status: 'success',
      bookingId: payment.bookingId,
      txRef: tx_ref,
      amount: Number(verified.amount || payment.amount || 0),
      currency: normalizeCurrency(verified.currency || payment.currency || 'ETB'),
      booking: confirmedBooking,
      paymentIntentId: payment.id,
      stripePaymentIntentId: tx_ref
    };
  }

  return {
    success: false,
    status: 'failed',
    bookingId: payment.bookingId,
    txRef: tx_ref,
    amount: Number(verified.amount || payment.amount || 0),
    currency: normalizeCurrency(verified.currency || payment.currency || 'ETB'),
    booking: { bookingId: payment.bookingId, status: 'failed' }
  };
};

const handleChapaCallback = async (req, res) => {
  const { tx_ref, status, amount, currency, reference } = req.body || {};

  if (!tx_ref) {
    return res.status(400).json({ success: false, error: 'Missing transaction reference' });
  }

  try {
    const result = await verifyChapaPayment({ tx_ref });
    const redirect = `${process.env.FRONTEND_URL || frontendUrl || 'http://localhost:3000'}/booking/success?status=${encodeURIComponent(result.status)}&tx_ref=${encodeURIComponent(tx_ref)}`;
    return res.redirect(redirect);
  } catch (error) {
    const redirect = `${process.env.FRONTEND_URL || frontendUrl || 'http://localhost:3000'}/booking/failure?tx_ref=${encodeURIComponent(tx_ref)}&error=${encodeURIComponent(error.message)}`;
    return res.redirect(redirect);
  }
};

module.exports = {
  initializeChapaPayment,
  verifyChapaPayment,
  handleChapaCallback
};
