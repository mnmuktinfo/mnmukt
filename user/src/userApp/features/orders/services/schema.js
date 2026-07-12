export const PAYMENT_METHODS = {
  RAZORPAY: "razorpay",
  COD: "cod",
};

export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  PAID: "PAID",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
};

export const ORDER_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  PROCESSING: "PROCESSING",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
};

export const VALIDATION_RULES = {
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 10,
  MAX_ITEMS: 50,

  PHONE_REGEX: /^[6-9]\d{9}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  POSTAL_CODE_REGEX: /^[1-9][0-9]{5}$/,
};

export const PRICING_DEFAULTS = {
  FREE_SHIPPING_THRESHOLD: 999,
  SHIPPING_CHARGE: 60,
  COD_CHARGE: 50,
  TAX_RATE: 0,
  CURRENCY: "INR",
};

export const ERROR_MESSAGES = {
  UNKNOWN_ERROR: "Something went wrong.",
  CART_EMPTY: "Cart is empty.",
  INVALID_ITEMS: "Invalid cart items.",

  CHECKOUT_FAILED: "Checkout failed.",

  ADDRESS_REQUIRED: "Address is required.",

  EMAIL_REQUIRED: "Email is required.",
  EMAIL_INVALID: "Invalid email address.",

  PHONE_REQUIRED: "Phone number is required.",
  PHONE_INVALID: "Invalid phone number.",

  POSTAL_CODE_REQUIRED: "Postal code is required.",
  POSTAL_CODE_INVALID: "Invalid postal code.",

  PAYMENT_GATEWAY_FAILED: "Unable to initialize payment.",
  PAYMENT_CANCELLED: "Payment cancelled.",
};

export const UI_MESSAGES = {
  CREATING_ORDER: "Creating order...",
  LOADING_PAYMENT: "Loading payment...",
  PREPARING_PAYMENT: "Preparing payment...",
  VERIFYING_PAYMENT: "Verifying payment...",
};

export const EMPTY_ADDRESS_FORM = {
  fullName: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  district: "",
  state: "",
  postalCode: "",
  country: "IN",
  landmark: "",
  tag: "Home",
};