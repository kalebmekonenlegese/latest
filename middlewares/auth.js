const jwt = require('jsonwebtoken');

const extractCookieToken = (req) => {
  if (req.cookies && req.cookies.auth_token) {
    return req.cookies.auth_token;
  }

  const rawCookieHeader = req.headers && req.headers.cookie;
  if (!rawCookieHeader) {
    return null;
  }

  const match = rawCookieHeader
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith('auth_token='));

  if (!match) {
    return null;
  }

  return decodeURIComponent(match.substring('auth_token='.length));
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const bearerToken = authHeader && authHeader.split(' ')[1];
  const cookieToken = extractCookieToken(req);
  const token = bearerToken || cookieToken;

  if (!token) {
    return res.status(401).json({ error: 'No authentication token provided', requestId: req.id });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token', requestId: req.id });
    }

    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
