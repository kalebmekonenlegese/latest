const express = require('express');
const { create, list } = require('../controllers/reviewController');
const authenticateToken = require('../middlewares/auth');

const router = express.Router();
router.post('/', authenticateToken, create);
router.get('/', list);

module.exports = router;
