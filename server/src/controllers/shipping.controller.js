"use strict";

const shiprocketService = require("../services/shiprocket.service");
const logger = require("../utils/logger");

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const PINCODE_REGEX = /^[1-9][0-9]{5}$/; // Indian pincodes never start with 0

/**
 * GET /api/v1/shipping/serviceability/:pincode?cod=1&weight=0.5
 */
exports.getServiceability = asyncHandler(async (req, res) => {
  const { pincode } = req.params;
  const { cod, weight } = req.query;

  if (!PINCODE_REGEX.test(pincode || "")) {
    return res.status(400).json({ success: false, message: "Valid 6-digit pincode is required" });
  }

  const pickupPincode = process.env.PICKUP_PINCODE;
  if (!pickupPincode) {
    logger("ERROR", "PICKUP_PINCODE env var is not configured");
    return res.status(500).json({ success: false, message: "Shipping is temporarily unavailable" });
  }

  const parsedWeight = Number(weight);
  const safeWeight = Number.isFinite(parsedWeight) && parsedWeight > 0 ? parsedWeight : 0.5;

  // Reflect the delivery mode the customer actually selected, instead of
  // always checking prepaid serviceability regardless of cart state.
  const isCod = cod === "1" || cod === "true" ? 1 : 0;

  const data = await shiprocketService.getServiceability({
    pickupPincode,
    deliveryPincode: pincode,
    weight: safeWeight,
    cod: isCod,
  });

  // TODO: cache by (pincode, cod, weight-bucket) for a few minutes — this
  // endpoint is typically hit on every product page load and Shiprocket
  // serviceability rarely changes minute to minute.
  return res.status(200).json({ success: true, data });
});