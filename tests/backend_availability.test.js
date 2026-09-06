jest.mock('../utils/db', () => ({
  roomInventory: { findMany: jest.fn() },
  room: { findMany: jest.fn() },
  booking: { findMany: jest.fn() }
}));

const prisma = require('../utils/db');
const { getAvailability } = require('../services/availabilityService');

describe('availabilityService (unit)', () => {
  beforeEach(() => {
    prisma.roomInventory.findMany.mockResolvedValue([
      { roomType: 'standard-room', totalRooms: 5, pricePerNight: 145 },
      { roomType: 'deluxe-room', totalRooms: 3, pricePerNight: 195 },
      { roomType: 'executive-suite', totalRooms: 2, pricePerNight: 285 },
      { roomType: 'family-room', totalRooms: 4, pricePerNight: 250 }
    ]);
    prisma.room.findMany.mockResolvedValue([
      { roomType: 'standard-room' },
      { roomType: 'standard-room' },
      { roomType: 'standard-room' },
      { roomType: 'standard-room' },
      { roomType: 'standard-room' },
      { roomType: 'deluxe-room' },
      { roomType: 'deluxe-room' },
      { roomType: 'deluxe-room' },
      { roomType: 'executive-suite' },
      { roomType: 'executive-suite' },
      { roomType: 'family-room' },
      { roomType: 'family-room' },
      { roomType: 'family-room' },
      { roomType: 'family-room' }
    ]);
    prisma.booking.findMany.mockResolvedValue([]);
  });

  test('returns full availability when no roomType provided', async () => {
    const result = await getAvailability({ checkIn: '2026-09-01', checkOut: '2026-09-02' });
    expect(result['standard-room']).toBeDefined();
    expect(result['deluxe-room']).toBeDefined();
  });

  test('returns specific room availability when valid roomType provided', async () => {
    const result = await getAvailability({ checkIn: '2026-09-01', checkOut: '2026-09-02', roomType: 'deluxe-room' });
    expect(result).toEqual({ 'deluxe-room': 3 });
  });

  test('subtracts overlapping reserved rooms from inventory', async () => {
    prisma.booking.findMany.mockResolvedValue([
      { roomType: 'standard-room', rooms: 2 },
      { roomType: 'standard-room', rooms: 1 }
    ]);

    const result = await getAvailability({
      checkIn: '2026-09-01',
      checkOut: '2026-09-03',
      roomType: 'standard-room'
    });

    expect(result).toEqual({ 'standard-room': 2 });
  });

  test('counts only available rooms that meet requested capacity', async () => {
    prisma.room.findMany.mockResolvedValue([
      { roomType: 'standard-room' },
      { roomType: 'standard-room' }
    ]);

    const result = await getAvailability({
      checkIn: '2026-09-01',
      checkOut: '2026-09-02',
      roomType: 'standard-room',
      guests: 4
    });

    expect(prisma.room.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        roomType: 'standard-room',
        status: 'AVAILABLE',
        capacity: { gte: 4 }
      })
    }));
    expect(result).toEqual({ 'standard-room': 2 });
  });

  test('applies guest capacity per requested room', async () => {
    await getAvailability({
      checkIn: '2026-09-01',
      checkOut: '2026-09-02',
      roomType: 'standard-room',
      guests: 4,
      rooms: 2
    });

    expect(prisma.room.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        capacity: { gte: 2 }
      })
    }));
  });

  test('throws 400 for invalid roomType', async () => {
    await expect(getAvailability({ checkIn: '2026-09-01', checkOut: '2026-09-02', roomType: 'invalid-room' })).rejects.toThrow();
    try {
      await getAvailability({ checkIn: '2026-09-01', checkOut: '2026-09-02', roomType: 'invalid-room' });
    } catch (e) {
      expect(e.status).toBe(400);
    }
  });

  test('throws 400 for missing dates', async () => {
    await expect(getAvailability({})).rejects.toThrow();
    try {
      await getAvailability({});
    } catch (e) {
      expect(e.status).toBe(400);
    }
  });
});