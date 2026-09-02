jest.mock('../utils/db', () => ({
  user: { findUnique: jest.fn(), create: jest.fn() }
}));

const prisma = require('../utils/db');
const bcrypt = require('bcrypt');
const { registerUser, loginUser } = require('../services/authService');

jest.mock('bcrypt');

describe('authService (unit)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('registerUser success', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(null);
    bcrypt.hash.mockResolvedValueOnce('hashed');
    prisma.user.create.mockResolvedValueOnce({ id: 'u1', email: 'a@b.com', firstName: 'A', lastName: 'B' });

    const res = await registerUser({ email: 'a@b.com', password: 'password1', firstName: 'A', lastName: 'B' });
    expect(res.user).toBeDefined();
    expect(res.token).toBeDefined();
  });

  test('registerUser existing user -> conflict', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({ id: 'u1' });
    await expect(registerUser({ email: 'a@b.com', password: 'password1', firstName: 'A', lastName: 'B' })).rejects.toThrow();
  });

  test('loginUser invalid credentials', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(null);
    await expect(loginUser({ email: 'nope@b.com', password: 'password1' })).rejects.toThrow();
  });
});