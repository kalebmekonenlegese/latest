const { getAvailability, getRoomPricing } = require('../services/availabilityService');

const availability = async (req, res) => {
  try {
    const availabilityResult = await getAvailability(req.query);
    res.json({ success: true, availability: availabilityResult, requestId: req.id });
  } catch (error) {
    console.error("Availability API Error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
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
    console.error("Availability API Error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
};

module.exports.rooms = rooms;