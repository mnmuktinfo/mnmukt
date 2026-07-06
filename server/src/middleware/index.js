"use strict";

const {
  firebaseAuthMiddleware,
  optionalAuthMiddleware,
  adminMiddleware,
} = require("./firebaseAuthMiddleware");

const asyncHandler = require("./asyncHandler");

const {
  validateBody,
  validateParams,
  validateQuery,
} = require("./validate.middleware");

const {
  apiLimiter,
  authLimiter,
  orderLimiter,
  readLimiter,
  paymentLimiter,
  adminLimiter,
} = require("./rateLimiter.middleware");

module.exports = {
  // Auth
  firebaseAuthMiddleware,
  optionalAuthMiddleware,
  adminMiddleware,

  // Utils
  asyncHandler,

  // Validation
  validateBody,
  validateParams,
  validateQuery,

  // Rate Limiters
  apiLimiter,
  authLimiter,
  orderLimiter,
  readLimiter,
  paymentLimiter,
  adminLimiter,
};