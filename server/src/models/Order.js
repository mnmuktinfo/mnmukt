// "use strict";

// const mongoose = require("mongoose");
// const { Schema } = mongoose;

// /* =========================================================
//    CONSTANTS
// ========================================================= */

// const ORDER_STATUS = Object.freeze([
//   "pending",
//   "confirmed",
//   "processing",
//   "shipped",
//   "out_for_delivery",
//   "delivered",
//   "cancelled",
//   "returned",
//   "refunded",
// ]);

// const PAYMENT_GATEWAY = Object.freeze([
//   "razorpay",
//   "stripe",
//   "phonepe",
//   "cod",
// ]);

// // Round to 2 decimals — avoids floating point drift (e.g. 499.999999999994)
// // which can otherwise mismatch payment gateway amounts.
// const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

// /* =========================================================
//    SUB SCHEMAS
//    Kept intentionally lean — these are arrays that grow per order,
//    so every extra field multiplies with items/shipments count.
// ========================================================= */

// const orderItemSchema = new Schema(
//   {
//     productId: { type: String, required: [true, "Product ID is required"] },
//     name: { type: String, required: [true, "Product name is required"] },
//     image: { type: String, required: [true, "Product image is required"] },
//     sku: { type: String, required: [true, "SKU is required"] },
//     slug: { type: String, required: [true, "Product slug is required"] },
//     price: {
//       type: Number,
//       required: [true, "Price is required"],
//       min: [0, "Price cannot be negative"],
//     },
//     quantity: {
//       type: Number,
//       required: [true, "Quantity is required"],
//       min: [1, "Quantity must be at least 1"],
//     },
//     selectedSize: { type: String, default: "onesize" },
//     selectedColor: { type: String, default: "" },
//   },
//   { _id: true, timestamps: false }
// );

// const shipmentSchema = new Schema(
//   {
//     courier: { type: String, default: "" },
//     awb: { type: String, default: "" },
//     trackingNumber: { type: String, default: "" },
//     trackingUrl: { type: String, default: "" },
//     estimatedDelivery: { type: Date, default: null },
//   },
//   { _id: false }
// );

// const timelineEntrySchema = new Schema(
//   {
//     status: { type: String, required: true },
//     message: { type: String, default: "" },

//     // Who triggered this status change — system / admin / customer.
//     // Kept as Mixed instead of a strict sub-schema so controllers can pass
//     // { type, id, name } without you having to touch this file every time
//     // a new actor shape is needed.
//     actor: { type: Schema.Types.Mixed, default: {} },

//     createdAt: { type: Date, default: Date.now },
//   },
//   { _id: false }
// );

// /* =========================================================
//    MAIN ORDER SCHEMA
// ========================================================= */

// const orderSchema = new Schema(
//   {
//     orderId: {
//       type: String,
//       required: [true, "Order ID is required"],
//       unique: true, // unique: true already creates an index
//       uppercase: true,
//       trim: true,
//     },

//     // Order status is the single source of truth for order state
//     orderStatus: {
//       type: String,
//       enum: ORDER_STATUS,
//       default: "pending",
//       index: true,
//     },

//     // Guest vs logged-in customer support
//     customer: {
//       uid: { type: String, default: null },
//       name: { type: String, required: [true, "Customer name is required"], trim: true },
//       email: {
//         type: String,
//         required: [true, "Customer email is required"],
//         lowercase: true,
//         trim: true,
//         match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Invalid email"],
//       },
//       phone: {
//         type: String,
//         required: [true, "Customer phone is required"],
//         match: [/^\+?[\d\s-()]{10,}$/, "Invalid phone number"],
//       },
//     },

//     // Flags used across the controllers for guest tracking and manual
//     // review flagging (e.g. when a third-party service call fails).
//     flags: {
//       isGuest: { type: Boolean, default: false },
//       requiresReview: { type: Boolean, default: false },
//     },

//     items: {
//       type: [orderItemSchema],
//       required: [true, "Order must have at least one item"],
//       validate: [(items) => items.length > 0, "Order must contain items"],
//     },
// customerNote: { type: String, default: "" },
// adminNote: { type: String, default: "" },
//     // Shipping address — required because you can't fulfil a physical
//     // order without one. Drop `required` only if you also sell
//     // digital-only products through this same schema.
//     shippingAddress: {
//       fullName: { type: String, required: [true, "Recipient name is required"] },
//       phone: { type: String, required: [true, "Recipient phone is required"] },
//       addressLine1: { type: String, required: [true, "Address is required"] },
//       addressLine2: { type: String, default: "" },
//       city: { type: String, required: [true, "City is required"] },
//       state: { type: String, required: [true, "State is required"] },
//       postalCode: { type: String, required: [true, "Postal code is required"] },
//       country: { type: String, default: "India" },
//     },

//     // Pricing is auto-calculated from items in pre('validate') below —
//     // callers don't need to pass subtotal/total manually.
//     pricing: {
//       subtotal: { type: Number, default: 0, min: 0 },
//       discount: { type: Number, default: 0, min: 0 },
//       tax: { type: Number, default: 0, min: 0 },
//       shipping: { type: Number, default: 0, min: 0 },
//       total: { type: Number, required: true, min: 0 },
//     },

//     payment: {
//       gateway: { type: String, enum: PAYMENT_GATEWAY, default: "cod" },

//       status: {
//         type: String,
//         enum: ["pending", "paid", "failed", "refunded"],
//         default: "pending",
//         index: true,
//       },

//       transactionId: { type: String, default: "", index: true },

//       amountPaid: { type: Number, default: 0, min: 0 },

//       paidAt: { type: Date, default: null },

//       currency: { type: String, default: "INR", uppercase: true },

//       // Gateway-specific data: razorpay_order_id, razorpay_payment_id,
//       // razorpay_signature, webhook payload snippets, etc. Needed because
//       // verifyRazorpayPayment / the webhook handler compare
//       // payment.gatewayMeta.razorpay_order_id against the incoming request —
//       // without this field that check always fails.
//       gatewayMeta: { type: Schema.Types.Mixed, default: {} },
//     },

//     shipments: { type: [shipmentSchema], default: [] },
//     timeline: { type: [timelineEntrySchema], default: [] },

//     isDeleted: { type: Boolean, default: false, index: true },
//   },
//   { timestamps: true }
// );

// /* =========================================================
//    INDEXES — only the ones production queries actually need
// ========================================================= */

// orderSchema.index({ "customer.uid": 1, createdAt: -1 });     // user's orders
// orderSchema.index({ "customer.email": 1, createdAt: -1 });   // guest lookup
// orderSchema.index({ isDeleted: 1, orderStatus: 1, createdAt: -1 }); // admin listing

// /* =========================================================
//    METHODS
// ========================================================= */

// orderSchema.methods.calculatePricing = function () {
//   const subtotal = this.items.reduce(
//     (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
//     0
//   );

//   this.pricing.subtotal = round2(subtotal);

//   this.pricing.total = round2(
//     Math.max(
//       0,
//       (this.pricing.subtotal || 0) -
//         (this.pricing.discount || 0) +
//         (this.pricing.tax || 0) +
//         (this.pricing.shipping || 0)
//     )
//   );

//   return this.pricing;
// };

// /**
//  * Adds a timeline entry and updates orderStatus.
//  * `actor` is optional — pass { type, id, name } to record who/what
//  * triggered the change (system / admin / customer). Skips the push if
//  * the status hasn't actually changed since the last entry.
//  */
// orderSchema.methods.addTimeline = function (status, message = "", actor = {}) {
//   const last = this.timeline[this.timeline.length - 1];

//   if (last?.status === status) return;

//   this.timeline.push({
//     status,
//     message,
//     actor,
//     createdAt: new Date(),
//   });

//   this.orderStatus = status;
// };

// orderSchema.methods.isGuestOrder = function () {
//   return this.flags?.isGuest || !this.customer?.uid;
// };

// /* =========================================================
//    PRE VALIDATE HOOK
//    Runs BEFORE required-field validation — pricing.total is
//    `required`, so it must be computed here, not in pre('save')
//    (which runs after validation and would be too late).
// ========================================================= */

// orderSchema.pre("validate", function () {
//   if (this.isNew || this.isModified("items")) {
//     this.calculatePricing();
//   }

//   if (this.isNew && this.timeline.length === 0) {
//     this.timeline.push({ status: "pending", message: "Order created" });
//   }

//   if (this.isNew) {
//     this.flags = this.flags || {};
//     if (this.flags.isGuest === undefined) {
//       this.flags.isGuest = !this.customer?.uid;
//     }
//   }
// });

// /* =========================================================
//    STATICS
// ========================================================= */

// orderSchema.statics.findGuestOrder = function (orderId, email) {
//   return this.findOne({
//     orderId: orderId.toUpperCase(),
//     "customer.email": email.toLowerCase(),
//     isDeleted: false,
//   });
// };

// orderSchema.statics.findUserOrder = function (orderId, userId) {
//   return this.findOne({
//     orderId: orderId.toUpperCase(),
//     "customer.uid": userId,
//     isDeleted: false,
//   });
// };

// /* =========================================================
//    MODEL EXPORT
// ========================================================= */

// module.exports = mongoose.model("Order", orderSchema);

/**
 * models/order.model.js
 *
 * ⚠️ REFERENCE FILE — you already have a production Order model.
 * Do NOT blindly overwrite your existing file with this one if it has
 * fields you depend on elsewhere (e.g. invoices, delivery tracking).
 *
 * Instead, merge the `payment` sub-schema and `status` enum values below
 * into your existing Order schema. Those are the only additions
 * order.service.js / payment.controller.js / webhook.controller.js need:
 *
 *   status: { type: String, enum: [...], default: 'PENDING_PAYMENT' }
 *   payment: PaymentSubSchema  (see below)
 *
 * This full file is provided so the feature is runnable end-to-end
 * out of the box for review/testing purposes.
 */

import mongoose from 'mongoose';

const { Schema } = mongoose;

const AddressSchema = new Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, required: true, default: 'India' },
  },
  { _id: false }
);

const OrderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

// Everything Cashfree-related lives inside this single sub-document so it
// is trivial to see, at a glance, exactly what payment-gateway data we
// persist alongside an order.
const PaymentSubSchema = new Schema(
  {
    provider: { type: String, default: 'cashfree' },
    cfOrderId: { type: String, index: true },
    paymentSessionId: { type: String },
    status: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED'],
      default: 'PENDING',
    },
    cfPaymentId: { type: String, index: true },
    paymentMethod: { type: String },
    paidAt: { type: Date },
    failureReason: { type: String },
    idempotencyKey: { type: String },
    rawWebhookEvent: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [OrderItemSchema], required: true, validate: (v) => v.length > 0 },
    address: { type: AddressSchema, required: true },

    itemsTotal: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, required: true, default: 0, min: 0 },
    taxTotal: { type: Number, required: true, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },

    status: {
      type: String,
      enum: ['PENDING_PAYMENT', 'PAID', 'FAILED', 'CANCELLED', 'PROCESSING', 'SHIPPED', 'DELIVERED'],
      default: 'PENDING_PAYMENT',
      index: true,
    },

    payment: { type: PaymentSubSchema, default: () => ({}) },

    flags: {
      stockShortageOnFulfillment: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);