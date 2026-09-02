const express = require('express');
const authRoutes = require('./authRoutes');
const bookingRoutes = require('./bookingRoutes');
const contactRoutes = require('./contactRoutes');
const paymentRoutes = require('./paymentRoutes');
const availabilityRoutes = require('./availabilityRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const reviewRoutes = require('./reviewRoutes');
const newsletterRoutes = require('./newsletterRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/bookings', bookingRoutes);
router.use('/contact', contactRoutes);
router.use('/payments', paymentRoutes);
router.use('/availability', availabilityRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/reviews', reviewRoutes);
router.use('/newsletter', newsletterRoutes);

module.exports = router;
