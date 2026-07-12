'use strict';

const Order = require('../models/order.model');
const { ORDER_STATUS } = require('../constants/orderStatus');
const { PAYMENT_STATUS } = require('../constants/paymentStatus');
const { ApiError } = require('../utils/ApiError');
const { getProductsByIds } = require('./firebaseProduct.service');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const { ROLES } = require('../constants/roles');
const { logger } = require('../utils/logger');
const { PRICING_DEFAULTS } = require('../constants/pricing'); 

const VALID_PAYMENT_METHODS = ['razorpay', 'cod'];

async function calculatePricing(items, paymentMethod = 'razorpay') {
  console.log("⏳ [Service] calculatePricing: Fetching products from Firebase...");
  
  // 🚨 TRACER: If it hangs here, Firebase is failing to connect.
  const productMap = await getProductsByIds(items.map((i) => i.productId));
  
  console.log("✅ [Service] calculatePricing: Firebase returned products successfully.");

  const resolvedItems = items.map((item) => {
    const product = productMap.get(item.productId);
    if (!product) {
      throw ApiError.badRequest(`Product not found: ${item.productId}`);
    }

    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw ApiError.badRequest(`Invalid quantity for product ${item.productId}`);
    }

    return {
      productId: product.id,
      variantId: item.variantId || undefined,
      name: product.name,
      quantity,
      price: product.price,
      image: product.image || null,
      variant: item.variant ? { size: item.variant.size || null, color: item.variant.color || null } : null,
    };
  });

  const itemsTotal = Number(
    resolvedItems.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2)
  );

  const tax = Number((itemsTotal * PRICING_DEFAULTS.TAX_RATE).toFixed(2));
  const shippingFee = itemsTotal >= PRICING_DEFAULTS.FREE_SHIPPING_THRESHOLD 
                    ? 0 
                    : PRICING_DEFAULTS.SHIPPING_CHARGE;
  const codFee = paymentMethod.toLowerCase() === 'cod' ? PRICING_DEFAULTS.COD_CHARGE : 0;
  const discount = 0;

  const totalAmount = Number((itemsTotal + shippingFee + tax + codFee - discount).toFixed(2));

  return {
    resolvedItems,
    pricing: { itemsTotal, shippingFee, codFee, discount, tax, totalAmount, currency: 'INR' },
  };
}

async function createOrder({ user, idempotencyKey, items, guestInfo, shippingAddress, notes, payment, pricing: uiPricing }) {
  console.log("🚀 [Service] createOrder: Starting...");
  const requesterUid = user ? user.uid : null;
  const requestedMethod = (payment?.method || 'razorpay').toLowerCase();

  console.log("⏳ [Service] createOrder: Checking idempotency key in DB...");
  const existing = await Order.findOne({ idempotencyKey });

  if (existing) {
    console.log("✅ [Service] createOrder: Idempotent order found, skipping creation.");
    const sameOwner = existing.userUid === requesterUid;
    const sameGuestEmail =
      requesterUid === null &&
      existing.userUid === null &&
      existing.guestInfo?.email === guestInfo?.email;

    if (!sameOwner && !sameGuestEmail) {
      throw ApiError.conflict('Idempotency key already used by a different requester');
    }

    if (
      existing.orderStatus === ORDER_STATUS.PENDING &&
      existing.payment.status === PAYMENT_STATUS.PENDING &&
      existing.payment.method !== requestedMethod
    ) {
      existing.payment.method = requestedMethod;
      await existing.save();
    }

    logger.info({ idempotencyKey }, "Idempotent order replay");
    return existing;
  }

  const isGuest = !user;
  if (isGuest && (!guestInfo?.email || !guestInfo?.phone)) {
    throw ApiError.badRequest('Guest orders require email and phone');
  }

  if (!VALID_PAYMENT_METHODS.includes(requestedMethod)) {
    throw ApiError.badRequest(`Invalid payment method: ${requestedMethod}`);
  }

  let finalPricing, resolvedItems;

  console.log("⏳ [Service] createOrder: Resolving items and pricing...");
  if (uiPricing) {
    finalPricing = uiPricing;
    const pricingRes = await calculatePricing(items, requestedMethod);
    resolvedItems = pricingRes.resolvedItems;
  } else {
    const pricingRes = await calculatePricing(items, requestedMethod);
    resolvedItems = pricingRes.resolvedItems;
    finalPricing = pricingRes.pricing;
  }

  const orderPayload = {
    idempotencyKey,
    userUid: isGuest ? null : user.uid,
    guestInfo: isGuest ? guestInfo : undefined,
    items: resolvedItems,
    pricing: finalPricing,
    shippingAddress,
    orderStatus: ORDER_STATUS.PENDING,
    payment: { status: PAYMENT_STATUS.PENDING, method: requestedMethod },
    notes,
  };

  console.log("⏳ [Service] createOrder: Attempting to save new order to MongoDB...");
  try {
    // 🚨 TRACER: If it hangs here, MongoDB validation or a pre-save hook is failing silently.
    const newOrder = await Order.create(orderPayload);
    console.log(`✅ [Service] createOrder: Successfully created order ID: ${newOrder._id}`);
    return newOrder;
  } catch (err) {
    console.error("❌ [Service] createOrder: Error saving to DB:", err.message);
    if (err.code === 11000) {
      return await Order.findOne({ idempotencyKey }).lean();
    }
    throw err;
  }
}

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

async function listOrdersForUser({ userUid, query }) {
  const { page, limit, skip } = getPagination(query);

  const [orders, total] = await Promise.all([
    Order.find({ userUid }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments({ userUid }),
  ]);

  return { orders, meta: buildPaginationMeta({ page, limit, total }) };
}

async function listOrdersForAdmin({ query }) {
  const { page, limit, skip } = getPagination(query);

  const filter = {};
  if (query.status) filter.orderStatus = query.status;
  if (query.paymentStatus) filter['payment.status'] = query.paymentStatus;

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);

  return { orders, meta: buildPaginationMeta({ page, limit, total }) };
}

async function updateOrderStatus({ orderId, toStatus, changedBy, note }) {
  try {
    return await Order.applyStatusTransition(orderId, toStatus, { changedBy, note });
  } catch (err) {
    if (/Illegal order status transition/.test(err.message)) {
      throw ApiError.conflict(err.message);
    }
    if (/concurrently/.test(err.message)) {
      throw ApiError.conflict('This order was just updated elsewhere — please retry');
    }
    throw err;
  }
}

async function markOrderConfirmedAfterPayment(orderId, changedBy = 'system') {
  return updateOrderStatus({
    orderId,
    toStatus: ORDER_STATUS.CONFIRMED,
    changedBy,
    note: 'Payment confirmed',
  });
}

async function getSharedOrderDetails(shareToken) {
  const order = await Order.findPublicByShareToken(shareToken).lean();
  if (!order) {
    throw ApiError.notFound('Invalid tracking link.');
  }
  return order;
}

module.exports = {
  createOrder,
  getOrderById,
  listOrdersForUser,
  listOrdersForAdmin,
  updateOrderStatus,
  markOrderConfirmedAfterPayment,
  getSharedOrderDetails,
};