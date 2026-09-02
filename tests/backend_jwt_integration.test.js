const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../utils/db', () => ({
  booking: {
    findMany: jest.fn()
  }
}));

const prisma = require('../utils/db');

const oldEnv = { ...process.env };
let app;

describe('JWT integration with real auth middleware', () => {
  const jwtSecret = 'integration-test-secret';
  const testUser = { id: 'user-1', email: 'user@example.com' };

  beforeAll(() => {
    process.env.JWT_SECRET = jwtSecret;
    process.env.COOKIE_SECRET = 'cookie-secret';
    process.env.FRONTEND_URL = 'http://localhost:5173';
    process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/test';
    process.env.SKIP_SERVER_START = 'true';
    process.env.NODE_ENV = 'production';
    jest.resetModules();
    app = require('../server');
  });

  afterAll(() => {
    process.env = { ...oldEnv };
  });

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.booking.findMany.mockResolvedValue([]);
  });

  test('missing token returns 401 from protected route', async () => {
    const res = await request(app).get('/api/bookings');
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  test('invalid token returns 403 from protected route', async () => {
    const res = await request(app)
      .get('/api/bookings')
      .set('Authorization', 'Bearer invalid.token.value');

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Invalid or expired token');
  });

  test('expired token returns 403 from protected route', async () => {
    const expiredToken = jwt.sign(testUser, jwtSecret, { expiresIn: '-1s' });

    const res = await request(app)
      .get('/api/bookings')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Invalid or expired token');
  });

  test('valid token can access protected route and returns booking results', async () => {
    prisma.booking.findMany.mockResolvedValueOnce([{ id: 'b1', userId: 'user-1' }]);
    const validToken = jwt.sign(testUser, jwtSecret, { expiresIn: '1h' });

    const res = await request(app)
      .get('/api/bookings')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.status).toBe(200);
    expect(res.body.bookings).toBeInstanceOf(Array);
  });
});
