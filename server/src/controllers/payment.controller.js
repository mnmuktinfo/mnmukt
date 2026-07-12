"use strict";

const logger = require("../utils/logger");
const Order = require("../models/Order");
const cashfreeService = require("../services/cashfree.service");
const { CASHFREE_PAYMENT_STATUS } = require("../utils/paymentStatus");
const { ORDER_STATUS, PAYMENT_STATUS, PAYMENT_GATEWAY, ACTOR_TYPE } = require("../constants");

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/* =========================================================
   SHARED HELPERS
========================================================= */
function checkOrderAccess(order, req, customerEmail) {
  if (req.isAuthenticated && req.user?.uid) {
    if (order.customer.uid !== req.user.uid) {
      logger("WARN", "Unauthorized payment attempt", { orderId: order.orderId, userId: req.user.uid });
      return { code: 403, message: "Access denied" };
    }
    return null;
  }

  if (order.flags?.isGuest) {
    if (!customerEmail) return { code: 400, message: "Email required for guest payment" };
    if (order.customer.email.toLowerCase() !== customerEmail.toLowerCase()) {
      return { code: 403, message: "Email mismatch" };
    }
    return null;
  }

  return { code: 401, message: "Authentication required" };
}

/* =========================================================
   CREATE CASHFREE ORDER
========================================================= */
const createCashfreeOrder = asyncHandler(async (req, res) => {
  const { orderId, customerEmail } = req.body;

  if (!orderId) {
    return res.status(400).json({ success: false, message: "Order ID is required" });
  }

  const order = await Order.findOne({ orderId: orderId.toUpperCase(), isDeleted: false });
  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  const authError = checkOrderAccess(order, req, customerEmail);
  if (authError) return res.status(authError.code).json({ success: false, message: authError.message });

  if (order.payment?.status === PAYMENT_STATUS.PAID) {
    return res.status(400).json({ success: false, message: "Order already paid" });
  }
  if ([ORDER_STATUS.CANCELLED, ORDER_STATUS.REFUNDED].includes(order.orderStatus)) {
    return res.status(400).json({ success: false, message: `Cannot pay for ${order.orderStatus} order` });
  }

  const expectedAmount = Number(order.pricing?.total || 0);
  if (!expectedAmount || expectedAmount <= 0) {
    logger("ERROR", `Order ${orderId} has invalid pricing.total: ${expectedAmount}`);
    return res.status(500).json({ success: false, message: "Order pricing is invalid; contact support" });
  }

  const cashfreeData = await cashfreeService.createCashfreeOrder({
    orderId,
    orderAmount: expectedAmount,
    orderCurrency: "INR",
    customerDetails: {
      customerId: order.customer.uid || "guest",
      customerName: order.customer.name,
      customerEmail: order.customer.email,
      customerPhone: order.customer.phone
    },
  });

  if (!cashfreeData?.paymentSessionId) {
    throw new Error("Cashfree order creation failed");
  }

  order.payment = order.payment || {};
  order.payment.gateway = PAYMENT_GATEWAY.CASHFREE || "cashfree";
  order.payment.status = PAYMENT_STATUS.PENDING;
  order.payment.gatewayMeta = {
    ...(order.payment.gatewayMeta || {}),
    cashfree_order_id: cashfreeData.cfOrderId,
    payment_session_id: cashfreeData.paymentSessionId,
  };
  order.markModified("payment");
  await order.save();

  logger("INFO", "Cashfree order created", { orderId, paymentSessionId: cashfreeData.paymentSessionId });

  return res.json({
    success: true,
    orderId: orderId,
    payment_session_id: cashfreeData.paymentSessionId,
  });
});

/* =========================================================
   GET PAYMENT STATUS
========================================================= */
const getPaymentStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  if (!orderId) {
    return res.status(400).json({ success: false, message: "Order ID is required" });
  }

  const order = await Order.findOne({ orderId: orderId.toUpperCase(), isDeleted: false });
  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  // Fetch status directly from Cashfree as requested
  const statusData = await cashfreeService.fetchCashfreeOrderStatus(orderId);
  const paymentStatus = statusData.orderStatus; // ACTIVE, PAID, FAILED, etc.

  return res.json({
    success: true,
    paymentStatus: paymentStatus,
  });
});

module.exports = {
  createCashfreeOrder,
  getPaymentStatus,
};