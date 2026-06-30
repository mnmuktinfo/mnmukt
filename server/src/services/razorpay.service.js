const Razorpay = require("razorpay");
const crypto = require("crypto");
const logger = require("../utils/logger");

// ==========================================
// RAZORPAY INSTANCE
// ==========================================
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ==========================================
// CREATE RAZORPAY ORDER
// ==========================================
const createOrder = async ({ amount, currency = "INR", receipt }) => {
  try {
    const options = {
      amount, // in paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return order;
  } catch (error) {
    logger("ERROR", `Razorpay createOrder failed: ${error.message}`);
    throw new Error("Razorpay order creation failed");
  }
};

// ==========================================
// FETCH ORDER DETAILS (optional)
// ==========================================
const fetchOrder = async (orderId) => {
  try {
    return await razorpay.orders.fetch(orderId);
  } catch (error) {
    logger("ERROR", `Fetch order failed: ${error.message}`);
    throw new Error("Failed to fetch Razorpay order");
  }
};

// ==========================================
// VERIFY PAYMENT SIGNATURE
// ==========================================
const verifyPaymentSignature = ({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) => {
  try {
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    return expectedSignature === razorpay_signature;
  } catch (error) {
    logger("ERROR", `Signature verification failed: ${error.message}`);
    return false;
  }
};

// ==========================================
// REFUND PAYMENT (OPTIONAL FUTURE)
// ==========================================
const refundPayment = async (paymentId, amount) => {
  try {
    return await razorpay.payments.refund(paymentId, {
      amount, // optional partial refund
    });
  } catch (error) {
    logger("ERROR", `Refund failed: ${error.message}`);
    throw new Error("Refund failed");
  }
};

module.exports = {
  createOrder,
  fetchOrder,
  verifyPaymentSignature,
  refundPayment,
};