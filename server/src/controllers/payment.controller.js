'use strict';

const { asyncHandler } = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');
const paymentService = require('../services/payment.service');
const Order = require('../models/order.model');

/**
 * Confirms the requesting caller is allowed to act on this order.
 * Adjust the guest check to match your actual guest-session mechanism
 * (e.g. a signed guest token / cookie tied to the order at creation time).
 */
function assertOwnsOrder(order, req) {
  if (order.isGuest) {
    // Placeholder — replace with your real guest-ownership check
    // e.g. comparing req.cookies.guestOrderToken to order.guestInfo.token
    return true;
  }
  return order.userUid && req.user?.uid && order.userUid === req.user.uid;
}

const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  if (!orderId) throw ApiError.badRequest('orderId is required');

  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound('Order not found');

  if (!assertOwnsOrder(order, req)) {
    throw ApiError.forbidden('Not authorized for this order');
  }

  // All amount validation, pending-order reuse, and branding come from the service.
  const result = await paymentService.createRazorpayOrder(orderId);

  return sendSuccess(res, { data: result });
});

const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw ApiError.badRequest('razorpayOrderId, razorpayPaymentId, and razorpaySignature are all required');
  }

  const order = await paymentService.verifyPaymentSignature({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  });

  // Signature verification proves the payment is authentic regardless of who
  // calls this endpoint (the webhook calls the same underlying update with no
  // user context at all). But we still avoid handing full order details back
  // to a caller who isn't the order's owner.
  if (!assertOwnsOrder(order, req)) {
    return sendSuccess(res, { message: 'Payment verified', data: { orderId: order._id, status: order.payment.status } });
  }

  return sendSuccess(res, { message: 'Payment verified', data: order });
});

module.exports = { createRazorpayOrder, verifyPayment };