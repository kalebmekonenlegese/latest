const { subscribeNewsletter, unsubscribeNewsletter } = require('../services/newsletterService');

const subscribe = async (req, res) => {
  try {
    const subscription = await subscribeNewsletter(req.body.email);
    res.status(201).json({ success: true, message: 'Successfully subscribed to newsletter', subscriptionId: subscription.id, requestId: req.id });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message, requestId: req.id });
  }
};

const unsubscribe = async (req, res) => {
  try {
    await unsubscribeNewsletter(req.body.email);
    res.json({ success: true, message: 'Successfully unsubscribed from newsletter', requestId: req.id });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message, requestId: req.id });
  }
};

module.exports = { subscribe, unsubscribe };