"use strict";

const crypto = require("crypto");
const Order = require("../models/Order");
const logger = require("../utils/logger");

/**
 * Expected shape of ../constants (adjust names to match your actual file):
 * ORDER_STATUS:   { PENDING, CONFIRMED, SHIPPED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED, REFUNDED }
 * PAYMENT_STATUS: { PENDING, PAID, FAILED, REFUNDED }
 * PAYMENT_GATEWAY:{ RAZORPAY }   // COD removed — Razorpay is the only supported gateway
 * ACTOR_TYPE:     { SYSTEM, CUSTOMER, ADMIN }
 */
const {
  ORDER_STATUS,
  PAYMENT_STATUS,
  PAYMENT_GATEWAY,
  ACTOR_TYPE,
} = require("../constants");

/* =========================================================
   ASYNC WRAPPER — every route handler funnels errors to
   Express's error middleware instead of hanging/crashing.
========================================================= */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/* =========================================================
   ID HELPERS
========================================================= */
const isObjectId = (id) => typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);

async function findOrderByAnyId(id) {
  return Order.findOne({
    $or: [{ _id: isObjectId(id) ? id : null }, { orderId: id.toUpperCase() }],
    isDeleted: false,
  });
}

async function generateOrderId() {
  const date = new Date();
  const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;

  for (let attempt = 0; attempt < 5; attempt++) {
    const random = crypto.randomBytes(4).toString("hex").toUpperCase();
    const candidate = `ORD${datePart}${random}`;
    // eslint-disable-next-line no-await-in-loop
    const exists = await Order.exists({ orderId: candidate });
    if (!exists) return candidate;
  }
  throw new Error("Failed to generate a unique order ID after 5 attempts");
}

/* =========================================================
   PAYLOAD -> SCHEMA MAPPERS
========================================================= */
function mapItemsToSchema(items = []) {
  return items.map((item) => ({
    productId: item.productId,
    name: item.name,
    image: item.image,
    price: item.price,
    quantity: item.quantity,
    sku: item.sku,
    slug: item.slug || item.productId,
    selectedSize: item.variant?.size || "onesize",
    selectedColor: item.variant?.color || undefined,
  }));
}

function validateItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return "Order must contain at least one item";
  }
  for (const item of items) {
    if (!item.productId || !item.price || !item.quantity) {
      return "Each item requires productId, price, and quantity";
    }
    if (Number(item.price) <= 0 || Number(item.quantity) <= 0) {
      return "Item price and quantity must be positive";
    }
  }
  return null;
}

function mapPricingToSchema(pricing = {}) {
  return {
    subtotal: Number(pricing.subtotal || 0),
    discount: Number(
      (pricing.itemDiscount || 0) +
      (pricing.couponDiscount || 0) +
      (pricing.prepaidDiscount || 0) +
      (pricing.bulkDiscount || 0)
    ),
    tax: Number(pricing.taxAmount || 0),
    shipping: Number(pricing.shippingCharge || 0),
    total: Number(pricing.total || 0),
  };
}

// Razorpay-only now — gateway is always "razorpay", payment starts pending
// and is flipped to "paid" in payment.controller.js after verification.
function mapPaymentToSchema() {
  return {
    gateway: PAYMENT_GATEWAY.RAZORPAY,
    status: PAYMENT_STATUS.PENDING,
    amountPaid: 0,
    currency: "INR",
    gatewayMeta: {},
  };
}

/* =========================================================
   OWNERSHIP GUARD
   A logged-in user can only touch their own orders; guests are
   matched by email at the route level (getOrderStatus), never here.
========================================================= */
async function findOwnedOrder(idOrOrderId, req) {
  const query = { isDeleted: false };

  if (isObjectId(idOrOrderId)) {
    query._id = idOrOrderId;
  } else {
    query.orderId = idOrOrderId.toUpperCase();
  }

  const order = await Order.findOne(query);
  if (!order) return null;

  if (order.customer.uid && order.customer.uid !== req.user?.uid) {
    return "forbidden";
  }

  return order;
}

/* =========================================================
   CREATE ORDER (guest + logged-in)
   POST /api/v1/orders

   Razorpay-only, manual shipping: this endpoint only creates the order
   and marks it "awaiting payment". No courier is booked here — an admin
   adds shipment/tracking details later via PATCH /admin/:id/status once
   the order is actually ready to ship.
========================================================= */
async function createOrder(req, res) {
  const {
    customerEmail,
    customerName,
    items,
    shippingAddress,
    customerNote,
    pricing,
  } = req.body;

  const itemsError = validateItems(items);
  if (itemsError) {
    return res.status(400).json({ success: false, message: itemsError });
  }
  if (!shippingAddress?.fullName || !shippingAddress?.phone || !shippingAddress?.postalCode) {
    return res.status(400).json({ success: false, message: "Complete shipping address is required" });
  }

  // If a valid Bearer token was presented, optionalAuthMiddleware attaches req.user.
  // Anything the client claims about guest status is advisory only — the verified
  // token is what decides uid.
  const uid = req.user?.uid || null;
  const resolvedIsGuest = !uid;

  if (resolvedIsGuest && !customerEmail) {
    return res.status(400).json({ success: false, message: "Email is required for guest checkout" });
  }

  const orderId = await generateOrderId();

  const order = new Order({
    orderId,
    customer: {
      uid,
      name: customerName || shippingAddress.fullName,
      email: req.user?.email || customerEmail,
      phone: shippingAddress.phone,
    },
    items: mapItemsToSchema(items),
    shippingAddress,
    pricing: mapPricingToSchema(pricing),
    payment: mapPaymentToSchema(),
    customerNote,
    flags: { isGuest: resolvedIsGuest },
  });

  order.addTimeline(ORDER_STATUS.PENDING, "Order placed — awaiting payment", {
    type: ACTOR_TYPE.CUSTOMER,
    id: uid || "guest",
  });

  await order.save();

  return res.status(201).json({
    success: true,
    data: {
      orderId: order.orderId,
      orderStatus: order.orderStatus,
      paymentStatus: order.payment.status,
      trackingUrl: order.getTrackingUrl ? order.getTrackingUrl() : null,
    },
  });
}

/* =========================================================
   GET MY ORDERS (authenticated)
   GET /api/v1/orders
========================================================= */
async function getAllOrders(req, res) {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const { status } = req.query;

  const query = { "customer.uid": req.user.uid, isDeleted: false };
  if (status) {
    if (!Object.values(ORDER_STATUS).includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status filter" });
    }
    query.orderStatus = status;
  }

  const [orders, total] = await Promise.all([
    Order.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Order.countDocuments(query),
  ]);

  return res.json({
    success: true,
    data: orders,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

/* =========================================================
   GET SINGLE ORDER (authenticated, owner-only)
   GET /api/v1/orders/:id
========================================================= */
async function getOrderById(req, res) {
  const order = await findOwnedOrder(req.params.id, req);

  if (!order) return res.status(404).json({ success: false, message: "Order not found" });
  if (order === "forbidden") return res.status(403).json({ success: false, message: "Access denied" });

  return res.json({ success: true, data: order });
}

/* =========================================================
   UPDATE ORDER (authenticated, owner-only)
   Restricted to fields that are safe post-creation.
   PATCH /api/v1/orders/:id
========================================================= */
async function updateOrder(req, res) {
  const order = await findOwnedOrder(req.params.id, req);

  if (!order) return res.status(404).json({ success: false, message: "Order not found" });
  if (order === "forbidden") return res.status(403).json({ success: false, message: "Access denied" });

  const editableStatuses = [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED];
  if (!editableStatuses.includes(order.orderStatus)) {
    return res.status(400).json({
      success: false,
      message: `Order can no longer be edited (status: ${order.orderStatus})`,
    });
  }

  if (req.body.shippingAddress) {
    // Once a shipment has been recorded against this order, editing the
    // address here would silently desync from what the courier has on file.
    if (order.shipments?.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Shipping address can't be changed after a shipment has been created. Please contact support.",
      });
    }
    order.shippingAddress = { ...order.shippingAddress.toObject(), ...req.body.shippingAddress };
  }
  if (req.body.customerNote !== undefined) {
    order.customerNote = req.body.customerNote;
  }

  order.addTimeline(order.orderStatus, "Order details updated by customer", {
    type: ACTOR_TYPE.CUSTOMER,
    id: req.user.uid,
  });

  await order.save();

  return res.json({ success: true, data: order });
}

/* =========================================================
   CANCEL ORDER (authenticated, owner-only)
   PATCH /api/v1/orders/:id/cancel

   Shipping is manual, so there's no courier API to notify here — if a
   shipment has already gone out, cancellation is flagged for the admin
   to handle with the courier directly rather than attempted automatically.
========================================================= */
async function cancelOrder(req, res) {
  const order = await findOwnedOrder(req.params.id, req);

  if (!order) return res.status(404).json({ success: false, message: "Order not found" });
  if (order === "forbidden") return res.status(403).json({ success: false, message: "Access denied" });

  const nonCancellable = [
    ORDER_STATUS.SHIPPED,
    ORDER_STATUS.OUT_FOR_DELIVERY,
    ORDER_STATUS.DELIVERED,
    ORDER_STATUS.CANCELLED,
    ORDER_STATUS.REFUNDED,
  ];
  if (nonCancellable.includes(order.orderStatus)) {
    return res.status(400).json({
      success: false,
      message: `Order cannot be cancelled (status: ${order.orderStatus})`,
    });
  }

  if (order.shipments?.length > 0) {
    order.flags.requiresReview = true;
  }

  order.orderStatus = ORDER_STATUS.CANCELLED;
  order.addTimeline(ORDER_STATUS.CANCELLED, req.body?.reason || "Cancelled by customer", {
    type: ACTOR_TYPE.CUSTOMER,
    id: req.user.uid,
  });

  await order.save();

  return res.json({ success: true, data: { orderId: order.orderId, orderStatus: order.orderStatus } });
}

/* =========================================================
   GUEST + AUTH ORDER STATUS
   GET /api/v1/orders/status/:orderId?email=...
========================================================= */
async function getOrderStatus(req, res) {
  const { orderId } = req.params;

  let order;
  if (req.user?.uid) {
    order = await Order.findOne({ orderId: orderId.toUpperCase(), "customer.uid": req.user.uid, isDeleted: false });
  } else {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required for guest lookup" });
    }
    order = await Order.findGuestOrder(orderId, email);
  }

  if (!order) return res.status(404).json({ success: false, message: "Order not found" });

  return res.json({
    success: true,
    data: {
      orderId: order.orderId,
      orderStatus: order.orderStatus,
      shipments: order.shipments,
      timeline: order.timeline,
      pricing: order.pricing,
    },
  });
}

/* =========================================================
   ADMIN: GET ALL ORDERS
   GET /api/v1/orders/admin
========================================================= */
async function getAdminOrders(req, res) {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const { status } = req.query;

  const query = { isDeleted: false };
  if (status) {
    if (!Object.values(ORDER_STATUS).includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status filter" });
    }
    query.orderStatus = status;
  }

  const [orders, total] = await Promise.all([
    Order.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Order.countDocuments(query),
  ]);

  return res.json({
    success: true,
    data: orders,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

/* =========================================================
   ADMIN: GET SINGLE ORDER
   GET /api/v1/orders/admin/:id
========================================================= */
async function getAdminOrder(req, res) {
  const order = await findOrderByAnyId(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });
  return res.json({ success: true, data: order });
}

/* =========================================================
   ADMIN: UPDATE ORDER STATUS (+ manual shipment entry)
   PATCH /api/v1/orders/admin/:id/status

   This is the ONLY place shipment/tracking data enters an order now that
   shipping is manual. courier/trackingNumber/trackingUrl are already
   validated by orderSchemas.updateStatus (zod) — this used to validate
   them and then silently drop them. Now it actually saves them.
========================================================= */
async function updateOrderStatus(req, res) {
  const { orderStatus, status, message, courier, trackingNumber, trackingUrl, adminNote } = req.body;
  const nextStatus = orderStatus || status; // support either key name from the client

  if (!nextStatus || !Object.values(ORDER_STATUS).includes(nextStatus)) {
    return res.status(400).json({ success: false, message: "Invalid order status" });
  }

  const order = await findOrderByAnyId(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });

  // If the admin supplied any shipment info, record it as a shipment entry.
  if (courier || trackingNumber || trackingUrl) {
    order.shipments.push({
      courier: courier || "",
      trackingNumber: trackingNumber || "",
      trackingUrl: trackingUrl || "",
    });
  }

  if (adminNote !== undefined) {
    order.adminNote = adminNote;
  }

  order.addTimeline(nextStatus, message || `Status updated to ${nextStatus}`, {
    type: ACTOR_TYPE.ADMIN,
    id: req.user.uid,
    name: req.user.name || "",
  });

  await order.save();

  return res.json({
    success: true,
    data: { orderId: order.orderId, orderStatus: order.orderStatus, shipments: order.shipments },
  });
}

/* =========================================================
   ADMIN: SOFT DELETE
   DELETE /api/v1/orders/admin/:id
========================================================= */
async function deleteOrder(req, res) {
  const order = await findOrderByAnyId(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });

  order.isDeleted = true;
  await order.save();

  return res.json({ success: true, data: { orderId: order.orderId } });
}

module.exports = {
  createOrder: asyncHandler(createOrder),
  getAllOrders: asyncHandler(getAllOrders),
  getOrderById: asyncHandler(getOrderById),
  updateOrder: asyncHandler(updateOrder),
  cancelOrder: asyncHandler(cancelOrder),
  updateOrderStatus: asyncHandler(updateOrderStatus),
  deleteOrder: asyncHandler(deleteOrder),
  getAdminOrders: asyncHandler(getAdminOrders),
  getAdminOrder: asyncHandler(getAdminOrder),
  getOrderStatus: asyncHandler(getOrderStatus),
};