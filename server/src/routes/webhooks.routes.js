"use strict";

const express = require("express");
const verifyCashfreeWebhook = require("../middleware/verifyCashfreeWebhook");
const { handleCashfreeWebhook } = require("../controllers/webhook.controller");

const router = express.Router();

router.post(
  "/cashfree",
  verifyCashfreeWebhook,
  handleCashfreeWebhook
);

module.exports = router;