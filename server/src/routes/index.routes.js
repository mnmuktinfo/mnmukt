const express = require("express");
const crypto = require("crypto");
const mongoose = require("mongoose");

const logger = require("../utils/logger");

const {
    paymentLimiter,
} = require("../middleware/rateLimiter");

const orderRoutes = require("./orders.routes");
const paymentRoutes = require("./payments.routes");
const shippingRoutes = require("./shipping.routes"); // NEW


const router = express.Router();

/* ------------------------- */
/* Routes */
/* ------------------------- */

router.use("/orders", orderRoutes);

router.use("/payments", paymentLimiter, paymentRoutes);
router.use("/shipping", shippingRoutes); // NEW

module.exports = router;