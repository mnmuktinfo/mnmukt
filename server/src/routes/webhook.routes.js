'use strict';

const { Router } = require('express');
const { webhookLimiter } = require('../middleware/rateLimiter.middleware');
const webhookController = require('../controllers/webhook.controller');

const router = Router();

router.use(webhookLimiter);
router.post('/razorpay', webhookController.razorpayWebhook);

module.exports = router;