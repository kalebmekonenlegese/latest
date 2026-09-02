const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middlewares/auth');

const app = express();
app.get('/secure', authenticateToken, (req, res) => res.json({ success: true, user: req.user }));

describe('auth middleware', () => {
  test('missing token -> 401', async () => {
    const res = await request(app).get('/secure');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('No authentication token provided');
  });

  test('invalid token -> 403', async () => {
    const res = await request(app).get('/secure').set('Authorization', 'Bearer invalid.token');
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Invalid or expired token');
  });

  test('expired token -> 403', async () => {
    const token = jwt.sign({ id: 'u1', email: 'a@b.com' }, process.env.JWT_SECRET || 'dev-secret-key', { expiresIn: '-1s' });
    const res = await request(app).get('/secure').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Invalid or expired token');
  });

  test('valid token -> success', async () => {
    const token = jwt.sign({ id: 'u1', email: 'a@b.com' }, process.env.JWT_SECRET || 'dev-secret-key', { expiresIn: '1h' });
    const res = await request(app).get('/secure').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.id).toBe('u1');
  });

  test('valid cookie token -> success', async () => {
    const token = jwt.sign({ id: 'u2', email: 'b@c.com' }, process.env.JWT_SECRET || 'dev-secret-key', { expiresIn: '1h' });
    const res = await request(app).get('/secure').set('Cookie', `auth_token=${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.id).toBe('u2');
  });
});
