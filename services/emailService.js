const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const emailFrom = process.env.EMAIL_FROM || smtpUser;
const hotelEmail = process.env.HOTEL_NOTIFICATION_EMAIL || process.env.HOTEL_EMAIL || smtpUser;

const isConfigured = Boolean(smtpHost && emailFrom && hotelEmail);
const transporter = isConfigured
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: process.env.SMTP_SECURE === 'true',
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
      auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined
    })
  : null;

const formatDate = (value) => {
  if (!value) return 'Not provided';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not provided' : date.toISOString().slice(0, 10);
};

const sendEmail = async ({ to, subject, text, html }) => {
  if (!transporter) {
    logger.warn('Email delivery skipped: SMTP is not configured');
    return { sent: false, reason: 'not_configured' };
  }

  try {
    const result = await transporter.sendMail({ from: emailFrom, to, subject, text, html });
    return { sent: true, messageId: result.messageId };
  } catch (error) {
    logger.error('Email delivery failed: %o', error);
    return { sent: false, reason: 'delivery_failed' };
  }
};

const sendBookingConfirmation = async (booking) => {
  if (!transporter) {
    logger.warn('Booking confirmation email skipped: SMTP is not configured');
    return { sent: false, reason: 'not_configured' };
  }

  const subject = `Reservation request ${booking.id}`;
  const text = [
    `Thank you, ${booking.firstName}.`,
    `Your reservation request ${booking.id} has been received.`,
    `Dates: ${formatDate(booking.checkIn)} to ${formatDate(booking.checkOut)}`,
    `Room: ${booking.roomType}`,
    `Total estimate: $${booking.totalPrice}`,
    'Status: Pending payment. Your stay is not confirmed until payment is completed.'
  ].join('\n');

  const customer = await sendEmail({ to: booking.email, subject, text });
  return { sent: customer.sent, customerSent: customer.sent };
};

const sendHotelNotification = async (booking, { status = booking.status, event = 'new reservation' } = {}) => {
  return sendEmail({
    to: hotelEmail,
    subject: `${event}: ${booking.id}`,
    text: [
      `Booking ID: ${booking.id}`,
      `Guest: ${booking.firstName} ${booking.lastName}`,
      `Email: ${booking.email}`,
      `Phone: ${booking.phone}`,
      `Dates: ${formatDate(booking.checkIn)} to ${formatDate(booking.checkOut)}`,
      `Room: ${booking.roomType}`,
      `Guests: ${booking.guests}`,
      `Total price: $${booking.totalPrice}`,
      `Status: ${status}`
    ].join('\n')
  });
};

const sendContactNotification = async (submission) => sendEmail({
  to: hotelEmail,
  subject: `New contact message: ${submission.subject}`,
  text: [
    `From: ${submission.firstName} ${submission.lastName}`,
    `Email: ${submission.email}`,
    `Phone: ${submission.phone}`,
    `Subject: ${submission.subject}`,
    '',
    submission.message
  ].join('\n')
});

const sendPaymentConfirmation = async (booking, depositAmount) => {
  if (!transporter) {
    logger.warn('Payment confirmation email skipped: SMTP is not configured');
    return { sent: false, reason: 'not_configured' };
  }

  return sendEmail({
    to: booking.email,
    subject: `Payment confirmed for reservation ${booking.id}`,
    text: [
      `Thank you, ${booking.firstName}.`,
      `Payment has been confirmed for reservation ${booking.id}.`,
      `Transaction/reference ID: ${booking.stripePaymentIntentId || 'available in your payment receipt'}`,
      `Dates: ${formatDate(booking.checkIn)} to ${formatDate(booking.checkOut)}`,
      `Booking status: ${booking.status}`,
      `Deposit paid: $${depositAmount}`,
      `Remaining balance due at check-in: $${Number(booking.totalPrice) - Number(depositAmount)}`
    ].join('\n')
  });
};

const sendCancellationEmail = async (booking, { refundIssued = false, refundAmount = 0 } = {}) => {
  const text = [
    `Reservation ${booking.id} has been cancelled.`,
    `Guest: ${booking.firstName} ${booking.lastName}`,
    `Dates: ${formatDate(booking.checkIn)} to ${formatDate(booking.checkOut)}`,
    `Room: ${booking.roomType}`,
    `Cancellation status: ${booking.status}`,
    refundIssued ? `Refund issued: $${refundAmount}` : 'Refund issued: No'
  ].join('\n');

  const customer = await sendEmail({
    to: booking.email,
    subject: `Reservation cancelled: ${booking.id}`,
    text
  });
  const hotel = await sendEmail({
    to: hotelEmail,
    subject: `Reservation cancellation: ${booking.id}`,
    text
  });
  return { sent: customer.sent && hotel.sent, customerSent: customer.sent, hotelSent: hotel.sent };
};

module.exports = {
  sendBookingConfirmation,
  sendHotelNotification,
  sendContactNotification,
  sendPaymentConfirmation,
  sendCancellationEmail,
  sendEmail
};
