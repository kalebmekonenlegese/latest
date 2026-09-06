const { subscribeNewsletter, unsubscribeNewsletter } = require('../services/newsletterService');
const logger = require('../utils/logger');

const subscribe = async (req, res) => {
  try {
    const subscription = await subscribeNewsletter(req.body.email);
    res.status(201).json({ success: true, message: 'Successfully subscribed to newsletter', subscriptionId: subscription.id, requestId: req.id });
  } catch (error) {
    logger.error('Newsletter subscription failed: %o requestId=%s method=%s path=%s', error, req.id, req.method, req.path);
    res.status(error.status || 500).json({ error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error', ...(process.env.NODE_ENV === 'development' && { stack: error.stack }), requestId: req.id });
  }
};

const unsubscribe = async (req, res) => {
  try {
    await unsubscribeNewsletter(req.body.email);
    res.json({ success: true, message: 'Successfully unsubscribed from newsletter', requestId: req.id });
  } catch (error) {
    logger.error('Newsletter unsubscribe failed: %o requestId=%s method=%s path=%s', error, req.id, req.method, req.path);
    res.status(error.status || 500).json({ error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error', ...(process.env.NODE_ENV === 'development' && { stack: error.stack }), requestId: req.id });
  }
};

module.exports = { subscribe, unsubscribe };