const { Prisma } = require('@prisma/client');
const prisma = require('../utils/db');
const { stripeClient, environment } = require('../config');
const logger = require('../utils/logger');
const {
  validateBookingDates,
  validateEmail,
  validatePhoneNumber,
  validateEnum
} = require('../utils/validation');

const allowedRoomTypes = ['standard-room', 'deluxe-room', 'executive-suite', 'family-room'];

const calculateNights = (checkIn, checkOut) => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  return Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
};

const createBooking = async ({ userId, checkIn, checkOut, roomType, rooms = 1, guests, specialRequests, firstName, lastName, email, phone }) => {
  if (userId && (!firstName || !lastName || !email)) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        firstName = firstName || user.firstName;
        lastName = lastName || user.lastName;
        email = email || user.email;
      }
    } catch (error) {
      logger.error('Booking user lookup failed: %o userId=%s', error, userId);
      // If the user lookup fails, continue with validation and let the service report missing contact fields.
    }
  }

  if (!checkIn || !checkOut || !roomType || !guests) {
    const error = new Error('Missing required fields: checkIn, checkOut, roomType, guests');
    error.status = 400;
    throw error;
  }

  if (!firstName || !lastName || !email || !phone) {
    const error = new Error('Missing required guest contact fields');
    error.status = 400;
    throw error;
  }

  const requestedRooms = Number(rooms);
  if (!Number.isInteger(requestedRooms) || requestedRooms < 1) {
    const error = new Error('Rooms must be a positive integer');
    error.status = 400;
    throw error;
  }

  if (!validateEnum(roomType, allowedRoomTypes)) {
    const error = new Error('Invalid room type');
    error.status = 400;
    throw error;
  }

  if (!validateBookingDates(checkIn, checkOut)) {
    const error = new Error('Check-out date must be after check-in date');
    error.status = 400;
    throw error;
  }

  if (!validateEmail(email)) {
    const error = new Error('Invalid email format');
    error.status = 400;
    throw error;
  }

  if (!validatePhoneNumber(phone)) {
    const error = new Error('Invalid phone number format');
    error.status = 400;
    throw error;
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = calculateNights(checkInDate, checkOutDate);
  return prisma.$transaction(async (transaction) => {
    const inventory = await transaction.roomInventory.findUnique({ where: { roomType } });
    if (!inventory) {
      const error = new Error('Invalid room type');
      error.status = 400;
      throw error;
    }

    const pricePerNight = inventory.pricePerNight;
    const totalPrice = pricePerNight * nights;

    const overlappingBookings = await transaction.booking.findMany({
      where: {
        roomType,
        status: { in: ['PENDING_PAYMENT', 'CONFIRMED'] },
        checkIn: { lt: checkOutDate },
        checkOut: { gt: checkInDate }
      },
      select: { rooms: true }
    });
    const physicalRoomCount = typeof transaction.room?.count === 'function'
      ? await transaction.room.count({
        where: {
          roomType,
          status: 'AVAILABLE',
          capacity: { gte: Math.ceil(parseInt(guests, 10) / requestedRooms) }
        }
      })
      : inventory.totalRooms;
    const reservedRooms = overlappingBookings.reduce(
      (total, booking) => total + (booking.rooms || 1),
      0
    );
    if (reservedRooms + requestedRooms > physicalRoomCount) {
      const error = new Error('The selected room type is not available for those dates');
      error.status = 409;
      throw error;
    }

    return transaction.booking.create({
      data: {
        userId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        nights,
        roomType,
        rooms: requestedRooms,
        guests: parseInt(guests, 10),
        specialRequests: specialRequests || '',
        firstName,
        lastName,
        email,
        phone,
        status: 'PENDING_PAYMENT',
        pricePerNight,
        totalPrice: totalPrice * requestedRooms
      }
    });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
};

const getBooking = async ({ bookingId, userId }) => {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId }
  });
  if (!booking) {
    const error = new Error('Booking not found');
    error.status = 404;
    throw error;
  }
  return booking;
};

const getBookings = async (userId) => {
  return await prisma.booking.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
};

const cancelBooking = async ({ bookingId, userId }) => {
  const booking = await prisma.booking.findFirst({ where: { id: bookingId, userId } });
  if (!booking) {
    const error = new Error('Booking not found');
    error.status = 404;
    throw error;
  }

  if (booking.status === 'CANCELLED') {
    const error = new Error('Booking is already cancelled');
    error.status = 400;
    throw error;
  }

  const checkInDate = new Date(booking.checkIn);
  if (checkInDate <= new Date()) {
    const error = new Error('Bookings cannot be cancelled after check-in');
    error.status = 400;
    throw error;
  }

  const cancellationDeadline = checkInDate.getTime() - 168 * 60 * 60 * 1000;
  const refundable = Date.now() <= cancellationDeadline;
  const payment = booking.paymentId
    ? await prisma.payment.findFirst({ where: { id: booking.paymentId } })
    : null;
  let refundIssued = false;

  if (refundable && payment?.status === 'succeeded') {
    if (payment.stripePaymentIntentId?.startsWith('pi_')) {
      if (!stripeClient) {
        const error = new Error('Stripe is not configured to refund this booking');
        error.status = 500;
        throw error;
      }
      await stripeClient.refunds.create({ payment_intent: payment.stripePaymentIntentId });
    } else if (environment === 'production') {
      const error = new Error('Paid booking cannot be refunded without Stripe configuration');
      error.status = 500;
      throw error;
    }

    await prisma.payment.update({ where: { id: payment.id }, data: { status: 'refunded' } });
    refundIssued = true;
  }

  await prisma.booking.update({ where: { id: booking.id }, data: { status: 'CANCELLED' } });

  return {
    bookingId: booking.id,
    status: 'CANCELLED',
    refundable,
    refundIssued
  };
};

module.exports = {
  createBooking,
  getBooking,
  getBookings,
  cancelBooking
};
