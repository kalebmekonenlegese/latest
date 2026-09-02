jest.mock('../utils/db', () => ({
  booking: { findFirst: jest.fn(), update: jest.fn() },
  payment: { create: jest.fn(), findFirst: jest.fn(), update: jest.fn() }
}));

jest.mock('../config', () => ({
  environment: 'development',
  stripeClient: {
    paymentIntents: {
      create: jest.fn(),
      retrieve: jest.fn(),
      confirm: jest.fn()
    }
  }
}));

const prisma = require('../utils/db');
const { createPaymentIntent, confirmPayment } = require('../services/paymentService');

describe('paymentService (unit)', () => {
  beforeEach(() => jest.clearAllMocks());

  test('createPaymentIntent success with stripe', async () => {
    prisma.booking.findFirst.mockResolvedValueOnce({
      id: 'b1',
      totalPrice: 500,
      nights: 5,
      rooms: 1,
      pricePerNight: 100
    });
    const stripe = require('../config').stripeClient;
    stripe.paymentIntents.create.mockResolvedValueOnce({ id: 'pi_1', client_secret: 'secret', status: 'requires_payment_method' });
    prisma.payment.create.mockResolvedValueOnce({ id: 'p1', clientSecret: 'secret', stripePaymentIntentId: 'pi_1' });

    const res = await createPaymentIntent({ bookingId: 'b1', userId: 'u1' });
    expect(res.clientSecret).toBeDefined();
    expect(res.stripePaymentIntentId).toBe('pi_1');
    expect(res.amount).toBe(100);
    expect(stripe.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 10000 })
    );
  });

  test('confirmPayment - booking not found', async () => {
    prisma.booking.findFirst.mockResolvedValueOnce(null);
    await expect(confirmPayment({ bookingId: 'no', paymentIntentId: 'x', userId: 'u1' })).rejects.toThrow('Booking not found');
  });

  test('confirmPayment - booking belongs to another user', async () => {
    prisma.booking.findFirst.mockResolvedValueOnce(null);
    await expect(confirmPayment({ bookingId: 'b1', paymentIntentId: 'pi_1', userId: 'u1' })).rejects.toThrow('Booking not found');
  });

  test('confirmPayment - payment intent not found for booking', async () => {
    prisma.booking.findFirst.mockResolvedValueOnce({ id: 'b1', userId: 'u1', status: 'PENDING_PAYMENT', stripePaymentIntentId: 'pi_2' });
    prisma.payment.findFirst.mockResolvedValueOnce(null);
    await expect(confirmPayment({ bookingId: 'b1', paymentIntentId: 'pi_1', userId: 'u1' })).rejects.toThrow('Payment intent not found');
  });

  test('confirmPayment - stripe confirm success updates booking', async () => {
    prisma.booking.findFirst.mockResolvedValueOnce({ id: 'b1', userId: 'u1', status: 'PENDING_PAYMENT', totalPrice: 100, stripePaymentIntentId: 'pi_1' });
    const stripe = require('../config').stripeClient;
    stripe.paymentIntents.retrieve.mockResolvedValueOnce({ status: 'requires_confirmation', amount: 10000, currency: 'usd', metadata: { bookingId: 'b1', userId: 'u1' } });
    stripe.paymentIntents.confirm.mockResolvedValueOnce({ status: 'succeeded' });
    prisma.payment.findFirst.mockResolvedValueOnce({ id: 'p1', bookingId: 'b1', stripePaymentIntentId: 'pi_1' });
    prisma.payment.update.mockResolvedValueOnce({ id: 'p1', status: 'COMPLETED' });
    prisma.booking.update.mockResolvedValueOnce({ id: 'b1', status: 'CONFIRMED' });

    const result = await confirmPayment({ bookingId: 'b1', paymentIntentId: 'pi_1', userId: 'u1', paymentMethodId: 'pm_123' });
    expect(result.status).toBe('CONFIRMED');
    expect(prisma.payment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'p1' },
        data: { status: 'succeeded' }
      })
    );
  });

  test('confirmPayment - rejects payments without Stripe configuration', async () => {
    prisma.booking.findFirst.mockResolvedValueOnce({
      id: 'b-dev',
      userId: 'u1',
      status: 'PENDING_PAYMENT',
      totalPrice: 100
    });
    prisma.payment.findFirst.mockResolvedValueOnce({
      id: 'p-dev',
      bookingId: 'b-dev',
      stripePaymentIntentId: 'dev_pi_1',
      status: 'requires_payment_method'
    });
    await expect(confirmPayment({
      bookingId: 'b-dev',
      paymentIntentId: 'p-dev',
      userId: 'u1',
      paymentMethodId: 'pm_test'
    })).rejects.toThrow('Stripe is not configured');
    expect(require('../config').stripeClient.paymentIntents.retrieve).not.toHaveBeenCalled();
  });

  test('confirmPayment - stripe metadata mismatch returns 400', async () => {
    prisma.booking.findFirst.mockResolvedValueOnce({ id: 'b1', userId: 'u1', status: 'PENDING_PAYMENT', totalPrice: 100, stripePaymentIntentId: 'pi_1' });
    const stripe = require('../config').stripeClient;
    stripe.paymentIntents.retrieve.mockResolvedValueOnce({ status: 'requires_confirmation', amount: 10000, currency: 'usd', metadata: { bookingId: 'b1', userId: 'wrong-user' } });
    prisma.payment.findFirst.mockResolvedValueOnce({ id: 'p1', bookingId: 'b1', stripePaymentIntentId: 'pi_1' });

    await expect(confirmPayment({ bookingId: 'b1', paymentIntentId: 'pi_1', userId: 'u1', paymentMethodId: 'pm_123' }))
      .rejects.toThrow('Stripe payment intent metadata does not match booking or user');
  });

  test('confirmPayment - already confirmed booking returns confirmed status', async () => {
    prisma.booking.findFirst.mockResolvedValueOnce({ id: 'b1', userId: 'u1', status: 'CONFIRMED', totalPrice: 100, stripePaymentIntentId: 'pi_1' });
    prisma.payment.findFirst.mockResolvedValueOnce({ id: 'p1', bookingId: 'b1', stripePaymentIntentId: 'pi_1', status: 'succeeded' });

    const result = await confirmPayment({ bookingId: 'b1', paymentIntentId: 'p1', userId: 'u1' });
    expect(result.status).toBe('CONFIRMED');
    expect(result.confirmationNumber).toContain('CONF-');
  });

  test('createPaymentIntent - missing bookingId', async () => {
    await expect(createPaymentIntent({ userId: 'u1' })).rejects.toThrow('Booking ID required');
  });

  test('createPaymentIntent - unauthorized booking access', async () => {
    prisma.booking.findFirst.mockResolvedValueOnce(null);
    await expect(createPaymentIntent({ bookingId: 'b1', userId: 'u1' })).rejects.toThrow('Booking not found');
  });
});