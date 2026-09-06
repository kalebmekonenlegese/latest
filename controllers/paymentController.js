const { stripeClient } = require('../config');
const { createPaymentIntent, confirmPayment, handlePaymentWebhook } = require('../services/paymentService');
const auditEvent = require('../middlewares/audit');
const logger = require('../utils/logger');

const createIntent = async (req, res) => {
  try {
    const result = await createPaymentIntent({ ...req.body, userId: req.user?.id });
    auditEvent(req, 'payment_intent_create', 'success', { bookingId: req.body.bookingId });
    res.json({ success: true, ...result, requestId: req.id });
  } catch (error) {
    logger.error('Payment intent creation failed: %o requestId=%s method=%s path=%s', error, req.id, req.method, req.path);
    auditEvent(req, 'payment_intent_create', 'failed', { error: error.message });
    res.status(error.status || 500).json({ error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error', ...(process.env.NODE_ENV === 'development' && { stack: error.stack }), requestId: req.id });
  }
};

const confirm = async (req, res) => {
  try {
    const result = await confirmPayment({ ...req.body, userId: req.user?.id });
    auditEvent(req, 'payment_confirm', 'success', { bookingId: req.body.bookingId });
    res.json({ success: true, message: 'Payment confirmed and booking confirmed', booking: result, requestId: req.id });
  } catch (error) {
    logger.error('Payment confirmation failed: %o requestId=%s method=%s path=%s', error, req.id, req.method, req.path);
    auditEvent(req, 'payment_confirm', 'failed', { error: error.message });
    res.status(error.status || 500).json({ error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error', ...(process.env.NODE_ENV === 'development' && { stack: error.stack }), requestId: req.id });
  }
};

const webhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeClient || !webhookSecret) {
    return res.status(503).json({ error: 'Stripe webhook is not configured', requestId: req.id });
  }

  let event;
  try {
    event = stripeClient.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (error) {
    logger.warn('Stripe webhook signature verification failed: %s requestId=%s', error.message, req.id);
    return res.status(400).json({ error: 'Invalid Stripe webhook signature', requestId: req.id });
  }

  try {
    const result = await handlePaymentWebhook(event);
    auditEvent(req, 'payment_webhook', result.handled ? 'success' : 'ignored', {
      eventType: event.type,
      bookingId: result.bookingId || null
    });
    return res.json({ received: true, ...result, requestId: req.id });
  } catch (error) {
    logger.error('Stripe webhook handling failed: %o requestId=%s', error, req.id);
    auditEvent(req, 'payment_webhook', 'failed', { eventType: event.type, error: error.message });
    return res.status(500).json({ error: 'Webhook processing failed', requestId: req.id });
  }
};

module.exports = { createIntent, confirm, webhook };