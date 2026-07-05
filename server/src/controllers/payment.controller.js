"use strict";

const crypto = require("crypto");
const logger = require("../utils/logger");

const Order = require("../models/Order");
const razorpayService = require("../services/razorpay.service");
const { sendOrderConfirmationEmail } = require("../services/resend.email");

const {
  ORDER_STATUS,
  PAYMENT_STATUS,
  PAYMENT_GATEWAY,
  ACTOR_TYPE,
} = require("../constants");

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

function verifySignature(payload, signature, secret) {
  if (!signature || !secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  const expectedBuf = Buffer.from(expected, "utf8");
  const givenBuf = Buffer.from(signature, "utf8");
  if (expectedBuf.length !== givenBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, givenBuf);
}

/* =========================================================
   CREATE RAZORPAY ORDER
========================================================= */
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { orderId, customerEmail, amount: clientAmount } = req.body;

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

  // The charge amount is always derived from the server-side order total —
  // never trust a client-supplied `amount` to decide what gets charged.
  const expectedAmount = Number(order.pricing?.total || 0);
  if (!expectedAmount || expectedAmount <= 0) {
    logger("ERROR", `Order ${orderId} has invalid pricing.total: ${expectedAmount}`);
    return res.status(500).json({ success: false, message: "Order pricing is invalid; contact support" });
  }
  if (clientAmount !== undefined && Math.abs(expectedAmount - Number(clientAmount)) > 1) {
    // Not fatal — the client value is never used for the charge — but worth
    // knowing about, since it usually means a stale cart or client tampering.
    logger("WARN", "Client amount does not match server total", { orderId, clientAmount, expectedAmount });
  }

  const amountInPaise = Math.round(expectedAmount * 100);

  const razorpayOrder = await razorpayService.createOrder({
    amount: amountInPaise,
    currency: "INR",
    receipt: orderId,
    notes: {
      orderId,
      customerId: order.customer.uid || "guest",
      isGuest: order.flags?.isGuest || false,
    },
  });

  if (!razorpayOrder?.id) {
    throw new Error("Razorpay order creation failed");
  }

  order.payment = order.payment || {};
  order.payment.gateway = PAYMENT_GATEWAY.RAZORPAY;
  order.payment.status = PAYMENT_STATUS.PENDING;
  order.payment.gatewayMeta = {
    ...(order.payment.gatewayMeta || {}),
    razorpay_order_id: razorpayOrder.id,
  };
  order.markModified("payment");

  await order.save();

  logger("INFO", "Razorpay order created", { orderId, razorpayOrderId: razorpayOrder.id });

  return res.json({ success: true, data: razorpayOrder });
});

/* =========================================================
   VERIFY PAYMENT (client-side callback)

   Shipping is manual now — this endpoint only confirms payment and moves
   the order to "confirmed". No courier is booked here; an admin does that
   later via PATCH /admin/:id/status once the order is ready to ship.
========================================================= */
const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId, customerEmail } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
    return res.status(400).json({ success: false, message: "Missing payment data" });
  }

  const signaturePayload = `${razorpay_order_id}|${razorpay_payment_id}`;
  if (!verifySignature(signaturePayload, razorpay_signature, process.env.RAZORPAY_KEY_SECRET)) {
    logger("WARN", "Razorpay signature mismatch", { orderId, razorpay_order_id });
    return res.status(400).json({ success: false, message: "Invalid signature" });
  }

  const order = await Order.findOne({ orderId: orderId.toUpperCase(), isDeleted: false });
  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  const authError = checkOrderAccess(order, req, customerEmail);
  if (authError) return res.status(authError.code).json({ success: false, message: authError.message });

  if (order.payment?.gatewayMeta?.razorpay_order_id !== razorpay_order_id) {
    return res.status(400).json({ success: false, message: "Order ID mismatch" });
  }

  // Idempotent — safe if the client retries, or the webhook (below) already
  // confirmed this payment first.
  if (order.payment?.status === PAYMENT_STATUS.PAID) {
    return res.json({
      success: true,
      message: "Payment already verified",
      data: { orderId: order.orderId, orderStatus: order.orderStatus, paymentStatus: order.payment.status },
    });
  }

  order.payment.status = PAYMENT_STATUS.PAID;
  order.payment.paidAt = new Date();
  order.payment.amountPaid = order.pricing?.total || 0;
  order.payment.gatewayMeta = {
    ...(order.payment.gatewayMeta || {}),
    razorpay_payment_id,
    razorpay_signature,
  };
  order.markModified("payment");

  order.addTimeline(ORDER_STATUS.CONFIRMED, "Payment verified via Razorpay", {
    type: ACTOR_TYPE.SYSTEM,
    id: "razorpay",
    name: "Razorpay",
  });

  await order.save();

  sendOrderConfirmationEmail(order).catch((err) => {
    logger("ERROR", `Email sending failed on verify: ${err.message}`);
  });

  return res.json({
    success: true,
    message: "Payment verified",
    data: { orderId: order.orderId, orderStatus: order.orderStatus, paymentStatus: order.payment.status },
  });
});

/* =========================================================
   WEBHOOK — server-to-server fallback in case the client
   never calls verifyRazorpayPayment (closed tab, dropped
   network, etc). Register this URL in the Razorpay dashboard.

   IMPORTANT: mount this route with express.raw({ type: "application/json" })
   instead of express.json() — Razorpay signs the raw body bytes.

   Shipping is manual — same as verifyRazorpayPayment, this only confirms
   payment. No courier is booked here.
========================================================= */
const handleRazorpayWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const rawBody = req.body; // Buffer

  if (!verifySignature(rawBody, signature, process.env.RAZORPAY_WEBHOOK_SECRET)) {
    logger("WARN", "Razorpay webhook signature invalid");
    return res.status(400).json({ success: false });
  }

  const event = JSON.parse(rawBody.toString("utf8"));

  if (event.event !== "payment.captured") {
    return res.status(200).json({ success: true }); // ack, ignore other events
  }

  const payment = event.payload?.payment?.entity;
  const razorpayOrderId = payment?.order_id;
  if (!razorpayOrderId) return res.status(200).json({ success: true });

  const order = await Order.findOne({
    "payment.gatewayMeta.razorpay_order_id": razorpayOrderId,
    isDeleted: false,
  });

  if (!order || order.payment?.status === PAYMENT_STATUS.PAID) {
    return res.status(200).json({ success: true }); // already handled, or not ours
  }

  order.payment.status = PAYMENT_STATUS.PAID;
  order.payment.paidAt = new Date();
  order.payment.amountPaid = order.pricing?.total || 0;
  order.payment.gatewayMeta = {
    ...(order.payment.gatewayMeta || {}),
    razorpay_payment_id: payment.id,
  };
  order.markModified("payment");

  order.addTimeline(ORDER_STATUS.CONFIRMED, "Payment captured via Razorpay webhook", {
    type: ACTOR_TYPE.SYSTEM,
    id: "razorpay-webhook",
  });

  await order.save();

  sendOrderConfirmationEmail(order).catch((err) => {
    logger("ERROR", `Email sending failed (webhook): ${err.message}`);
  });

  return res.status(200).json({ success: true });
});

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleRazorpayWebhook,
};