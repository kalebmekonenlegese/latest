jest.mock('../utils/db', () => ({
  booking: { create: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
  roomInventory: { findUnique: jest.fn() },
  user: { findUnique: jest.fn() },
  payment: { create: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
  $transaction: jest.fn()
}));

const prisma = require('../utils/db');
const { createBooking, getBooking, cancelBooking } = require('../services/bookingService');

describe('bookingService (unit)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation((callback) => callback(prisma));
    prisma.roomInventory.findUnique.mockResolvedValue({ roomType: 'standard-room', totalRooms: 5, pricePerNight: 145 });
    prisma.booking.findMany.mockResolvedValue([]);
  });

  test('createBooking success path', async () => {
    prisma.booking.create.mockResolvedValueOnce({
      id: 'b1',
      checkIn: new Date('2026-09-01'),
      checkOut: new Date('2026-09-02'),
      nights: 1,
      roomType: 'standard-room',
      guests: 2,
      totalPrice: 145,
      status: 'PENDING_PAYMENT'
    });

    const booking = await createBooking({
      userId: 'u1',
      checkIn: '2026-09-01',
      checkOut: '2026-09-02',
      roomType: 'standard-room',
      guests: 2,
      firstName: 'Joe',
      lastName: 'Doe',
      email: 'joe@example.com',
      phone: '+1234567890'
    });

    expect(prisma.booking.create).toHaveBeenCalled();
    expect(booking.id).toBe('b1');
  });

  test('createBooking validation failure missing fields', async () => {
    await expect(createBooking({ userId: 'u1' })).rejects.toThrow();
  });

  test('createBooking invalid room type -> 400', async () => {
    await expect(
      createBooking({
        userId: 'u1',
        checkIn: '2026-09-01',
        checkOut: '2026-09-02',
        roomType: 'invalid',
        guests: 2,
        firstName: 'Joe',
        lastName: 'Doe',
        email: 'joe@example.com',
        phone: '+1234567890'
      })
    ).rejects.toThrow('Invalid room type');
  });

  test('createBooking invalid date range -> 400', async () => {
    await expect(
      createBooking({
        userId: 'u1',
        checkIn: '2026-09-05',
        checkOut: '2026-09-01',
        roomType: 'standard-room',
        guests: 2,
        firstName: 'Joe',
        lastName: 'Doe',
        email: 'joe@example.com',
        phone: '+1234567890'
      })
    ).rejects.toThrow('Check-out date must be after check-in date');
  });

  test('createBooking invalid email -> 400', async () => {
    await expect(
      createBooking({
        userId: 'u1',
        checkIn: '2026-09-01',
        checkOut: '2026-09-02',
        roomType: 'standard-room',
        guests: 2,
        firstName: 'Joe',
        lastName: 'Doe',
        email: 'invalid-email',
        phone: '+1234567890'
      })
    ).rejects.toThrow('Invalid email format');
  });

  test('createBooking invalid phone -> 400', async () => {
    await expect(
      createBooking({
        userId: 'u1',
        checkIn: '2026-09-01',
        checkOut: '2026-09-02',
        roomType: 'standard-room',
        guests: 2,
        firstName: 'Joe',
        lastName: 'Doe',
        email: 'joe@example.com',
        phone: '123'
      })
    ).rejects.toThrow('Invalid phone number format');
  });

  test('createBooking fills missing contact fields from user profile', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({ firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' });
    prisma.booking.create.mockResolvedValueOnce({ id: 'b2', checkIn: new Date('2026-09-01'), checkOut: new Date('2026-09-02'), nights: 1, roomType: 'standard-room', guests: 2, totalPrice: 145, status: 'PENDING_PAYMENT' });

    const booking = await createBooking({
      userId: 'u1',
      checkIn: '2026-09-01',
      checkOut: '2026-09-02',
      roomType: 'standard-room',
      guests: 2,
      phone: '+1234567890'
    });

    expect(prisma.booking.create).toHaveBeenCalled();
    expect(booking.id).toBe('b2');
  });

  test('createBooking rejects overlapping bookings when inventory is exhausted', async () => {
    prisma.roomInventory.findUnique.mockResolvedValueOnce({ roomType: 'standard-room', totalRooms: 2, pricePerNight: 145 });
    prisma.booking.findMany.mockResolvedValueOnce([{ rooms: 2 }]);

    await expect(createBooking({
      userId: 'u1',
      checkIn: '2026-09-01',
      checkOut: '2026-09-02',
      roomType: 'standard-room',
      rooms: 1,
      guests: 2,
      firstName: 'Joe',
      lastName: 'Doe',
      email: 'joe@example.com',
      phone: '+1234567890'
    })).rejects.toThrow('not available');

    expect(prisma.booking.create).not.toHaveBeenCalled();
  });

  test('getBooking not found', async () => {
    prisma.booking.findFirst.mockResolvedValueOnce(null);
    await expect(getBooking({ bookingId: 'nope', userId: 'u1' })).rejects.toThrow();
    try {
      await getBooking({ bookingId: 'nope', userId: 'u1' });
    } catch (e) {
      expect(e.status).toBe(404);
    }
  });

  test('cancelBooking cancels a future booking without a paid deposit', async () => {
    prisma.booking.findFirst.mockResolvedValueOnce({
      id: 'b-cancel',
      userId: 'u1',
      checkIn: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      status: 'PENDING_PAYMENT',
      paymentId: null
    });
    prisma.booking.update.mockResolvedValueOnce({ id: 'b-cancel', status: 'CANCELLED' });

    const result = await cancelBooking({ bookingId: 'b-cancel', userId: 'u1' });

    expect(result).toEqual({
      bookingId: 'b-cancel',
      status: 'CANCELLED',
      refundable: true,
      refundIssued: false
    });
    expect(prisma.booking.update).toHaveBeenCalledWith({
      where: { id: 'b-cancel' },
      data: { status: 'CANCELLED' }
    });
  });
});