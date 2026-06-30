const express = require("express");
const crypto = require("crypto");
const mongoose = require("mongoose");

const logger = require("../utils/logger");

const {
    paymentLimiter,
} = require("../middleware/rateLimiter");

const orderRoutes = require("./orders.routes");
const paymentRoutes = require("./payments.routes");

const router = express.Router();

/* ------------------------- */
/* Routes */
/* ------------------------- */

router.use("/orders", orderRoutes);

router.use("/payments", paymentLimiter, paymentRoutes);

module.exports = router;