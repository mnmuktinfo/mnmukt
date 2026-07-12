"use strict";

const { Cashfree, CFEnvironment } = require("cashfree-pg");

if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
  console.warn("[Cashfree] CASHFREE_APP_ID and CASHFREE_SECRET_KEY must be set.");
}

Cashfree.XClientId = process.env.CASHFREE_APP_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
Cashfree.XEnvironment =
  (process.env.CASHFREE_ENVIRONMENT || "sandbox").toLowerCase() === "production"
    ? CFEnvironment.PRODUCTION
    : CFEnvironment.SANDBOX;

module.exports = Cashfree;
