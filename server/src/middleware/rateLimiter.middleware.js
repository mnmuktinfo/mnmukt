'use strict';

const rateLimit = require('express-rate-limit');
const { ApiError } = require('../utils/ApiError');

function limiterErrorHandler(req, res, next, options) {
  next(new ApiError(429, 'Too many requests, please try again later'));
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // strict — auth endpoints are brute-force targets
  standardHeaders: true,
  legacyHeaders: false,
  handler: limiterErrorHandler,
});

const paymentLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30, // medium — real checkouts can retry a few times
  standardHeaders: true,
  legacyHeaders: false,
  handler: limiterErrorHandler,
});

const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120, // strict per-minute cap but tolerant of provider retry bursts
  standardHeaders: true,
  legacyHeaders: false,
  handler: limiterErrorHandler,
});

module.exports = { authLimiter, paymentLimiter, webhookLimiter };