const express = require('express');
const { contact } = require('../controllers/contactController');
const { feedbackLimiter } = require('../middlewares/rateLimit');

const router = express.Router();
router.post('/', feedbackLimiter, contact);

module.exports = router;
