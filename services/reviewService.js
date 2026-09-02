const prisma = require('../utils/db');
const { isUuidLike } = require('../utils/validation');

const submitReview = async ({ userId, bookingId, rating, title, comment }) => {
  if (!bookingId || !rating || !title || !comment) {
    const error = new Error('Missing required fields: bookingId, rating, title, comment');
    error.status = 400;
    throw error;
  }

  if (rating < 1 || rating > 5) {
    const error = new Error('Rating must be between 1 and 5');
    error.status = 400;
    throw error;
  }

  if (!isUuidLike(bookingId)) {
    const error = new Error('Invalid booking ID');
    error.status = 400;
    throw error;
  }

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId }
  });

  if (!booking) {
    const error = new Error('Booking not found or not authorized');
    error.status = 404;
    throw error;
  }

  if (booking.status !== 'CONFIRMED') {
    const error = new Error('Reviews require a confirmed booking');
    error.status = 400;
    throw error;
  }

  if (!booking.checkOut || new Date(booking.checkOut) > new Date()) {
    const error = new Error('Reviews can be submitted after the completed stay');
    error.status = 400;
    throw error;
  }

  return prisma.review.create({
    data: {
      userId,
      bookingId,
      rating: parseInt(rating, 10),
      title,
      comment,
      verified: true
    }
  });
};

const getReviews = async (limit = 10) => {
  const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.min(Number(limit), 100)) : 10;
  return prisma.review.findMany({
    take: safeLimit,
    orderBy: { createdAt: 'desc' }
  });
};

module.exports = { submitReview, getReviews };