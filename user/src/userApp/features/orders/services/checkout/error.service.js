// src/features/orders/services/checkout/error.service.js
import { ERROR_MESSAGES, PRICING_DEFAULTS, UI_MESSAGES } from "../schema";

export const getErrorMessage = (error) => {
  if (!error) return ERROR_MESSAGES.CHECKOUT_FAILED;
  if (typeof error === "string") return error;

  const msg = error.message?.toLowerCase() || "";
  if (msg.includes("network")) return ERROR_MESSAGES.NETWORK_ERROR;
  if (msg.includes("payment")) return ERROR_MESSAGES.PAYMENT_GATEWAY_FAILED;
  if (msg.includes("validation")) return ERROR_MESSAGES.INVALID_ITEMS;
  return error.message || ERROR_MESSAGES.CHECKOUT_FAILED;
};

export const formatPrice = (price, locale = "en-IN") =>
  new Intl.NumberFormat(locale).format(price || 0);

export const calculatePoints = (price) =>
  Math.round((price || 0) * PRICING_DEFAULTS.POINTS_MULTIPLIER) + PRICING_DEFAULTS.POINTS_MIN;

export const getDiscount = (original, current) => {
  if (!original || !current || original <= current) return 0;
  return Math.round(((original - current) / original) * 100);
};

export { UI_MESSAGES };