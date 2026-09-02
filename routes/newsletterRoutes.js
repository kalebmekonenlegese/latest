const express = require('express');
const { subscribe, unsubscribe } = require('../controllers/newsletterController');
const { feedbackLimiter } = require('../middlewares/rateLimit');

const router = express.Router();
router.post('/subscribe', feedbackLimiter, subscribe);
router.post('/unsubscribe', feedbackLimiter, unsubscribe);

module.exports = router;
