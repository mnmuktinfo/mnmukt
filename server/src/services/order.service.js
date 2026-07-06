'use strict';

const Order = require('../models/order.model');
const { ORDER_STATUS, isValidOrderTransition } = require('../constants/orderStatus');
const { PAYMENT_STATUS } = require('../constants/paymentStatus');
const { ApiError } = require('../utils/ApiError');
const { getProductsByIds } = require('./firebaseProduct.service');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const { ROLES } = require('../constants/roles');
const { logger } = require('../utils/logger');

const FLAT_SHIPPING_FEE = 0;
const TAX_RATE = 0;

/**
 * =========================
 * PRICING (SERVER AUTHORITATIVE)
 * =========================
 */
async function calculatePricing(items) {
  const productMap = await getProductsByIds(items.map((i) => i.productId));

  const resolvedItems = items.map((item) => {
    const product = productMap.get(item.productId);

    if (!product) {
      throw ApiError.badRequest(`Product not found: ${item.productId}`);
    }

    const unitPrice = Number(product.price || 0);
    const quantity = Number(item.quantity || 1);
    const subtotal = Number((unitPrice * quantity).toFixed(2));

    return {
      productId: product.id,
      variantId: item.variantId || undefined, // 👈 Syncs with frontend strict mode

      name: product.name,
      quantity,

      price: unitPrice, // 👈 Changed from 'unitPrice' to 'price' to match your Mongoose OrderItemSchema
      subtotal,

      image: product.image || null,

      // 👈 FIXED: Syncs exactly with frontend payload structure
      variant: item.variant ? {
        size: item.variant.size || null,
        color: item.variant.color || null,
      } : null,
    };
  });

  const itemsTotal = Number(
    resolvedItems.reduce((sum, i) => sum + i.subtotal, 0).toFixed(2)
  );

  const tax = Number((itemsTotal * TAX_RATE).toFixed(2));
  const shippingFee = FLAT_SHIPPING_FEE;
  const discount = 0;

  const totalAmount = Number(
    (itemsTotal + shippingFee + tax - discount).toFixed(2)
  );

  return {
    resolvedItems,
    pricing: {
      itemsTotal,
      shippingFee,
      discount,
      tax,
      totalAmount,
      currency: 'INR',
    },
  };
}

/**
 * =========================
 * CREATE ORDER
 * =========================
 */
async function createOrder({
  user,
  idempotencyKey,
  items,
  guestInfo,
  shippingAddress,
  notes,
  payment // 👈 FIXED: Accept payment from the controller
}) {
  const existing = await Order.findOne({ idempotencyKey }).lean();

  if (existing) {
    logger.info({ idempotencyKey }, 'Idempotent order replay');
    return existing;
  }

  // 👈 FIXED: Derive isGuest safely from the user object
  const isGuest = !user; 

  if (isGuest && (!guestInfo?.email || !guestInfo?.phone)) {
    throw ApiError.badRequest('Guest orders require email and phone');
  }

  const { resolvedItems, pricing } = await calculatePricing(items);

  const orderPayload = {
    idempotencyKey,
    
    // Auth logic
    userUid: isGuest ? null : user.uid,
    guestInfo: isGuest ? guestInfo : undefined,

    items: resolvedItems,
    pricing,
    shippingAddress,

    orderStatus: ORDER_STATUS.PENDING,

    statusHistory: [
      {
        status: ORDER_STATUS.PENDING,
        changedBy: isGuest ? 'guest' : user.uid,
      },
    ],

    // 👈 FIXED: Pass through the payment method from the frontend!
    payment: {
      status: PAYMENT_STATUS.PENDING,
      method: payment?.method || 'RAZORPAY', 
    },

    notes,
  };

  try {
    return await Order.create(orderPayload);
  } catch (err) {
    if (err.code === 11000) {
      return await Order.findOne({ idempotencyKey }).lean();
    }
    throw err;
  }
}

// ... rest of your file (getOrderById, etc.) remains exactly the same!

/**
 * =========================
 * GET ORDER
 * =========================
 */
async function getOrderById({ orderId, requester }) {
  const order = await Order.findById(orderId);

  if (!order) throw ApiError.notFound('Order not found');

  const isOwner = requester?.uid && order.userUid === requester.uid;
  const isAdmin = requester?.role === ROLES.ADMIN;

  if (!isOwner && !isAdmin) {
    throw ApiError.forbidden('You do not have access to this order');
  }

  return order;
}

/**
 * =========================
 * USER ORDERS
 * =========================
 */
async function listOrdersForUser({ userUid, query }) {
  const { page, limit, skip } = getPagination(query);

  const [orders, total] = await Promise.all([
    Order.find({ userUid })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments({ userUid }),
  ]);

  return {
    orders,
    meta: buildPaginationMeta({ page, limit, total }),
  };
}

/**
 * =========================
 * ADMIN ORDERS
 * =========================
 */
async function listOrdersForAdmin({ query }) {
  const { page, limit, skip } = getPagination(query);

  const filter = {};
  if (query.status) filter.orderStatus = query.status;
  if (query.paymentStatus) filter['payment.status'] = query.paymentStatus;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ]);

  return {
    orders,
    meta: buildPaginationMeta({ page, limit, total }),
  };
}

/**
 * =========================
 * UPDATE ORDER STATUS
 * =========================
 */
async function updateOrderStatus({ orderId, toStatus, changedBy, note }) {
  const order = await Order.findById(orderId);

  if (!order) throw ApiError.notFound('Order not found');

  const fromStatus = order.orderStatus;

  if (!isValidOrderTransition(fromStatus, toStatus)) {
    throw ApiError.conflict(
      `Cannot transition order from "${fromStatus}" to "${toStatus}"`
    );
  }

  order.orderStatus = toStatus;

  if (!Array.isArray(order.statusHistory)) {
    order.statusHistory = [];
  }

  order.statusHistory.push({
    status: toStatus,
    changedBy,
    note,
  });

  await order.save();

  return order;
}

/**
 * =========================
 * PAYMENT HELPER
 * =========================
 */
async function markOrderConfirmedAfterPayment(orderId, changedBy = 'system') {
  return updateOrderStatus({
    orderId,
    toStatus: ORDER_STATUS.CONFIRMED,
    changedBy,
    note: 'Payment confirmed',
  });
}

async function getSharedOrderDetails(shareToken) {
  const order = await Order.findOne({ shareToken }).lean();
  
 if (!order) {
  throw ApiError.notFound("Invalid tracking link."); // 👈 CHANGED THIS
}

  // 🛡️ SECURITY: Strip out PII (Address, Phone, Email)
  // We only return the items, pricing, and timeline/status.
  return {
    _id: order._id,
    createdAt: order.createdAt,
    orderStatus: order.orderStatus,
    statusHistory: order.statusHistory,
    items: order.items, // Depending on privacy, you might even hide prices here
    customerName: order.shippingAddress?.fullName?.split(' ')[0], // Just their First Name
  };
}

module.exports = {
  createOrder,
  getOrderById,
  listOrdersForUser,
  listOrdersForAdmin,
  updateOrderStatus,
  markOrderConfirmedAfterPayment,
  getSharedOrderDetails, // 👈 ADD THIS HERE
};