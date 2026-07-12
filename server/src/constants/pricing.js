'use strict';

/**
 * Global pricing constants for the store.
 * These should match the values used in your frontend logic.
 */
const PRICING_DEFAULTS = {
  FREE_SHIPPING_THRESHOLD: 1000, // Matches your MNMUKT policy
  SHIPPING_CHARGE: 150,          // The fee for orders below threshold
  COD_CHARGE: 50,                // The fee for Cash on Delivery
  TAX_RATE: 0,                   // Adjust as per your GST/Tax requirements
  CURRENCY: 'INR',
};

module.exports = {
  PRICING_DEFAULTS,
};