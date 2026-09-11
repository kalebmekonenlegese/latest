const { initializeChapaPayment, verifyChapaPayment, handleChapaCallback } = require('../services/chapaService');
const auditEvent = require('../middlewares/audit');
const logger = require('../utils/logger');

const initializePayment = async (req, res) => {
  try {
    const result = await initializeChapaPayment({ ...req.body, userId: req.user?.id, guestEmail: req.body.guestEmail || req.body.email });
    auditEvent(req, 'chapa_payment_initialize', 'success', { bookingId: req.body.bookingId });
    res.json({ success: true, ...result, requestId: req.id });
  } catch (error) {
    logger.error('Chapa payment initialization failed: %o requestId=%s method=%s path=%s', error, req.id, req.method, req.path);
    auditEvent(req, 'chapa_payment_initialize', 'failed', { error: error.message });
    res.status(error.status || 500).json({ error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error', ...(process.env.NODE_ENV === 'development' && { stack: error.stack }), requestId: req.id });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const result = await verifyChapaPayment({ ...req.body, userId: req.user?.id });
    auditEvent(req, 'chapa_payment_verify', 'success', { txRef: req.body.tx_ref });
    res.json({ success: true, ...result, requestId: req.id });
  } catch (error) {
    logger.error('Chapa payment verification failed: %o requestId=%s method=%s path=%s', error, req.id, req.method, req.path);
    auditEvent(req, 'chapa_payment_verify', 'failed', { error: error.message });
    res.status(error.status || 500).json({ error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error', ...(process.env.NODE_ENV === 'development' && { stack: error.stack }), requestId: req.id });
  }
};

const callback = async (req, res) => {
  return handleChapaCallback(req, res);
};

const createIntent = initializePayment;
const confirm = verifyPayment;
const webhook = callback;

module.exports = { initializeChapaPayment: initializePayment, verifyChapaPayment: verifyPayment, handleChapaCallback: callback, createIntent, confirm, webhook };