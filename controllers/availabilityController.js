const { getAvailability, getRoomPricing } = require('../services/availabilityService');
const logger = require('../utils/logger');

const availability = async (req, res) => {
  try {
    const availabilityResult = await getAvailability(req.query);
    res.json({ success: true, availability: availabilityResult, requestId: req.id });
  } catch (error) {
    logger.error('Availability API error: %o requestId=%s method=%s path=%s', error, req.id, req.method, req.path);

    res.status(error.status || 500).json({
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
};

module.exports = { availability };

const rooms = async (req, res) => {
  try {
    const roomData = await getRoomPricing();
    res.json({ success: true, rooms: roomData, requestId: req.id });
  } catch (error) {
    logger.error('Room pricing API error: %o requestId=%s method=%s path=%s', error, req.id, req.method, req.path);

    res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
};

module.exports.rooms = rooms;