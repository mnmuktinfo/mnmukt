"use strict";

/* =========================================================
   ORDER STATUS (SCHEMA ENUM)
========================================================= */

const ORDER_STATUS = Object.freeze({
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  PACKED: "packed",
  SHIPPED: "shipped",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  RETURNED: "returned",
  REFUNDED: "refunded",
  ON_HOLD: "on_hold",
});

/* =========================================================
   PAYMENT STATUS (SCHEMA ENUM)
========================================================= */

const PAYMENT_STATUS = Object.freeze({
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
});

/* =========================================================
   PAYMENT GATEWAY (SCHEMA ENUM)
========================================================= */

const PAYMENT_GATEWAY = Object.freeze({
  RAZORPAY: "razorpay",
  STRIPE: "stripe",
  PHONEPE: "phonepe",
  PAYTM: "paytm",
  CASHFREE: "cashfree",
  COD: "cod",
  BANK_TRANSFER: "bank_transfer",
  WHATSAPP: "whatsapp",
});

/* =========================================================
   ACTOR TYPE (TIMELINE)
========================================================= */

const ACTOR_TYPE = Object.freeze({
  SYSTEM: "system",
  ADMIN: "admin",
  CUSTOMER: "customer",
});

/* =========================================================
   ORDER SOURCE
========================================================= */

const ORDER_SOURCE = Object.freeze({
  WEB: "web",
  MOBILE: "mobile",
  WHATSAPP: "whatsapp",
  ADMIN: "admin",
  API: "api",
});

/* =========================================================
   ORDER FLAGS (IMMUTABLE - IMPORTANT FIX)
========================================================= */

const ORDER_FLAGS = Object.freeze({
  IS_COD: "isCOD",
  IS_PREPAID: "isPrepaid",
  IS_GIFT: "isGift",
  IS_BULK: "isBulk",
  IS_GUEST: "isGuest",
  REQUIRES_REVIEW: "requiresReview",
});

/* =========================================================
   CUSTOMER FIELD KEYS
========================================================= */

const CUSTOMER = Object.freeze({
  UID: "uid",
  NAME: "name",
  EMAIL: "email",
  PHONE: "phone",
});

/* =========================================================
   SHIPPING ADDRESS FIELD KEYS
========================================================= */

const SHIPPING_ADDRESS = Object.freeze({
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

/* =========================================================
   PAYMENT OBJECT KEYS
========================================================= */

const PAYMENT = Object.freeze({
  GATEWAY: "gateway",
  METHOD: "method",
  STATUS: "status",
  PAID_AT: "paidAt",
  AMOUNT_PAID: "amountPaid",
  CURRENCY: "currency",
  GATEWAY_META: "gatewayMeta",
});

/* =========================================================
   RAZORPAY META KEYS
========================================================= */

const RAZORPAY_META = Object.freeze({
  ORDER_ID: "razorpay_order_id",
  PAYMENT_ID: "razorpay_payment_id",
  SIGNATURE: "razorpay_signature",
});

/* =========================================================
   TIMELINE KEYS
========================================================= */

const TIMELINE = Object.freeze({
  STATUS: "status",
  MESSAGE: "message",
  ACTOR: "actor",
  META: "meta",
  CREATED_AT: "createdAt",
});

/* =========================================================
   SHIPMENT KEYS
========================================================= */

const SHIPMENT = Object.freeze({
  COURIER: "courier",
  TRACKING_NUMBER: "trackingNumber",
  TRACKING_URL: "trackingUrl",
  UPDATED_AT: "updatedAt",
});

/* =========================================================
   REFUND STATUS (SCHEMA ENUM)
========================================================= */

const REFUND_STATUS = Object.freeze({
  NONE: "none",
  INITIATED: "initiated",
  COMPLETED: "completed",
  FAILED: "failed",
});

/* =========================================================
   VALIDATION RULES
========================================================= */

const VALIDATION_RULES = Object.freeze({
  MIN_ITEMS: 1,
  MAX_ITEMS: 100,
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 100,

  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[6-9]\d{9}$/,
  POSTAL_CODE_REGEX: /^[1-9][0-9]{5}$/,

  AMOUNT_TOLERANCE: 1,
});

/* =========================================================
   EXPORT
========================================================= */

module.exports = {
  ORDER_STATUS,
  PAYMENT_STATUS,
  PAYMENT_GATEWAY,
  ACTOR_TYPE,
  ORDER_SOURCE,

  ORDER_FLAGS,
  CUSTOMER,
  SHIPPING_ADDRESS,
  PAYMENT,
  RAZORPAY_META,
  TIMELINE,
  SHIPMENT,
  REFUND_STATUS,
  VALIDATION_RULES,
};