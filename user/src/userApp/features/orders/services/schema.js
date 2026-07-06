export const PAYMENT_METHODS = {
  RAZORPAY: "RAZORPAY", // 👈 Changed to uppercase
  COD: "COD",
};

export const PAYMENT_STATUS = {
  PENDING: "PENDING", // 👈 Changed to uppercase
  PAID: "PAID",
  FAILED: "FAILED",
};

export const ORDER_STATUS = {
  PENDING: "PENDING", // 👈 Changed to uppercase
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
  PHONE_MIN_DIGITS: 10,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  POSTAL_CODE_REGEX: /^[1-9][0-9]{5}$/,
};

export const PRICING_DEFAULTS = {
  FREE_SHIPPING_THRESHOLD: 999,
  SHIPPING_CHARGE: 60,
  TAX_RATE: 0,
  CURRENCY: "INR",
};

export const ERROR_MESSAGES = {
  UNKNOWN_ERROR: "Something went wrong.",
  CART_EMPTY: "Cart is empty.",
  INVALID_ITEMS: "Invalid cart items.",
  CHECKOUT_FAILED: "Checkout failed.",
  EMAIL_REQUIRED: "Email is required.",
  EMAIL_INVALID: "Invalid email.",
  PHONE_REQUIRED: "Phone number is required.",
  PHONE_INVALID: "Invalid phone number.",
  POSTAL_CODE_REQUIRED: "Postal code required.",
  POSTAL_CODE_INVALID: "Invalid postal code.",
  ADDRESS_REQUIRED: "Address required.",
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
  landmark: "",
  tag: "Home",
};