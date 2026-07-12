"use strict";

const express = require("express");
const { createCashfreeOrder, getPaymentStatus } = require("../controllers/payment.controller");
const verifyCashfreeWebhook = require("../middleware/verifyCashfreeWebhook");
const { handleCashfreeWebhook } = require("../controllers/webhook.controller");

const router = express.Router();

// Client routes
router.post("/create-order", createCashfreeOrder);
router.get("/status/:orderId", getPaymentStatus);

// Webhook route - using express.raw() to capture the exact payload for verification
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  verifyCashfreeWebhook,
  handleCashfreeWebhook
);

module.exports = router;