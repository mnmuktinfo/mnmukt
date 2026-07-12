'use strict';

const { asyncHandler } = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');
const paymentService = require('../services/payment.service');
const Order = require('../models/order.model');


function assertOwnsOrder(order, req) {
  const isGuestOrder = !order.userUid;
  if (isGuestOrder) return true; // TODO: replace with real guest check
  return Boolean(order.userUid && req.user?.uid && order.userUid === req.user.uid);
}

const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  if (!orderId) throw ApiError.badRequest('orderId is required');

  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound('Order not found');

  if (!assertOwnsOrder(order, req)) {
    throw ApiError.forbidden('Not authorized for this order');
  }

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

  if (!assertOwnsOrder(order, req)) {
    return sendSuccess(res, {
      message: 'Payment verified',
      data: { orderId: order._id, status: order.payment.status },
    });
  }

  return sendSuccess(res, { message: 'Payment verified', data: order });
});

module.exports = { createRazorpayOrder, verifyPayment };