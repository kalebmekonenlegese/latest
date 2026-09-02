const express = require('express');
const { event } = require('../controllers/analyticsController');

const router = express.Router();
router.post('/', event);

module.exports = router;
