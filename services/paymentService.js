const prisma = require('../utils/db');
const { stripeClient, environment } = require('../config');
const { sendPaymentConfirmation, sendHotelNotification } = require('./emailService');

const findBookingForPayment = ({ bookingId, userId, guestEmail }) => prisma.booking.findFirst({
  where: userId ? { id: bookingId, userId } : { id: bookingId, email: guestEmail }
});

const getDepositAmount = (booking) => {
  const nightlyRate = Number(booking.pricePerNight);
  const rooms = Number(booking.rooms) || 1;
  if (nightlyRate > 0) return nightlyRate * rooms;
  return Number(booking.totalPrice) / (Number(booking.nights) || 1);
};

const createPaymentIntent = async ({ bookingId, userId, guestEmail }) => {
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

  const depositAmount = getDepositAmount(booking);
  const amountCents = Math.round(depositAmount * 100);
  let stripePaymentIntentId = null;
  let clientSecret = null;
  let status = 'requires_payment_method';

  if (!stripeClient) {
    const error = new Error('Stripe is not configured. Set STRIPE_SECRET_KEY before accepting payments.');
    error.status = 503;
    throw error;
  }

  const paymentIntent = await stripeClient.paymentIntents.create({
    amount: amountCents,
    currency: 'usd',
    metadata: {
      bookingId: booking.id,
      userId: userId || '',
      guestEmail: userId ? '' : booking.email
    }
  });
  stripePaymentIntentId = paymentIntent.id;
  clientSecret = paymentIntent.client_secret;
  status = paymentIntent.status;

  const payment = await prisma.payment.create({
    data: {
      bookingId: booking.id,
      stripePaymentIntentId,
      amount: depositAmount,
      currency: 'usd',
      status,
      clientSecret
    }
  });

  return {
    clientSecret: payment.clientSecret,
    paymentIntentId: payment.id,
    stripePaymentIntentId: payment.stripePaymentIntentId || null,
    amount: depositAmount,
    currency: 'USD'
  };
};

const confirmPayment = async ({ bookingId, paymentIntentId, paymentMethodId, userId, guestEmail }) => {
  if (!bookingId || !paymentIntentId) {
    const error = new Error('Booking ID and Payment Intent ID required');
    error.status = 400;
    throw error;
  }

  const booking = await findBookingForPayment({ bookingId, userId, guestEmail });
  if (!booking) {
    const error = new Error('Booking not found');
    error.status = 404;
    throw error;
  }

  const payment = await prisma.payment.findFirst({
    where: {
      OR: [{ id: paymentIntentId }, { stripePaymentIntentId: paymentIntentId }]
    }
  });

  if (!payment || payment.bookingId !== booking.id) {
    const error = new Error('Payment intent not found');
    error.status = 404;
    throw error;
  }

  if (payment.status === 'succeeded' && booking.status === 'CONFIRMED') {
    return {
      bookingId: booking.id,
      status: booking.status,
      confirmationNumber: `CONF-${booking.id.slice(0, 8).toUpperCase()}`,
      totalPrice: booking.totalPrice
    };
  }

  let updatedPaymentStatus = payment.status;

  if (payment.stripePaymentIntentId && payment.stripePaymentIntentId.startsWith('pi_')) {
    if (!stripeClient) {
      const error = new Error('Stripe client is not configured. Set STRIPE_SECRET_KEY to confirm payment intents.');
      error.status = 500;
      throw error;
    }

    const stripeIntent = await stripeClient.paymentIntents.retrieve(payment.stripePaymentIntentId);
    const expectedAmount = Math.round(getDepositAmount(booking) * 100);

    if (stripeIntent.amount !== expectedAmount || stripeIntent.currency !== 'usd') {
      const error = new Error('Stripe payment intent amount or currency does not match booking details');
      error.status = 400;
      throw error;
    }

    const metadataMatches = userId
      ? String(stripeIntent.metadata?.userId) === String(userId)
      : stripeIntent.metadata?.guestEmail === booking.email;

    if (stripeIntent.metadata?.bookingId !== booking.id || !metadataMatches) {
      const error = new Error('Stripe payment intent metadata does not match booking or user');
      error.status = 400;
      throw error;
    }

    if (stripeIntent.status !== 'succeeded') {
      if (!paymentMethodId) {
        const error = new Error('Payment method is required to confirm Stripe payment intent');
        error.status = 400;
        throw error;
      }

      const confirmed = await stripeClient.paymentIntents.confirm(payment.stripePaymentIntentId, {
        payment_method: paymentMethodId
      });
      updatedPaymentStatus = confirmed.status || updatedPaymentStatus;
    } else {
      updatedPaymentStatus = stripeIntent.status;
    }
  } else {
    const error = new Error('Stripe is not configured. Set STRIPE_SECRET_KEY before accepting payments.');
    error.status = 503;
    throw error;
  }

  await prisma.payment.update({ where: { id: payment.id }, data: { status: updatedPaymentStatus } });

  const bookingUpdates = {};
  if (updatedPaymentStatus === 'succeeded') {
    bookingUpdates.status = 'CONFIRMED';
    bookingUpdates.paymentId = payment.id;
    bookingUpdates.confirmedAt = new Date();
  }

  if (Object.keys(bookingUpdates).length > 0) {
    await prisma.booking.update({ where: { id: booking.id }, data: bookingUpdates });
  }

  let emailSent = false;
  if (updatedPaymentStatus === 'succeeded') {
    const email = await sendPaymentConfirmation(
      { ...booking, status: 'CONFIRMED', stripePaymentIntentId: payment.stripePaymentIntentId },
      getDepositAmount(booking)
    );
    await sendHotelNotification(booking, { event: 'Payment confirmed', status: 'CONFIRMED' });
    emailSent = email.sent;
  }

  return {
    bookingId: booking.id,
    status: updatedPaymentStatus === 'succeeded' ? 'CONFIRMED' : updatedPaymentStatus,
    confirmationNumber: updatedPaymentStatus === 'succeeded' ? `CONF-${booking.id.slice(0, 8).toUpperCase()}` : null,
    totalPrice: booking.totalPrice,
    depositAmount: getDepositAmount(booking),
    emailSent
  };
};

const handlePaymentWebhook = async (event) => {
  const paymentIntent = event.data?.object;
  const stripePaymentIntentId = paymentIntent?.id;

  if (!stripePaymentIntentId) {
    return { handled: false, reason: 'Payment intent ID missing' };
  }

  const payment = await prisma.payment.findFirst({
    where: { stripePaymentIntentId }
  });

  if (!payment) {
    return { handled: false, reason: 'Payment record not found' };
  }

  const booking = await prisma.booking.findUnique({ where: { id: payment.bookingId } });
  const wasAlreadySucceeded = payment.status === 'succeeded';

  if (event.type === 'payment_intent.succeeded') {
    await prisma.$transaction(async (transaction) => {
      await transaction.payment.update({
        where: { id: payment.id },
        data: { status: 'succeeded' }
      });
      await transaction.booking.update({
        where: { id: payment.bookingId },
        data: {
          status: 'CONFIRMED',
          paymentId: payment.id,
          confirmedAt: new Date()
        }
      });
    });

    if (booking && !wasAlreadySucceeded) {
      await sendPaymentConfirmation(
        { ...booking, status: 'CONFIRMED', stripePaymentIntentId },
        getDepositAmount(booking)
      );
      await sendHotelNotification(booking, { event: 'Payment confirmed', status: 'CONFIRMED' });
    }

    return { handled: true, status: 'succeeded', bookingId: payment.bookingId };
  }

  if (event.type === 'payment_intent.payment_failed') {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'failed' }
    });

    return { handled: true, status: 'failed', bookingId: payment.bookingId };
  }

  return { handled: false, reason: `Event type not handled: ${event.type}` };
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
  handlePaymentWebhook
};