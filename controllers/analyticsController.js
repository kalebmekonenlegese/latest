const { logEvent } = require('../services/analyticsService');
const logger = require('../utils/logger');

const event = async (req, res) => {
  try {
    await logEvent(req.body);
    res.status(202).json({ success: true, message: 'Event recorded', requestId: req.id });
  } catch (error) {
    logger.error('Analytics event failed: %o requestId=%s method=%s path=%s', error, req.id, req.method, req.path);
    res.status(error.status || 500).json({ error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error', ...(process.env.NODE_ENV === 'development' && { stack: error.stack }), requestId: req.id });
  }
};

module.exports = { event };