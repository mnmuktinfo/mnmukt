'use strict';

const mongoose = require('mongoose');
const crypto = require('crypto');

const { ORDER_STATUS, isValidOrderTransition } = require('../constants/orderStatus');
const { PAYMENT_STATUS } = require('../constants/paymentStatus');

const { Schema } = mongoose;

/* ========================= VARIANT ========================= */
const VariantSchema = new Schema(
  {
    size: {
      type: String,
      trim: true,
      default: "",
    },

    color: {
      name: {
        type: String,
        default: "",
      },
      hex: {
        type: String,
        default: "",
      },
      image: {
        type: String,
        default: "",
      },
    },
  },
  { _id: false }
);

/* ========================= ORDER ITEM ========================= */
const OrderItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    variantId: { type: String },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String },
variant: { type: VariantSchema, default: () => ({}) },  },
  { _id: false }
);

/* ========================= ADDRESS ========================= */
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
    tag: { type: String },
  },
  { _id: false }
);

/* ========================= SHIPPING (manual entry) ========================= */
const ShippingSchema = new Schema(
  {
    provider: { type: String, default: 'shiprocket' },
    shiprocketOrderId: { type: String },
    shiprocketShipmentId: { type: String },
    awbCode: { type: String, index: true },
    courierName: { type: String },
    trackingUrl: { type: String },
    pickedUpAt: { type: Date },
    estimatedDeliveryDate: { type: Date },
    deliveredAt: { type: Date },
    lastTrackedStatus: { type: String },
    lastTrackedAt: { type: Date },
  },
  { _id: false }
);

/* ========================= PAYMENT ========================= */
const PaymentSchema = new Schema(
  {
    status: { type: String, enum: Object.values(PAYMENT_STATUS), default: PAYMENT_STATUS.PENDING },
    method: { type: String, enum: ['razorpay', 'cod'] },

    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String, select: false },

    paidAt: { type: Date },

    refundId: { type: String },
    refundedAmount: { type: Number, default: 0, min: 0 },
    refundedAt: { type: Date },
    refundReason: { type: String },

    // Belt-and-suspenders per-order check. Primary webhook dedup is the
    // WebhookEvent collection (unique index on eventId) — see that model.
    processedWebhookEventIds: { type: [String], default: () => [], select: false },
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

/* ========================= MAIN ORDER ========================= */
const OrderSchema = new Schema(
  {
    idempotencyKey: { type: String, required: true, unique: true, index: true },

    shareToken: {
      type: String,
      unique: true,
      index: true,
      default: () => crypto.randomUUID(),
    },

    userUid: { type: String, default: null, index: true },

    guestInfo: {
      name: { type: String },
      email: { type: String },
      phone: { type: String },
    },

    items: {
      type: [OrderItemSchema],
      required: true,
      validate: (v) => Array.isArray(v) && v.length > 0,
    },

    pricing: {
  itemsTotal: { type: Number, required: true, min: 0 },
  shippingFee: { type: Number, default: 0, min: 0 },
  codFee: { type: Number, default: 0, min: 0 }, // ✅ Add this
  discount: { type: Number, default: 0, min: 0 },
  tax: { type: Number, default: 0, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'INR' },
},

    shippingAddress: { type: AddressSchema, required: true },

    orderStatus: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
      index: true,
    },

    cancelledAt: { type: Date },
    cancellationReason: { type: String },

    payment: { type: PaymentSchema, default: () => ({}) },
    shipping: { type: ShippingSchema, default: () => ({}) },

    statusHistory: { type: [StatusHistorySchema], default: () => [] },

    notes: { type: String },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
  }
);

/* ========================= INDEXES ========================= */
OrderSchema.index({ userUid: 1, createdAt: -1 });
OrderSchema.index({ 'guestInfo.email': 1, createdAt: -1 });

/* =========================
   STATUS TRANSITION GUARD
   Backstop only — the real protection is Order.applyStatusTransition()
   below, which does an atomic findOneAndUpdate and is what every caller
   in this codebase actually uses. This hook can only validate a direct
   `order.orderStatus = x; order.save()` mutation IF the caller has set
   `order._previousOrderStatus` beforehand; Mongoose doesn't expose the
   pre-change value reliably on its own. If nothing set it, we log and
   let the save proceed rather than pretend we validated it.
========================= */
OrderSchema.pre('save', async function () {
  if (this.isNew) {
    this.statusHistory.push({
      status: this.orderStatus,
      changedBy: this._statusChangedBy || 'system',
      note: this._statusChangeNote,
      changedAt: new Date(),
    });
    return;
  }

  if (this.isModified('orderStatus')) {
    if (this._previousOrderStatus) {
      if (!isValidOrderTransition(this._previousOrderStatus, this.orderStatus)) {
        throw new Error(
          `Illegal order status transition: ${this._previousOrderStatus} -> ${this.orderStatus}`
        );
      }
    }

    if (this.orderStatus === ORDER_STATUS.CANCELLED) {
      this.cancelledAt ??= new Date();
    }

    this.statusHistory.push({
      status: this.orderStatus,
      changedBy: this._statusChangedBy || 'system',
      note: this._statusChangeNote,
      changedAt: new Date(),
    });
  }
});

/* =========================
   SAFE STATUS TRANSITION HELPER (preferred over direct mutation + save)
========================= */
OrderSchema.statics.applyStatusTransition = async function (
  orderId,
  newStatus,
  { changedBy, note } = {}
) {
  const order = await this.findById(orderId);
  if (!order) throw new Error('Order not found');

  const previous = order.orderStatus;
  if (!isValidOrderTransition(previous, newStatus)) {
    throw new Error(`Illegal order status transition: ${previous} -> ${newStatus}`);
  }

 
  const setFields = { orderStatus: newStatus };
  if (newStatus === ORDER_STATUS.CANCELLED) {
    setFields.cancelledAt = new Date();
  }

  const updated = await this.findOneAndUpdate(
    { _id: orderId, orderStatus: previous },
    {
      $set: setFields,
      $push: {
        statusHistory: {
          status: newStatus,
          changedBy: changedBy || 'system',
          note,
          changedAt: new Date(),
        },
      },
    },
    { new: true }
  );

  if (!updated) {
    throw new Error('Order status changed concurrently — please retry');
  }

  return updated;
};

/* =========================
   SAFE PUBLIC PROJECTION for shareToken tracking
========================= */
OrderSchema.statics.findPublicByShareToken = function (shareToken) {
  return this.findOne({ shareToken }).select(
    'orderStatus items pricing.totalAmount pricing.codFee pricing.currency shipping.courierName shipping.trackingUrl shipping.awbCode shipping.estimatedDeliveryDate shipping.deliveredAt createdAt'
  );
};

module.exports = mongoose.model('Order', OrderSchema);