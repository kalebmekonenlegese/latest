const express = require('express');
const { create, getOne, list, cancel } = require('../controllers/bookingController');
const authenticateToken = require('../middlewares/auth');

const router = express.Router();

router.post('/', (req, res, next) => {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		return create(req, res, next);
	}
	return authenticateToken(req, res, next);
}, create);
router.post('/:bookingId/cancel', authenticateToken, cancel);
router.get('/:bookingId', authenticateToken, getOne);
router.get('/', authenticateToken, list);

module.exports = router;
