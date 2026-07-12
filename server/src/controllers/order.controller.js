'use strict';

const { asyncHandler } = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const { HTTP_STATUS } = require('../constants/httpStatus');
const orderService = require('../services/order.service');

const createOrder = asyncHandler(async (req, res) => {
  const { idempotencyKey, items, guestInfo, shippingAddress, notes, payment } = req.body;
  // NOTE: client-sent `pricing` is intentionally not accepted here at all —
  // the service always recomputes it server-side. Your validator should
  // reject an unknown `pricing` key in the request body outright.

  const order = await orderService.createOrder({
    user: req.user,
    idempotencyKey,
    items,
    guestInfo,
    shippingAddress,
    notes,
    payment,
  });

  return sendSuccess(res, {
    statusCode: HTTP_STATUS.CREATED,
    message: 'Order created',
    data: order,
  });
});

const getOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById({
    orderId: req.params.orderId,
    requester: req.user || null,
  });
  return sendSuccess(res, { message: 'Order fetched', data: order });
});

const listMyOrders = asyncHandler(async (req, res) => {
  const { orders, meta } = await orderService.listOrdersForUser({
    userUid: req.user.uid,
    query: req.query,
  });
  return sendSuccess(res, { message: 'Orders fetched', data: orders, meta });
});

const listAllOrders = asyncHandler(async (req, res) => {
  const { orders, meta } = await orderService.listOrdersForAdmin({ query: req.query });
  return sendSuccess(res, { message: 'Orders fetched', data: orders, meta });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { toStatus, note } = req.body;

  const order = await orderService.updateOrderStatus({
    orderId: req.params.orderId,
    toStatus,
    changedBy: req.user?.uid || 'system',
    note,
  });

  return sendSuccess(res, { message: 'Order status updated', data: order });
});

const getSharedOrder = asyncHandler(async (req, res) => {
  const { shareToken } = req.params;
  const order = await orderService.getSharedOrderDetails(shareToken);
  return sendSuccess(res, { message: 'Shared order fetched successfully', data: order });
});

module.exports = { createOrder, getOrder, listMyOrders, listAllOrders, updateOrderStatus, getSharedOrder };