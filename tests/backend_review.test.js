jest.mock('../utils/db', () => ({
  booking: { findFirst: jest.fn() },
  review: { create: jest.fn(), findMany: jest.fn() }
}));

const prisma = require('../utils/db');
const { submitReview, getReviews } = require('../services/reviewService');

describe('reviewService (unit)', () => {
  beforeEach(() => jest.clearAllMocks());

  test('submitReview success', async () => {
    prisma.booking.findFirst.mockResolvedValueOnce({
      id: 'b1',
      userId: 'user-1',
      status: 'CONFIRMED',
      checkOut: new Date(Date.now() - 24 * 60 * 60 * 1000)
    });
    prisma.review.create.mockResolvedValueOnce({ id: 'r1', rating: 5, title: 'Great', comment: 'Nice', verified: true });

    const result = await submitReview({ userId: 'user-1', bookingId: 'b1', rating: 5, title: 'Great', comment: 'Nice' });
    expect(result).toBeDefined();
    expect(result.id).toBe('r1');
  });

  test('submitReview rejects pending bookings', async () => {
    prisma.booking.findFirst.mockResolvedValueOnce({
      id: 'b-pending',
      userId: 'user-1',
      status: 'PENDING_PAYMENT',
      checkOut: new Date(Date.now() - 24 * 60 * 60 * 1000)
    });

    await expect(submitReview({
      userId: 'user-1',
      bookingId: 'b-pending',
      rating: 5,
      title: 'Great',
      comment: 'Nice'
    })).rejects.toThrow('confirmed booking');
  });

  test('submitReview rejects a confirmed stay before checkout', async () => {
    prisma.booking.findFirst.mockResolvedValueOnce({
      id: 'b-current',
      userId: 'user-1',
      status: 'CONFIRMED',
      checkOut: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    await expect(submitReview({
      userId: 'user-1',
      bookingId: 'b-current',
      rating: 5,
      title: 'Great',
      comment: 'Nice'
    })).rejects.toThrow('completed stay');
  });

  test('submitReview invalid rating -> 400', async () => {
    await expect(submitReview({ userId: 'user-1', bookingId: 'b1', rating: 6, title: 'Great', comment: 'Nice' })).rejects.toThrow('Rating must be between 1 and 5');
  });

  test('submitReview missing required fields -> 400', async () => {
    await expect(submitReview({ userId: 'user-1', bookingId: 'b1', rating: 5 })).rejects.toThrow('Missing required fields');
  });

  test('submitReview accepts CUID-style booking IDs and checks ownership', async () => {
    prisma.booking.findFirst.mockResolvedValueOnce(null);
    await expect(submitReview({ userId: 'user-1', bookingId: 'cm123abc456def789', rating: 5, title: 'Great', comment: 'Nice' })).rejects.toThrow('Booking not found or not authorized');
  });

  test('submitReview booking not found -> 404', async () => {
    prisma.booking.findFirst.mockResolvedValueOnce(null);
    await expect(submitReview({ userId: 'user-1', bookingId: '00000000-0000-0000-0000-000000000000', rating: 5, title: 'Great', comment: 'Nice' })).rejects.toThrow('Booking not found or not authorized');
  });

  test('getReviews returns results', async () => {
    prisma.review.findMany.mockResolvedValueOnce([{ id: 'r1' }, { id: 'r2' }]);
    const reviews = await getReviews(5);
    expect(reviews).toHaveLength(2);
    expect(prisma.review.findMany).toHaveBeenCalledWith({ take: 5, orderBy: { createdAt: 'desc' } });
  });
});
