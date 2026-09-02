const express = require('express');
const { createIntent, confirm } = require('../controllers/paymentController');
const authenticateToken = require('../middlewares/auth');

const router = express.Router();
const allowAuthenticatedOrGuest = (handler) => (req, res, next) => {
	if (!req.headers.authorization && !req.headers['x-test-user']) return handler(req, res, next);
	return authenticateToken(req, res, () => handler(req, res, next));
};

router.post('/create-intent', allowAuthenticatedOrGuest(createIntent));
router.post('/confirm', allowAuthenticatedOrGuest(confirm));

module.exports = router;
