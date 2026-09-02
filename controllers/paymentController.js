const { createPaymentIntent, confirmPayment } = require('../services/paymentService');
const auditEvent = require('../middlewares/audit');

const createIntent = async (req, res) => {
  try {
    const result = await createPaymentIntent({ ...req.body, userId: req.user?.id });
    auditEvent(req, 'payment_intent_create', 'success', { bookingId: req.body.bookingId });
    res.json({ success: true, ...result, requestId: req.id });
  } catch (error) {
    auditEvent(req, 'payment_intent_create', 'failed', { error: error.message });
    res.status(error.status || 500).json({ error: error.message, requestId: req.id });
  }
};

const confirm = async (req, res) => {
  try {
    const result = await confirmPayment({ ...req.body, userId: req.user?.id });
    auditEvent(req, 'payment_confirm', 'success', { bookingId: req.body.bookingId });
    res.json({ success: true, message: 'Payment confirmed and booking confirmed', booking: result, requestId: req.id });
  } catch (error) {
    auditEvent(req, 'payment_confirm', 'failed', { error: error.message });
    res.status(error.status || 500).json({ error: error.message, requestId: req.id });
  }
};

module.exports = { createIntent, confirm };