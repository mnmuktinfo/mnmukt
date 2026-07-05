// src/config/schema.js
// Single source of truth for all checkout-related constants, defaults, and shapes.

export const PAYMENT_GATEWAY = Object.freeze({
  RAZORPAY: "razorpay",
  COD: "cod",
});

export const PAYMENT_STATUS = Object.freeze({
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  COD_PENDING: "cod_pending",
});

// Mirrors the backend's real orderStatus values (see order-tracking API doc):
// pending -> confirmed -> processing -> shipped -> delivered, or cancelled at any point
// before shipment. "processing" covers admin status updates that aren't a shipment yet.
export const ORDER_STATUS = Object.freeze({
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
});

export const VALIDATION_RULES = Object.freeze({
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  POSTAL_CODE_REGEX: /^[1-9][0-9]{5}$/, // Indian PIN codes
  PHONE_MIN_DIGITS: 10,
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 10,
  MAX_ITEMS: 50,
});

export const PRICING_DEFAULTS = Object.freeze({
  CURRENCY: "INR",
  SHIPPING_CHARGE: 0, // used above the free-shipping threshold
  TAX_RATE: 0,
  POINTS_MULTIPLIER: 0.02,
  POINTS_MIN: 5,
  FREE_SHIPPING_THRESHOLD: 999,
  TIER_1_THRESHOLD: 499,
  TIER_1_CHARGE: 50,
  TIER_2_CHARGE: 25,
});

export const ERROR_MESSAGES = Object.freeze({
  CART_EMPTY: "Your cart is empty",
  INVALID_ITEMS: "Some items in your cart are invalid",
  EMAIL_REQUIRED: "Email is required",
  EMAIL_INVALID: "Enter a valid email address",
  PHONE_REQUIRED: "Phone number is required",
  PHONE_INVALID: "Enter a valid 10-digit phone number",
  POSTAL_CODE_REQUIRED: "PIN code is required",
  POSTAL_CODE_INVALID: "Enter a valid 6-digit PIN code",
  FULLNAME_REQUIRED: "Full name is required",
  ADDRESS_REQUIRED: "Address line is required",
  CITY_REQUIRED: "City is required",
  STATE_REQUIRED: "State is required",
  ORDER_CREATION_FAILED: "Could not create your order. Please try again",
  PAYMENT_ORDER_FAILED: "Could not initiate payment. Please try again",
  PAYMENT_VERIFICATION_FAILED: "Payment verification failed",
  PAYMENT_GATEWAY_FAILED: "Payment gateway failed to load",
  PAYMENT_CANCELLED: "Payment was cancelled",
  NETWORK_ERROR: "Network error. Please check your connection",
  CHECKOUT_FAILED: "Checkout failed. Please try again",
  SHIPPING_UNAVAILABLE: "Delivery not available for this PIN code",
DISTRICT_REQUIRED: "District is required",
});

export const UI_MESSAGES = Object.freeze({
  CREATING_ORDER: "Creating your order...",
  LOADING_PAYMENT: "Loading payment gateway...",
  PREPARING_PAYMENT: "Preparing payment...",
  VERIFYING_PAYMENT: "Verifying payment...",
  CHECKING_SERVICEABILITY: "Checking delivery availability...",
});

// schema.js — EMPTY_ADDRESS_FORM
export const EMPTY_ADDRESS_FORM = Object.freeze({
  fullName: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  district: "",   // ← add
  state: "",
  postalCode: "",
  landmark: "",
  country: "India",
});

// Canonical shapes — not enforced at runtime, but document the contract
// used across normalizeItems / buildOrderPayload / backend schema.

/**
 * @typedef {Object} NormalizedCartItem
 * @property {string} productId
 * @property {string} sku
 * @property {string} slug
 * @property {string} name
 * @property {string} image
 * @property {string} brand
 * @property {string} category
 * @property {{size:string,color:string}} variant
 * @property {number} quantity
 * @property {number} price
 * @property {number} originalPrice
 * @property {number} totalPrice
 */

/**
 * @typedef {Object} Customer
 * @property {string|null} userId
 * @property {string} email
 * @property {string} name
 * @property {boolean} isGuest
 */

/**
 * @typedef {Object} PricingBreakdown
 * @property {number} subtotal
 * @property {number} totalMRP
 * @property {number} totalPayable
 * @property {number} itemDiscount
 * @property {number} discountPercent
 * @property {number} deliveryFee
 * @property {number} taxAmount
 * @property {number} totalQuantity
 * @property {string} currency
 */

/**
 * Canonical shape sent to POST /orders and POST /payments/create-order.
 * @typedef {Object} OrderPricingPayload
 * @property {number} subtotal
 * @property {number} discount
 * @property {number} shipping
 * @property {number} tax
 * @property {number} total
 */