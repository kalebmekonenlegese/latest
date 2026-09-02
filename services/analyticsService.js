const prisma = require('../utils/db');

const logEvent = async ({ eventType, eventData = null, userId = null }) => {
  if (!eventType) {
    const error = new Error('Event type required');
    error.status = 400;
    throw error;
  }

  const event = await prisma.analyticsEvent.create({
    data: {
      eventType,
      eventData,
      userId
    }
  });

  return { success: true, eventId: event.id };
};

module.exports = { logEvent };
