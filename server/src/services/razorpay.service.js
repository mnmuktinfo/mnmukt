"use strict";

const Razorpay = require("razorpay");
const crypto = require("crypto");
const logger = require("../utils/logger");

// ==========================================
// ENV VALIDATION (SAFE STARTUP FAIL)
// ==========================================
const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  throw new Error(
    "❌ Razorpay environment variables missing (KEY_ID / KEY_SECRET)"
  );
}

// ==========================================
// INSTANCE
// ==========================================
const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

// ==========================================
// SAFE ERROR WRAPPER
// ==========================================
const formatError = (error, context) => {
  const safeError = {
    context,
    message: error.message || "Unknown Razorpay error",
    statusCode: error.statusCode || 500,
  };

  logger("ERROR", JSON.stringify(safeError));
  return safeError;
};

// ==========================================
// CREATE ORDER
// ==========================================
const createOrder = async ({ amount, currency = "INR", receipt, notes = {} }) => {
  try {
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new Error(`Invalid amount (paise required): ${amount}`);
    }

    const options = {
      amount,
      currency,
      receipt: (receipt || `rcpt_${Date.now()}`).slice(0, 40),
      notes,
    };

    const order = await razorpay.orders.create(options);

    if (!order?.id) {
      throw new Error("Razorpay order creation failed (no order id returned)");
    }

    logger("INFO", "Razorpay order created", {
      razorpayOrderId: order.id,
      amount,
    });

    return order;
  } catch (err) {
    throw formatError(err, "CREATE_ORDER");
  }
};

// ==========================================
// FETCH ORDER
// ==========================================
const fetchOrder = async (orderId) => {
  try {
    if (!orderId) throw new Error("Order ID required");

    return await razorpay.orders.fetch(orderId);
  } catch (err) {
    throw formatError(err, "FETCH_ORDER");
  }
};

// ==========================================
// VERIFY SIGNATURE (SECURE)
// ==========================================
const verifyPaymentSignature = ({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) => {
  try {
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return false;
    }

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(payload)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(razorpay_signature)
    );
  } catch (err) {
    logger("ERROR", `Signature verification failed: ${err.message}`);
    return false;
  }
};

// ==========================================
// REFUND PAYMENT
// ==========================================
const refundPayment = async (paymentId, amount) => {
  try {
    if (!paymentId) throw new Error("Payment ID required");

    const options = amount ? { amount } : {};

    return await razorpay.payments.refund(paymentId, options);
  } catch (err) {
    throw formatError(err, "REFUND_PAYMENT");
  }
};

// ==========================================
// EXPORTS
// ==========================================
module.exports = {
  createOrder,
  fetchOrder,
  verifyPaymentSignature,
  refundPayment,
};