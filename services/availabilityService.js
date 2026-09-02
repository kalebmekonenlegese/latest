const prisma = require('../utils/db');

const activeBookingStatuses = ['PENDING_PAYMENT', 'CONFIRMED'];

const getAvailability = async ({ checkIn, checkOut, roomType, guests }) => {
  if (!checkIn || !checkOut) {
    const error = new Error('Check-in and check-out dates required');
    error.status = 400;
    throw error;
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime()) || checkOutDate <= checkInDate) {
    const error = new Error('Check-out date must be after check-in date');
    error.status = 400;
    throw error;
  }

  const inventories = await prisma.roomInventory.findMany({
    where: roomType ? { roomType } : undefined,
    orderBy: { roomType: 'asc' }
  });

  if (roomType) {
    if (!inventories.some((inventory) => inventory.roomType === roomType)) {
      const error = new Error('Invalid room type for availability lookup');
      error.status = 400;
      throw error;
    }
  }

  const requestedGuests = guests === undefined ? null : Number(guests);
  if (requestedGuests !== null && (!Number.isInteger(requestedGuests) || requestedGuests < 1)) {
    const error = new Error('Guests must be a positive integer');
    error.status = 400;
    throw error;
  }

  const physicalRooms = typeof prisma.room?.findMany === 'function'
    ? await prisma.room.findMany({
      where: {
        ...(roomType ? { roomType } : {}),
        status: 'AVAILABLE',
        ...(requestedGuests ? { capacity: { gte: requestedGuests } } : {})
      },
      select: { roomType: true }
    })
    : null;

  const bookings = await prisma.booking.findMany({
    where: {
      ...(roomType ? { roomType } : {}),
      status: { in: activeBookingStatuses },
      checkIn: { lt: checkOutDate },
      checkOut: { gt: checkInDate }
    },
    select: { roomType: true, rooms: true }
  });

  const reservedByRoomType = bookings.reduce((reserved, booking) => {
    reserved[booking.roomType] = (reserved[booking.roomType] || 0) + (booking.rooms || 1);
    return reserved;
  }, {});

  const availablePhysicalRooms = physicalRooms?.reduce((available, room) => {
    available[room.roomType] = (available[room.roomType] || 0) + 1;
    return available;
  }, {});

  const availability = inventories.reduce((available, inventory) => {
    const totalRooms = availablePhysicalRooms
      ? availablePhysicalRooms[inventory.roomType] || 0
      : inventory.totalRooms;
    available[inventory.roomType] = Math.max(
      0,
      totalRooms - (reservedByRoomType[inventory.roomType] || 0)
    );
    return available;
  }, {});

  return roomType ? { [roomType]: availability[roomType] } : availability;
};

const getRoomPricing = async () => {
  return prisma.roomInventory.findMany({
    select: { roomType: true, pricePerNight: true, totalRooms: true },
    orderBy: { roomType: 'asc' }
  });
};

module.exports = { getAvailability, getRoomPricing };