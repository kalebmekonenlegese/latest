const prisma = require('../utils/db');
const { validateEmail } = require('../utils/validation');

const subscribeNewsletter = async (email) => {
  if (!validateEmail(email)) {
    const error = new Error('Valid email required');
    error.status = 400;
    throw error;
  }

  const existing = await prisma.newsletterSubscription.findUnique({ where: { email } });
  if (existing) {
    if (existing.status === 'unsubscribed') {
      return prisma.newsletterSubscription.update({
        where: { email },
        data: { status: 'active', unsubscribedAt: null }
      });
    }

    const error = new Error('Email already subscribed');
    error.status = 409;
    throw error;
  }

  return prisma.newsletterSubscription.create({
    data: { email, status: 'active' }
  });
};

const unsubscribeNewsletter = async (email) => {
  if (!validateEmail(email)) {
    const error = new Error('Valid email required');
    error.status = 400;
    throw error;
  }

  const subscription = await prisma.newsletterSubscription.findUnique({ where: { email } });
  if (!subscription) {
    const error = new Error('Subscription not found');
    error.status = 404;
    throw error;
  }

  return prisma.newsletterSubscription.update({
    where: { email },
    data: { status: 'unsubscribed', unsubscribedAt: new Date() }
  });
};

module.exports = {
  subscribeNewsletter,
  unsubscribeNewsletter
};