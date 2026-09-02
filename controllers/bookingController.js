const { createBooking, getBooking, getBookings, cancelBooking } = require('../services/bookingService');
const auditEvent = require('../middlewares/audit');
const prisma = require('../utils/db');
const { sendBookingConfirmation } = require('../services/emailService');

const create = async (req, res) => {
  try {
    // start with request body and ensure userId is set
    const payload = { ...req.body, userId: req.user && req.user.id };

    const booking = await createBooking(payload);
    const email = await sendBookingConfirmation(booking);
    auditEvent(req, 'booking_create', 'success', { bookingId: booking.id, roomType: booking.roomType });
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: {
        id: booking.id,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        nights: booking.nights,
        roomType: booking.roomType,
        guests: booking.guests,
        totalPrice: booking.totalPrice,
        status: booking.status,
        emailSent: email.sent
      },
      requestId: req.id
    });
  } catch (error) {
    auditEvent(req, 'booking_create', 'failed', { error: error.message });
    res.status(error.status || 500).json({ error: error.message, requestId: req.id });
  }
};

const getOne = async (req, res) => {
  try {
    const booking = await getBooking({ bookingId: req.params.bookingId, userId: req.user.id });
    res.json({ success: true, booking, requestId: req.id });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message, requestId: req.id });
  }
};

const list = async (req, res) => {
  try {
    const bookings = await getBookings(req.user.id);
    const normalizedBookings = Array.isArray(bookings) ? bookings : [];
    res.json({ success: true, bookings: normalizedBookings, total: normalizedBookings.length, requestId: req.id });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message, requestId: req.id });
  }
};

const cancel = async (req, res) => {
  try {
    const result = await cancelBooking({ bookingId: req.params.bookingId, userId: req.user.id });
    auditEvent(req, 'booking_cancel', 'success', { bookingId: result.bookingId, refundIssued: result.refundIssued });
    res.json({ success: true, message: result.refundIssued ? 'Booking cancelled and deposit refunded' : 'Booking cancelled', booking: result, requestId: req.id });
  } catch (error) {
    auditEvent(req, 'booking_cancel', 'failed', { error: error.message });
    res.status(error.status || 500).json({ error: error.message, requestId: req.id });
  }
};

module.exports = {
  create,
  getOne,
  list,
  cancel
};
