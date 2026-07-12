"use strict";

const { verifyWebhookSignature } = require("../services/cashfree.service");
const logger = require("../utils/logger");

const verifyCashfreeWebhook = (req, res, next) => {
  const signature = req.headers["x-webhook-signature"];
  const timestamp = req.headers["x-webhook-timestamp"];
  const rawBody = req.body;

  if (!signature || !timestamp || !rawBody) {
    logger("WARN", "Missing Cashfree webhook headers or body");
    return res.status(400).json({ success: false, message: "Missing webhook data" });
  }

  const rawBodyString = Buffer.isBuffer(rawBody) ? rawBody.toString("utf8") : rawBody;

  if (!verifyWebhookSignature({ rawBody: rawBodyString, signature, timestamp })) {
    logger("WARN", "Invalid Cashfree webhook signature");
    return res.status(400).json({ success: false, message: "Invalid signature" });
  }

  req.rawBodyString = rawBodyString;
  next();
};

module.exports = verifyCashfreeWebhook;
