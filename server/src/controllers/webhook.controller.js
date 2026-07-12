"use strict";

const logger = require("../utils/logger");
const Order = require("../models/Order");
const { sendOrderConfirmationEmail } = require("../services/resend.email");
const { ORDER_STATUS, PAYMENT_STATUS, ACTOR_TYPE } = require("../constants");
const { CASHFREE_PAYMENT_STATUS } = require("../utils/paymentStatus");

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const handleCashfreeWebhook = asyncHandler(async (req, res) => {
  // req.rawBodyString is set by verifyCashfreeWebhook middleware
  const event = JSON.parse(req.rawBodyString);

  if (event.type !== "PAYMENT_SUCCESS_WEBHOOK") {
    // Acknowledge other webhooks
    return res.status(200).json({ success: true });
  }

  const payment = event.data?.payment;
  const orderDetails = event.data?.order;
  const cashfreeOrderId = orderDetails?.order_id;
  
  if (!cashfreeOrderId) return res.status(200).json({ success: true });

  const order = await Order.findOne({
    orderId: cashfreeOrderId,
    isDeleted: false,
  });

  if (!order || order.payment?.status === PAYMENT_STATUS.PAID) {
    return res.status(200).json({ success: true }); // already handled or not ours
  }

  // Update payment and order status
  order.payment.status = PAYMENT_STATUS.PAID;
  order.payment.paidAt = new Date();
  order.payment.amountPaid = payment.payment_amount || order.pricing?.total || 0;
  order.payment.gatewayMeta = {
    ...(order.payment.gatewayMeta || {}),
    cf_payment_id: payment.cf_payment_id,
  };
  order.markModified("payment");

  order.addTimeline(ORDER_STATUS.CONFIRMED, "Payment captured via Cashfree webhook", {
    type: ACTOR_TYPE.SYSTEM,
    id: "cashfree-webhook",
  });

  await order.save();

  sendOrderConfirmationEmail(order).catch((err) => {
    logger("ERROR", `Email sending failed (webhook): ${err.message}`);
  });

  return res.status(200).json({ success: true });
});

module.exports = {
  handleCashfreeWebhook,
};
