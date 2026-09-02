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
      auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined
    })
  : null;

const formatDate = (value) => new Date(value).toISOString().slice(0, 10);

const sendEmail = async ({ to, subject, text, html }) => {
  if (!transporter) {
    logger.warn('Email delivery skipped: SMTP is not configured');
    return { sent: false, reason: 'not_configured' };
  }

  try {
    const result = await transporter.sendMail({ from: emailFrom, to, subject, text, html });
    return { sent: true, messageId: result.messageId };
  } catch (error) {
    logger.error('Email delivery failed: %s', error.message);
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
  const hotel = await sendEmail({
    to: hotelEmail,
    subject: `New reservation request ${booking.id}`,
    text: `${text}\nGuest email: ${booking.email}\nGuest phone: ${booking.phone}`
  });
  return { sent: customer.sent && hotel.sent };
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
      `Dates: ${formatDate(booking.checkIn)} to ${formatDate(booking.checkOut)}`,
      `Deposit paid: $${depositAmount}`,
      `Remaining balance due at check-in: $${Number(booking.totalPrice) - Number(depositAmount)}`
    ].join('\n')
  });
};

module.exports = {
  sendBookingConfirmation,
  sendContactNotification,
  sendPaymentConfirmation,
  sendEmail
};
