"use strict";

/* ================================================
   VALIDATION RULES
================================================ */
export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[0-9]{10}$/,
  PHONE_MIN_DIGITS: 10,
  POSTAL_CODE_REGEX: /^[0-9]{6}$/,

  MIN_ITEMS: 1,
  MAX_ITEMS: 100,
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 100,

  AMOUNT_TOLERANCE: 1,
};

/* ================================================
   PRICING DEFAULTS (CLEAN + BACKEND SAFE)
================================================ */
export const PRICING_DEFAULTS = Object.freeze({
  CURRENCY: "INR",
  TAX_RATE: 0.0,
  SHIPPING_CHARGE: 0,

  POINTS_MULTIPLIER: 0.02,
  POINTS_MIN: 1,

  SHIPPING_TIER_1: { threshold: 499, charge: 50 },
  SHIPPING_TIER_2: { threshold: 999, charge: 25 },
  SHIPPING_TIER_3: { threshold: Infinity, charge: 0 },
});

/* ================================================
   ORDER STATUS
================================================ */
export const ORDER_STATUS = Object.freeze({
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  RETURNED: "returned",
});

/* ================================================
   PAYMENT STATUS
================================================ */
export const PAYMENT_STATUS = Object.freeze({
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
});

/* ================================================
   PAYMENT METHODS
================================================ */
export const PAYMENT_GATEWAY = Object.freeze({
  RAZORPAY: "razorpay",
  COD: "cod",
});

/* ================================================
   CUSTOMER KEYS (BACKEND SAFE)
================================================ */
export const CUSTOMER = Object.freeze({
  USER_ID: "userId",
  NAME: "customerName",
  EMAIL: "customerEmail",
});

/* ================================================
   SHIPPING ADDRESS KEYS
================================================ */
export const SHIPPING_ADDRESS = Object.freeze({
  FULL_NAME: "fullName",
  PHONE: "phone",
  ADDRESS_LINE_1: "addressLine1",
  ADDRESS_LINE_2: "addressLine2",
  CITY: "city",
  STATE: "state",
  POSTAL_CODE: "postalCode",
  LANDMARK: "landmark",
  COUNTRY: "country",
});

/* ================================================
   RAZORPAY KEYS
================================================ */
export const RAZORPAY_META = Object.freeze({
  ORDER_ID: "razorpay_order_id",
  PAYMENT_ID: "razorpay_payment_id",
  SIGNATURE: "razorpay_signature",
});

/* ================================================
   ERROR MESSAGES (CLEANED)
================================================ */
export const ERROR_MESSAGES = Object.freeze({
  FULLNAME_REQUIRED: "Full name is required",
  EMAIL_REQUIRED: "Email is required",
  EMAIL_INVALID: "Invalid email format",
  PHONE_REQUIRED: "Phone is required",
  PHONE_INVALID: "Invalid phone number",
  ADDRESS_REQUIRED: "Address is required",
  CITY_REQUIRED: "City is required",
  STATE_REQUIRED: "State is required",
  POSTAL_CODE_REQUIRED: "Postal code is required",
  POSTAL_CODE_INVALID: "Invalid postal code",

  CART_EMPTY: "Cart is empty",
  INVALID_ITEMS: "Invalid cart items",

  ORDER_CREATION_FAILED: "Order creation failed",
  PAYMENT_GATEWAY_FAILED: "Payment gateway error",
  PAYMENT_ORDER_FAILED: "Payment order failed",
  PAYMENT_VERIFICATION_FAILED: "Payment verification failed",
  PAYMENT_CANCELLED: "Payment cancelled",

  NETWORK_ERROR: "Network error",
  CHECKOUT_FAILED: "Checkout failed",
});

/* ================================================
   UI MESSAGES
================================================ */
export const UI_MESSAGES = Object.freeze({
  CREATING_ORDER: "Creating order...",
  LOADING_PAYMENT: "Loading payment gateway...",
  PREPARING_PAYMENT: "Preparing payment...",
  VERIFYING_PAYMENT: "Verifying payment...",
});

/* ================================================
   STORE CONFIG
================================================ */
export const STORE_CONFIG = Object.freeze({
  NAME: import.meta.env.VITE_STORE_NAME || "Store",
  CURRENCY: "INR",
  SYMBOL: "₹",
});

/* ================================================
   RAZORPAY CONFIG
================================================ */
export const RAZORPAY_CONFIG = Object.freeze({
  SCRIPT_URL: "https://checkout.razorpay.com/v1/checkout.js",
  KEY_ID: import.meta.env.VITE_RAZORPAY_KEY_ID || "",
});

/* ================================================
   EMPTY ADDRESS
================================================ */
export const EMPTY_ADDRESS_FORM = Object.freeze({
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  landmark: "",
  email: "",
  country: "India",
});