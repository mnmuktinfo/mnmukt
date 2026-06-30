"use strict";

const mongoose = require("mongoose");
const { Schema } = mongoose;

/* =========================================================
   CONSTANTS
========================================================= */

const ORDER_STATUS = Object.freeze([
  "pending",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "returned",
  "refunded",
  "on_hold",
]);

const PAYMENT_GATEWAY = Object.freeze([
  "razorpay",
  "stripe",
  "phonepe",
  "paytm",
  "cashfree",
  "cod",
  "bank_transfer",
  "whatsapp",
]);

const ACTOR_TYPE = Object.freeze(["system", "admin", "customer"]);

/* =========================================================
   SUB SCHEMAS
========================================================= */

const timelineEntrySchema = new Schema(
  {
    status: { type: String, required: true },
    message: { type: String, default: "" },

    actor: {
      type: {
        type: String,
        enum: ACTOR_TYPE,
        default: "system",
      },
      id: { type: String, default: "" },
      name: { type: String, default: "" },
    },

    meta: { type: Schema.Types.Mixed, default: {} },

    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const shipmentSchema = new Schema(
  {
    courier: { type: String, default: "" },
    trackingNumber: { type: String, default: "" },
    trackingUrl: { type: String, default: "" },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

/* =========================================================
   ORDER ITEM SCHEMA - STRICT FIELD VALIDATION
========================================================= */

const orderItemSchema = new Schema(
  {
    // ✅ Required fields (must come from cart/ProductCard)
    productId: {
      type: String,
      required: [true, "Product ID is required"],
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
    },
    image: {
      type: String,
      required: [true, "Product image is required"],
    },
    unitPrice: {
      type: Number,
      required: [true, "Unit price is required"],
      min: [0, "Price cannot be negative"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    sku: {
      type: String,
      required: [true, "SKU is required"],
    },
    slug: {
      type: String,
      required: [true, "Product slug is required"],
    },

    // ✅ Optional fields (with fallbacks)
    originalPrice: {
      type: Number,
      default: function () {
        return this.unitPrice; // ✅ Fallback to unitPrice if not provided
      },
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: String,
      default: "General",
    },
    selectedSize: {
      type: String,
      default: "onesize",
    },
    selectedColor: String,

    // Metadata
    lineTotal: {
      type: Number,
      default: function () {
        return (this.unitPrice || 0) * (this.quantity || 0);
      },
    },
  },
  { _id: true, timestamps: false }
);

/* =========================================================
   MAIN ORDER SCHEMA - WITH STRICT DATA VALIDATION
========================================================= */

const orderSchema = new Schema(
  {
    orderId: {
      type: String,
      required: [true, "Order ID is required"],
      unique: true,
      index: true,
      uppercase: true,
    },

    // ✅ GUEST ORDER MARKER
    flags: {
      type: {
        isCOD: { type: Boolean, default: false },
        isPrepaid: { type: Boolean, default: false },
        isGift: { type: Boolean, default: false },
        isBulk: { type: Boolean, default: false },
        isGuest: { type: Boolean, default: false },
        requiresReview: { type: Boolean, default: false },
      },
      default: {},
    },

    // ✅ Customer info (supports both auth and guest)
    customer: {
      uid: {
        type: String,
        default: null,
        index: true,
      },
      name: {
        type: String,
        required: [true, "Customer name is required"],
        trim: true,
      },
      email: {
        type: String,
        required: [true, "Customer email is required"],
        lowercase: true,
        index: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Invalid email"],
      },
      phone: {
        type: String,
        match: [/^\+?[\d\s-()]{10,}$/, "Invalid phone number"],
      },
    },

    // Display ID (for customer reference)
    displayId: Number,

    orderStatus: {
      type: String,
      enum: ORDER_STATUS,
      default: "pending",
      index: true,
    },

    // Order source (web, mobile, admin, etc.)
    source: {
      type: String,
      enum: ["web", "mobile", "whatsapp", "admin", "api"],
      default: "web",
    },

    // ✅ ORDERED ITEMS - WITH VALIDATION
    items: {
      type: [orderItemSchema],
      required: [true, "Order must have at least one item"],
      validate: [
        (items) => items.length > 0,
        "Order must contain items",
      ],
    },

    // Shipping address
    shippingAddress: {
      type: {
        fullName: String,
        phone: String,
        addressLine1: String,
        addressLine2: String,
        city: String,
        state: String,
        postalCode: String,
        country: String,
      },
      default: {},
    },

    // ✅ PRICING BREAKDOWN - CALCULATED FROM ITEMS
    pricing: {
      type: {
        subtotal: {
          type: Number,
          default: 0,
          min: [0, "Subtotal cannot be negative"],
        },
        discount: {
          type: Number,
          default: 0,
          min: [0, "Discount cannot be negative"],
        },
        tax: {
          type: Number,
          default: 0,
          min: [0, "Tax cannot be negative"],
        },
        shipping: {
          type: Number,
          default: 0,
          min: [0, "Shipping cannot be negative"],
        },
        total: {
          type: Number,
          required: [true, "Total is required"],
          min: [0, "Total cannot be negative"],
        },
      },
      required: [true, "Pricing is required"],
    },

    // ✅ PAYMENT INFO
    payment: {
      type: {
        gateway: {
          type: String,
          enum: PAYMENT_GATEWAY,
          default: "cod",
        },
        method: String,
        status: {
          type: String,
          enum: ["pending", "paid", "failed", "refunded"],
          default: "pending",
        },
        paidAt: Date,
        amountPaid: {
          type: Number,
          default: 0,
          min: [0, "Amount cannot be negative"],
        },
        currency: {
          type: String,
          default: "INR",
          uppercase: true,
        },
        // Gateway metadata (Razorpay, Stripe, etc.)
        gatewayMeta: {
          type: Schema.Types.Mixed,
          default: {},
        },
      },
      default: {},
    },

    // Refund info
    refund: {
      type: {
        status: {
          type: String,
          enum: ["none", "initiated", "completed", "failed"],
          default: "none",
        },
        amount: {
          type: Number,
          default: 0,
          min: [0, "Refund amount cannot be negative"],
        },
        reason: String,
        initiatedAt: Date,
        completedAt: Date,
      },
      default: {},
    },

    // Shipments (tracking info)
    shipments: {
      type: [shipmentSchema],
      default: [],
    },

    // Timeline of events
    timeline: {
      type: [timelineEntrySchema],
      default: [],
    },

    // Notes
    customerNote: { type: String, default: "" },
    adminNote: { type: String, default: "" },

    // Soft delete
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/* =========================================================
   INDEXES (for efficient queries)
========================================================= */

// Find user's orders
orderSchema.index({ "customer.uid": 1, createdAt: -1 });

// Find guest orders by email
orderSchema.index({ "customer.email": 1, createdAt: -1 });

// Find orders by status
orderSchema.index({ orderStatus: 1, createdAt: -1 });

// Find orders by payment status
orderSchema.index({ "payment.status": 1, createdAt: -1 });

// Soft delete queries
orderSchema.index({ isDeleted: 1 });

// Payment gateway orders (for reconciliation)
orderSchema.index({ "payment.gateway": 1, createdAt: -1 });

/* =========================================================
   METHODS
========================================================= */

/**
 * VALIDATE ITEMS BEFORE SAVE
 * ✅ Ensures all required item fields are present
 */
orderSchema.methods.validateItems = function () {
  const requiredFields = [
    "productId",
    "name",
    "image",
    "unitPrice",
    "quantity",
    "sku",
    "slug",
  ];

  const invalidItems = this.items.filter((item) => {
    const missing = requiredFields.filter(
      (field) =>
        item[field] === undefined || item[field] === null || item[field] === ""
    );
    return missing.length > 0;
  });

  if (invalidItems.length > 0) {
    throw new Error(
      `❌ Order validation failed: ${invalidItems.length} item(s) have missing fields`
    );
  }

  return true;
};

/**
 * CALCULATE PRICING FROM ITEMS
 * ✅ Automatically calculates subtotal based on items
 */
orderSchema.methods.calculatePricing = function () {
  const subtotal = this.items.reduce((sum, item) => {
    return sum + (item.unitPrice || 0) * (item.quantity || 0);
  }, 0);

  this.pricing.subtotal = subtotal;

  // Total = subtotal - discount + tax + shipping
  this.pricing.total =
    (this.pricing.subtotal || 0) -
    (this.pricing.discount || 0) +
    (this.pricing.tax || 0) +
    (this.pricing.shipping || 0);

  return this.pricing;
};

/**
 * ADD TIMELINE ENTRY
 * Used for all order status changes
 */
orderSchema.methods.addTimeline = function (
  status,
  message,
  actor = {},
  meta = {}
) {
  if (!this.timeline) {
    this.timeline = [];
  }

  this.timeline.push({
    status,
    message,
    actor: {
      type: actor.type || "system",
      id: actor.id || "",
      name: actor.name || "",
    },
    meta,
    createdAt: new Date(),
  });

  // Update main order status
  this.orderStatus = status;
};

/**
 * CHECK IF ORDER IS GUEST
 */
orderSchema.methods.isGuestOrder = function () {
  return this.flags?.isGuest || !this.customer?.uid;
};

/**
 * GET PAYMENT URL FOR GUEST TRACKING
 */
orderSchema.methods.getTrackingUrl = function () {
  return `/order-tracking/${this.orderId}?email=${encodeURIComponent(
    this.customer.email
  )}`;
};

/* =========================================================
   PRE SAVE HOOKS
========================================================= */

/**
 * Validate items and calculate pricing before save
 */
orderSchema.pre("save", function () {
  // ✅ Validate all items have required fields ONLY for new orders or if items are modified
  if (this.isNew || this.isModified("items")) {
    this.validateItems();
  }

  // ✅ Ensure timeline exists
  if (!this.timeline) {
    this.timeline = [];
  }

  // ✅ Ensure flags exist
  if (!this.flags) {
    this.flags = {};
  }

  // For new orders, set flags based on customer
  if (this.isNew) {
    this.flags = {
      isCOD: this.payment?.gateway === "cod",
      isPrepaid: this.payment?.gateway !== "cod",
      isGift: this.flags?.isGift || false,
      isBulk: this.flags?.isBulk || false,
      isGuest: !this.customer?.uid, // ✅ Auto-detect guest
      requiresReview: this.flags?.requiresReview || false,
    };

    // Add initial timeline entry
    if (this.timeline.length === 0) {
      this.timeline.push({
        status: "pending",
        message: "Order created",
        actor: { type: "system" },
        createdAt: new Date(),
      });
    }
  }

  // ✅ Calculate pricing from items
  this.calculatePricing();

  // ✅ Ensure email is lowercase
  if (this.customer?.email) {
    this.customer.email = this.customer.email.toLowerCase();
  }
});

/* =========================================================
   STATICS
========================================================= */

/**
 * Find guest order by orderId and email
 */
orderSchema.statics.findGuestOrder = function (orderId, email) {
  return this.findOne({
    orderId: orderId.toUpperCase(),
    "customer.email": email.toLowerCase(),
    isDeleted: false,
  });
};

/**
 * Find user's order
 */
orderSchema.statics.findUserOrder = function (orderId, userId) {
  return this.findOne({
    orderId: orderId.toUpperCase(),
    "customer.uid": userId,
    isDeleted: false,
  });
};

/**
 * Count orders by customer (for both guest and auth)
 */
orderSchema.statics.countByCustomer = function (customerId, isGuest = false) {
  if (isGuest) {
    return this.countDocuments({
      "customer.email": customerId.toLowerCase(),
      isDeleted: false,
    });
  } else {
    return this.countDocuments({
      "customer.uid": customerId,
      isDeleted: false,
    });
  }
};

/* =========================================================
   MODEL EXPORT
========================================================= */

module.exports = mongoose.model("Order", orderSchema);