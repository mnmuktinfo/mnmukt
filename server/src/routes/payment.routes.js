'use strict';

const { Router } = require('express');
const { optionalAuth } = require('../middleware/auth.middleware');
const { paymentLimiter } = require('../middleware/rateLimiter.middleware');
const { validate } = require('../middleware/validate.middleware');
const { createRazorpayOrderSchema, verifyPaymentSchema } = require('../validators/payment.validator');
const paymentController = require('../controllers/payment.controller');

const router = Router();

router.post(
  '/razorpay/order',
  paymentLimiter,
  optionalAuth,
  validate(createRazorpayOrderSchema),
  paymentController.createRazorpayOrder
);

router.post(
  '/razorpay/verify',
  paymentLimiter,
  optionalAuth,
  validate(verifyPaymentSchema),
  paymentController.verifyPayment
);

module.exports = router;