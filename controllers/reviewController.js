const { submitReview, getReviews } = require('../services/reviewService');
const auditEvent = require('../middlewares/audit');

const create = async (req, res) => {
  try {
    const review = await submitReview({ ...req.body, userId: req.user.id });
    auditEvent(req, 'review_submission', 'success', { reviewId: review.id, bookingId: review.bookingId });
    res.status(201).json({ success: true, message: 'Review submitted successfully', review: { id: review.id, rating: review.rating, title: review.title, createdAt: review.createdAt }, requestId: req.id });
  } catch (error) {
    auditEvent(req, 'review_submission', 'failed', { error: error.message });
    res.status(error.status || 500).json({ error: error.message, requestId: req.id });
  }
};

const list = async (req, res) => {
  try {
    const rawLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(rawLimit, 100)) : 10;
    const reviews = await getReviews(limit);
    res.json({ success: true, reviews: reviews.map((r) => ({ id: r.id, rating: r.rating, title: r.title, comment: r.comment, createdAt: r.createdAt, verified: r.verified })), total: reviews.length, requestId: req.id });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message, requestId: req.id });
  }
};

module.exports = { create, list };