"use strict";

const { rateLimit, ipKeyGenerator } = require("express-rate-limit");
const logger = require("../utils/logger");

const createLimiter = ({ windowMs, max, message, skipSuccessfulRequests = false }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,

    handler: (req, res) => {
      logger("WARN", message, {
        ip: req.ip,
        method: req.method,
        path: req.originalUrl,
      });

      return res.status(429).json({
        success: false,
        message,
      });
    },
  });

/* ==========================================================
   Global
========================================================== */

const apiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests. Please try again later.",
});

/* ==========================================================
   Authentication
========================================================== */

const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts. Please try again later.",
  skipSuccessfulRequests: true,
});

/* ==========================================================
   Orders
========================================================== */

const orderLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many order requests. Please try again later.",
});

/* ==========================================================
   Read Operations
========================================================== */

const readLimiter = createLimiter({
  windowMs: 1 * 60 * 1000,
  max: 300,
  message: "Too many requests. Please slow down.",
});

/* ==========================================================
   Payments
========================================================== */

const paymentLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many payment attempts. Please try again later.",
});

/* ==========================================================
   Admin
========================================================== */

const adminLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: "Too many admin requests. Please try again later.",
});

/* ==========================================================
   Exports
========================================================== */

module.exports = {
  createLimiter,
  apiLimiter,
  authLimiter,
  orderLimiter,
  readLimiter,
  paymentLimiter,
  adminLimiter,
};