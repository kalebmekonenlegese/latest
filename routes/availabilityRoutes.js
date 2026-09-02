const express = require('express');
const { availability, rooms } = require('../controllers/availabilityController');

const router = express.Router();
router.get('/', availability);
router.get('/rooms', rooms);

module.exports = router;
