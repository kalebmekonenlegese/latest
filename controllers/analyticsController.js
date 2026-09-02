const { logEvent } = require('../services/analyticsService');

const event = async (req, res) => {
  try {
    await logEvent(req.body);
    res.status(202).json({ success: true, message: 'Event recorded', requestId: req.id });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(error.status || 500).json({ error: error.message, requestId: req.id });
  }
};

module.exports = { event };