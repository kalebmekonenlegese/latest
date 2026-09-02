const { getAvailability, getRoomPricing } = require('../services/availabilityService');

const availability = async (req, res) => {
  try {
    const availabilityResult = await getAvailability(req.query);
    res.json({ success: true, availability: availabilityResult, requestId: req.id });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message, requestId: req.id });
  }
};

module.exports = { availability };

const rooms = async (req, res) => {
  try {
    const roomData = await getRoomPricing();
    res.json({ success: true, rooms: roomData, requestId: req.id });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message, requestId: req.id });
  }
};

module.exports.rooms = rooms;