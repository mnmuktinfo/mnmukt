'use strict';

const mongoose = require('mongoose');
const crypto = require('crypto'); // 👈 ADDED: Required for generating the share token

const { ORDER_STATUS } = require('../constants/orderStatus');
const { PAYMENT_STATUS } = require('../constants/paymentStatus');

const { Schema } = mongoose;

/* =========================
   VARIANT STRUCTURE
========================= */
const VariantSchema = new Schema(
  {
    size: {
      label: { type: String },   // e.g. "M", "XL"
      value: { type: String },   // normalized value
    },
    color: {
      name: { type: String },    // "Red"
      hex: { type: String },     // "#ff0000"
    },
  },
  { _id: false }
);

/* =========================
   ORDER ITEM
========================= */
const OrderItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    variantId: { type: String },

    name: { type: String, required: true },

    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },

    image: { type: String },

    // 👇 full variant snapshot (IMPORTANT)
    variant: { type: VariantSchema, default: null },
  },
  { _id: false }
);

/* =========================
   SHIPPING ADDRESS
========================= */
const AddressSchema = new Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },

    addressLine1: { type: String, required: true },
    addressLine2: { type: String },

    city: { type: String, required: true },
    district: { type: String },
    state: { type: String, required: true },

    postalCode: { type: String, required: true },
    country: { type: String, default: 'IN' },

    landmark: { type: String },
    tag: { type: String }, // Home / Office
  },
  { _id: false }
);


const ShippingSchema = new Schema(
  {
    provider: { type: String, default: 'shiprocket' },

    // Shiprocket's own identifiers (from their dashboard/API response)
    shiprocketOrderId: { type: String },
    shiprocketShipmentId: { type: String },

    // What you'll actually type in manually after booking the shipment
    awbCode: { type: String },
    courierName: { type: String }, // e.g. "Delhivery", "Xpressbees"

    // Derived, not stored redundantly if you can help it — see helper below
    trackingUrl: { type: String },

    pickedUpAt: { type: Date },
    estimatedDeliveryDate: { type: Date },
    deliveredAt: { type: Date },

    // Optional: last status Shiprocket reported, if you ever poll/check manually
    lastTrackedStatus: { type: String },
    lastTrackedAt: { type: Date },
  },
  { _id: false }
);
/* =========================
   PAYMENT
========================= */
const PaymentSchema = new Schema(
  {
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },

    method: { type: String }, // razorpay / cod

    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String, select: false },

    paidAt: { type: Date },
  },
  { _id: false }
);

const StatusHistorySchema = new Schema(
  {
    status: { type: String, required: true },
    changedBy: { type: String },
    note: { type: String },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

/* =========================
   MAIN ORDER SCHEMA
========================= */
const OrderSchema = new Schema(
  {
    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // 👇 ADDED: The unique token for public sharing
    shareToken: {
      type: String,
      unique: true,
      index: true,
      default: () => crypto.randomUUID(), 
    },

    /* -------------------------
       USER / GUEST MODEL
    ------------------------- */
    userUid: { type: String, default: null, index: true },

    guestInfo: {
      name: { type: String },
      email: { type: String },
      phone: { type: String },
    },

    /* -------------------------
       ITEMS
    ------------------------- */
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: (v) => Array.isArray(v) && v.length > 0,
    },

    /* -------------------------
       PRICING (server trusted)
    ------------------------- */
    pricing: {
      itemsTotal: { type: Number, required: true },
      shippingFee: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      totalAmount: { type: Number, required: true },
      currency: { type: String, default: 'INR' },
    },

    /* -------------------------
       SHIPPING
    ------------------------- */
    shippingAddress: {
      type: AddressSchema,
      required: true,
    },

    /* -------------------------
       STATUS
    ------------------------- */
    orderStatus: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
      index: true,
    },

    payment: {
      type: PaymentSchema,
      default: () => ({}),
    },

    shipping: {
  type: ShippingSchema,
  default: () => ({}),
},
    statusHistory: {
      type: [StatusHistorySchema],
      default: () => [],
    },
  },
  { timestamps: true }
);

/* =========================
   INDEXES
========================= */
OrderSchema.index({ userUid: 1, createdAt: -1 });
OrderSchema.index({ 'guestInfo.email': 1, createdAt: -1 });

module.exports = mongoose.model('Order', OrderSchema);