const crypto = require("crypto");

/**
 * Generate unique Order ID
 * Example: MNMU-1A2B3C4D5E6F
 */
const makeOrderId = () => {
  const random = crypto.randomBytes(6).toString("hex").toUpperCase();
  return `MNMU-${random}`;
};

module.exports = { makeOrderId };