// src/features/orders/services/checkout/checkout.service.js
// Single place that pulls every checkout sub-service together.
// index.js re-exports from here — nothing outside this folder should
// import the *.service.js files directly.

export {
  validateCartItems,
  validateEmail,
  validatePhone,
  validatePostalCode,
  validateAddress,
} from "./validation.service";

export { normalizeItems, buildFallbackSku } from "./item.service";

export { calculatePricing } from "./pricing.service";

export { buildOrderPayload } from "./orderPayload.service";

export {
  createOrderAsync,
  createPaymentOrderAsync,
  verifyPaymentAsync,
  loadCashfree,
} from "./payment.service";

export {
  getErrorMessage,
  formatPrice,
  calculatePoints,
  getDiscount,
  UI_MESSAGES,
} from "./error.service";