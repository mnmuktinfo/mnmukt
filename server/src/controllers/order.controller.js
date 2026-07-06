'use strict';

const { asyncHandler } = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const { HTTP_STATUS } = require('../constants/httpStatus');
const orderService = require('../services/order.service');

const createOrder = asyncHandler(async (req, res) => {
  const {
    idempotencyKey,
    items,
    guestInfo,
    shippingAddress,
    notes,
    pricing,
    payment, 
  } = req.body;

  const order = await orderService.createOrder({
    user: req.user,              // Secure! Relies on token, not frontend payload
    idempotencyKey,
    items,
    guestInfo,
    shippingAddress,
    notes,
    pricing,
    payment, // 👈 2. Pass it to your database service
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

  return sendSuccess(res, {
    message: 'Order fetched',
    data: order,
  });
});

const listMyOrders = asyncHandler(async (req, res) => {
  const { orders, meta } = await orderService.listOrdersForUser({
    userUid: req.user.uid,
    query: req.query,
  });

  return sendSuccess(res, {
    message: 'Orders fetched',
    data: orders,
    meta,
  });
});

const listAllOrders = asyncHandler(async (req, res) => {
  const { orders, meta } = await orderService.listOrdersForAdmin({
    query: req.query,
  });

  return sendSuccess(res, {
    message: 'Orders fetched',
    data: orders,
    meta,
  });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { toStatus, note } = req.body;

  const order = await orderService.updateOrderStatus({
    orderId: req.params.orderId,
    toStatus,              // must match ORDER_STATUS enum
    changedBy: req.user?.uid || 'system',
    note,
  });

  return sendSuccess(res, {
    message: 'Order status updated',
    data: order,
  });
});

const getSharedOrder = asyncHandler(async (req, res) => {
  // Extract the shareToken from the URL params
  const { shareToken } = req.params;

  // Call the new service function we built earlier
  const order = await orderService.getSharedOrderDetails(shareToken);

  return sendSuccess(res, {
    message: 'Shared order fetched successfully',
    data: order,
  });
});

module.exports = { createOrder, getOrder, listMyOrders, listAllOrders, updateOrderStatus,getSharedOrder };