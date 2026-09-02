jest.mock('../utils/db', () => ({
  analyticsEvent: { create: jest.fn() }
}));

const prisma = require('../utils/db');
const { logEvent } = require('../services/analyticsService');

describe('analyticsService (unit)', () => {
  beforeEach(() => jest.clearAllMocks());

  test('logEvent persists the event', async () => {
    prisma.analyticsEvent.create.mockResolvedValue({ id: 'event-1' });
    const result = await logEvent({ eventType: 'page_view', eventData: { page: 'home' }, userId: 'user-1' });
    expect(result).toEqual({ success: true, eventId: 'event-1' });
    expect(prisma.analyticsEvent.create).toHaveBeenCalledWith({
      data: { eventType: 'page_view', eventData: { page: 'home' }, userId: 'user-1' }
    });
  });

  test('logEvent missing eventType -> 400', async () => {
    await expect(logEvent({ eventData: { page: 'home' } })).rejects.toThrow('Event type required');
    try {
      await logEvent({ eventData: { page: 'home' } });
    } catch (error) {
      expect(error.status).toBe(400);
    }
  });
});
