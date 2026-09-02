jest.mock('../utils/db', () => ({
  newsletterSubscription: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() }
}));

const prisma = require('../utils/db');
const { subscribeNewsletter, unsubscribeNewsletter } = require('../services/newsletterService');

describe('newsletterService (unit)', () => {
  beforeEach(() => jest.clearAllMocks());

  test('subscribeNewsletter success', async () => {
    prisma.newsletterSubscription.findUnique.mockResolvedValueOnce(null);
    prisma.newsletterSubscription.create.mockResolvedValueOnce({ id: 'n1', email: 'a@b.com', status: 'active' });

    const result = await subscribeNewsletter('a@b.com');
    expect(result).toBeDefined();
    expect(prisma.newsletterSubscription.create).toHaveBeenCalled();
  });

  test('subscribeNewsletter invalid email -> 400', async () => {
    await expect(subscribeNewsletter('invalid-email')).rejects.toThrow('Valid email required');
  });

  test('subscribeNewsletter duplicate email -> 409', async () => {
    prisma.newsletterSubscription.findUnique.mockResolvedValueOnce({ id: 'n1', email: 'a@b.com', status: 'active' });
    await expect(subscribeNewsletter('a@b.com')).rejects.toThrow('Email already subscribed');
  });

  test('subscribeNewsletter reactivates an unsubscribed email', async () => {
    prisma.newsletterSubscription.findUnique.mockResolvedValueOnce({
      id: 'n1',
      email: 'a@b.com',
      status: 'unsubscribed',
      unsubscribedAt: new Date()
    });
    prisma.newsletterSubscription.update.mockResolvedValueOnce({ id: 'n1', email: 'a@b.com', status: 'active', unsubscribedAt: null });

    const result = await subscribeNewsletter('a@b.com');

    expect(result.status).toBe('active');
    expect(prisma.newsletterSubscription.update).toHaveBeenCalledWith({
      where: { email: 'a@b.com' },
      data: { status: 'active', unsubscribedAt: null }
    });
  });

  test('unsubscribeNewsletter success', async () => {
    prisma.newsletterSubscription.findUnique.mockResolvedValueOnce({ id: 'n1', email: 'a@b.com', status: 'active' });
    prisma.newsletterSubscription.update.mockResolvedValueOnce({ id: 'n1', email: 'a@b.com', status: 'unsubscribed' });

    const result = await unsubscribeNewsletter('a@b.com');
    expect(result).toBeDefined();
    expect(prisma.newsletterSubscription.update).toHaveBeenCalled();
  });

  test('unsubscribeNewsletter invalid email -> 400', async () => {
    await expect(unsubscribeNewsletter('invalid-email')).rejects.toThrow('Valid email required');
  });

  test('unsubscribeNewsletter not found -> 404', async () => {
    prisma.newsletterSubscription.findUnique.mockResolvedValueOnce(null);
    await expect(unsubscribeNewsletter('missing@b.com')).rejects.toThrow('Subscription not found');
  });
});
