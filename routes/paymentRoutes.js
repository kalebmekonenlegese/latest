const express = require('express');
const { initializeChapaPayment, verifyChapaPayment, handleChapaCallback, createIntent, confirm } = require('../controllers/paymentController');
const authenticateToken = require('../middlewares/auth');

const router = express.Router();
const hasAuthCookie = (req) => {
  const cookieHeader = req.headers.cookie || '';
  return cookieHeader.split(';').some((cookie) => cookie.trim().startsWith('auth_token='));
};

const allowAuthenticatedOrGuest = (handler) => (req, res, next) => {
  const hasAuthorization = Boolean(req.headers.authorization || req.headers['x-test-user']);
  if (!hasAuthorization && !hasAuthCookie(req)) {
    return handler(req, res, next);
  }
  return authenticateToken(req, res, () => handler(req, res, next));
};

router.post('/chapa/initialize', allowAuthenticatedOrGuest(initializeChapaPayment));
router.post('/chapa/verify', allowAuthenticatedOrGuest(verifyChapaPayment));
router.post('/chapa/callback', handleChapaCallback);
router.get('/chapa/callback', handleChapaCallback);

router.post('/create-intent', allowAuthenticatedOrGuest(createIntent));
router.post('/confirm', allowAuthenticatedOrGuest(confirm));

module.exports = router;
