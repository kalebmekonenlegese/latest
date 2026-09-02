jest.mock('../utils/db', () => ({
  contactSubmission: { create: jest.fn() }
}));

const prisma = require('../utils/db');
const { submitContact } = require('../services/contactService');

describe('contactService (unit)', () => {
  beforeEach(() => jest.clearAllMocks());

  test('submitContact success', async () => {
    prisma.contactSubmission.create.mockResolvedValueOnce({ id: 'c1' });
    const result = await submitContact({ firstName: 'A', lastName: 'B', email: 'a@b.com', phone: '+1234567890', subject: 'Hello', message: 'Hello message' });
    expect(result).toBeDefined();
    expect(prisma.contactSubmission.create).toHaveBeenCalled();
  });

  test('submitContact missing data -> 400', async () => {
    await expect(submitContact({ firstName: 'A', email: 'a@b.com' })).rejects.toThrow('Validation failed');
  });

  test('submitContact invalid email -> 400', async () => {
    await expect(submitContact({ firstName: 'A', lastName: 'B', email: 'invalid', phone: '+1234567890', subject: 'Hello', message: 'Hello' })).rejects.toThrow('Validation failed');
  });

  test('submitContact invalid phone -> 400', async () => {
    await expect(submitContact({ firstName: 'A', lastName: 'B', email: 'a@b.com', phone: 'abc', subject: 'Hello', message: 'Hello' })).rejects.toThrow('Validation failed');
  });
});
