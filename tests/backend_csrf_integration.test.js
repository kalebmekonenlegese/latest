const request = require('supertest');

const oldEnv = { ...process.env };
let app;

describe('CSRF token endpoint in production-like environment', () => {
  beforeAll(() => {
    process.env.NODE_ENV = 'production';
    process.env.SKIP_SERVER_START = 'true';
    process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://user:pass@localhost:5432/test';
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'csrf-test-secret';
    process.env.COOKIE_SECRET = process.env.COOKIE_SECRET || 'cookie-secret';
    process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
    jest.resetModules();
    app = require('../server');
  });

  afterAll(() => {
    process.env = { ...oldEnv };
  });

  test('GET /api/csrf-token returns a token and sets a cookie', async () => {
    const res = await request(app).get('/api/csrf-token');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.csrfToken).toBeDefined();
    expect(typeof res.body.csrfToken).toBe('string');
    expect(res.headers['set-cookie']).toEqual(expect.arrayContaining([expect.stringContaining('csrf-secure=')]));
    expect(res.headers['set-cookie'].join(';')).toMatch(/SameSite=None/i);
    expect(res.headers['set-cookie'].join(';')).toMatch(/Secure/i);
  });

  test('accepts the configured mixed-case CSRF header on a state-changing request', async () => {
    const csrfResponse = await request(app).get('/api/csrf-token');
    const csrfToken = csrfResponse.body.csrfToken;
    const csrfCookies = csrfResponse.headers['set-cookie'].map((cookie) => cookie.split(';')[0]).join('; ');

    const res = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', csrfCookies)
      .set('X-CSRF-Token', csrfToken)
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
