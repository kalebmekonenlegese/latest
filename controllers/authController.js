const { registerUser, loginUser } = require('../services/authService');
const auditEvent = require('../middlewares/audit');
const logger = require('../utils/logger');
const isProduction = process.env.NODE_ENV === 'production';
const crossSiteCookiesEnabled = isProduction || process.env.ALLOW_CROSS_SITE_COOKIES === 'true';
const cookieSameSite = crossSiteCookiesEnabled ? 'none' : 'strict';
const secureCookies = crossSiteCookiesEnabled;

const setAuthCookie = (res, token) => {
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: secureCookies,
    sameSite: cookieSameSite,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/'
  });
};

const clearAuthCookie = (res) => {
  res.clearCookie('auth_token', {
    path: '/',
    secure: secureCookies,
    sameSite: cookieSameSite
  });
};

const register = async (req, res) => {
  try {
    const payload = req.body;
    const result = await registerUser(payload);
    if (result && result.token) {
      setAuthCookie(res, result.token);
    }
    auditEvent(req, 'register', 'success', { email: payload.email });
    res.status(201).json({ success: true, message: 'User registered successfully', ...result, requestId: req.id });
  } catch (error) {
    logger.error('Auth register failed: %o requestId=%s method=%s path=%s', error, req.id, req.method, req.path);
    auditEvent(req, 'register', 'failed', { error: error.message, email: req.body.email });
    res.status(error.status || 500).json({
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
      requestId: req.id
    });
  }
};

const login = async (req, res) => {
  try {
    const payload = req.body;
    const result = await loginUser(payload);
    if (result && result.token) {
      setAuthCookie(res, result.token);
    }
    auditEvent(req, 'login', 'success', { email: payload.email });
    res.json({ success: true, message: 'Login successful', ...result, requestId: req.id });
  } catch (error) {
    logger.error('Auth login failed: %o requestId=%s method=%s path=%s', error, req.id, req.method, req.path);
    auditEvent(req, 'login', 'failed', { error: error.message, email: req.body.email });
    res.status(error.status || 500).json({
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
      requestId: req.id
    });
  }
};

const logout = (req, res) => {
  clearAuthCookie(res);
  res.json({ success: true, message: 'Logged out successfully', requestId: req.id });
};

module.exports = {
  register,
  login,
  logout
};
