const prisma = require('../utils/db');

const activeBookingStatuses = ['PENDING_PAYMENT', 'CONFIRMED'];
const roomTypeAliases = {
  standard: 'standard-room',
  deluxe: 'deluxe-room',
  executive: 'executive-suite',
  family: 'family-room',
  'standard-room': 'standard-room',
  'deluxe-room': 'deluxe-room',
  'executive-suite': 'executive-suite',
  'family-room': 'family-room'
};

const normalizeRoomType = (roomType) => {
  if (!roomType) return roomType;
  const normalized = String(roomType).trim().toLowerCase();
  return roomTypeAliases[normalized] || normalized;
};

const getAvailability = async ({ checkIn, checkOut, roomType, guests, rooms = 1 }) => {
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

  const normalizedRoomType = normalizeRoomType(roomType);

  const inventories = await prisma.roomInventory.findMany({
    where: normalizedRoomType ? { roomType: normalizedRoomType } : undefined,
    orderBy: { roomType: 'asc' }
  });

  if (normalizedRoomType) {
    if (!inventories.some((inventory) => inventory.roomType === normalizedRoomType)) {
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

  const requestedRooms = Number(rooms);
  if (!Number.isInteger(requestedRooms) || requestedRooms < 1) {
    const error = new Error('Rooms must be a positive integer');
    error.status = 400;
    throw error;
  }

  const guestsPerRoom = requestedGuests === null
    ? null
    : Math.ceil(requestedGuests / requestedRooms);

  const physicalRooms = typeof prisma.room?.findMany === 'function'
    ? await prisma.room.findMany({
      where: {
        ...(normalizedRoomType ? { roomType: normalizedRoomType } : {}),
        status: 'AVAILABLE',
        ...(guestsPerRoom ? { capacity: { gte: guestsPerRoom } } : {})
      },
      select: { roomType: true }
    })
    : null;

  const bookings = await prisma.booking.findMany({
    where: {
      ...(normalizedRoomType ? { roomType: normalizedRoomType } : {}),
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

  return normalizedRoomType ? { [normalizedRoomType]: availability[normalizedRoomType] } : availability;
};

const getRoomPricing = async () => {
  return prisma.roomInventory.findMany({
    select: { roomType: true, pricePerNight: true, totalRooms: true },
    orderBy: { roomType: 'asc' }
  });
};

module.exports = { getAvailability, getRoomPricing };