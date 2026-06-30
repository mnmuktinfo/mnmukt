const express = require("express");
const router = express.Router();
const crypto = require("crypto");

const logger = require("../utils/logger");
const db = require("../config/firebaseAdmin");

// ==========================================
// WEBHOOK SIGNATURE VERIFICATION
// ==========================================

/**
 * ✅ Verify Razorpay webhook signature
 * This prevents anyone from calling the webhook and spoofing payments
 */
const verifyRazorpaySignature = (req) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // Reconstruct the signature from the webhook secret
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest("hex");

    // Constant-time comparison to prevent timing attacks
    const isValid = crypto.timingSafeEqual(
      Buffer.from(razorpay_signature),
      Buffer.from(expectedSignature)
    );

    return isValid;
  } catch (error) {
    logger("WARN", `Signature verification failed: ${error.message}`);
    return false;
  }
};

// ==========================================
// RAZORPAY PAYMENT SUCCESS WEBHOOK
// ==========================================

/**
 * ✅ Webhook for Razorpay payment success
 * IMPORTANT: This endpoint should NOT require user authentication
 * because webhooks are called by Razorpay servers, not the user.
 * Instead, we verify the webhook signature to ensure it came from Razorpay.
 */
router.post("/razorpay/payment-success", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    // ✅ CRITICAL: Verify webhook signature (most important!)
    if (!verifyRazorpaySignature(req.body)) {
      logger("WARN", `Invalid webhook signature attempt: ${req.ip}`);

      return res.status(401).json({
        success: false,
        message: "Invalid signature",
      });
    }

    // ✅ Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({
        success: false,
        message: "Missing payment details",
      });
    }

    // ✅ Find order by Razorpay order ID (not user input!)
    const orderDoc = await db
      .collection("orders")
      .where("razorpay_order_id", "==", razorpay_order_id)
      .limit(1)
      .get();

    if (orderDoc.empty) {
      logger("WARN", `Webhook: Order not found for ${razorpay_order_id}`);

      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const order = orderDoc.docs[0];
    const orderId = order.id;
    const orderData = order.data();

    // ✅ Prevent double-processing (idempotency)
    if (orderData.paymentStatus === "paid") {
      logger("INFO", `Webhook: Payment already processed for ${orderId}`);

      return res.status(200).json({
        success: true,
        message: "Payment already processed",
      });
    }

    const batch = db.batch();
    const now = new Date().toISOString();

    // ✅ Update order - payment confirmed
    batch.update(db.collection("orders").doc(orderId), {
      paymentStatus: "paid",
      razorpay_payment_id,
      razorpay_order_id,
      orderStatus: "confirmed",
      paidAt: now,
      updatedAt: now,
    });

    // ✅ Update user's order reference
    batch.update(
      db.collection("users").doc(orderData.userId).collection("orders").doc(orderId),
      {
        paymentStatus: "paid",
        orderStatus: "confirmed",
        updatedAt: now,
      }
    );

    // ✅ Add timeline entry for audit trail
    batch.set(
      db.collection("orders").doc(orderId).collection("timeline").doc(),
      {
        status: "payment_received",
        event: "payment_confirmed",
        transactionId: razorpay_payment_id,
        amount: orderData.amount,
        note: `Payment of ₹${orderData.amount} confirmed via Razorpay`,
        timestamp: now,
      }
    );

    // Commit all updates atomically
    await batch.commit();

    logger("INFO", `Payment confirmed for order ${orderId}`, {
      orderId,
      userId: orderData.userId,
      paymentId: razorpay_payment_id,
      amount: orderData.amount,
    });

    res.status(200).json({
      success: true,
      message: "Payment processed successfully",
      orderId,
    });
  } catch (error) {
    logger("ERROR", `Webhook error: ${error.message}`, {
      ip: req.ip,
      error: error.stack,
    });

    res.status(500).json({
      success: false,
      message: "Webhook processing failed",
    });
  }
});

// ==========================================
// RAZORPAY PAYMENT FAILURE WEBHOOK
// ==========================================

/**
 * ✅ Handle failed payments
 */
router.post("/razorpay/payment-failure", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, error } =
      req.body;

    // ✅ Verify signature
    if (!verifyRazorpaySignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature })) {
      logger("WARN", `Invalid failure webhook signature: ${req.ip}`);

      return res.status(401).json({
        success: false,
        message: "Invalid signature",
      });
    }

    // Find order
    const orderDoc = await db
      .collection("orders")
      .where("razorpay_order_id", "==", razorpay_order_id)
      .limit(1)
      .get();

    if (orderDoc.empty) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const order = orderDoc.docs[0];
    const orderId = order.id;
    const orderData = order.data();
    const now = new Date().toISOString();

    // ✅ Update order status to failed
    await db.collection("orders").doc(orderId).update({
      paymentStatus: "failed",
      razorpay_payment_id,
      failureReason: error?.description || "Unknown error",
      updatedAt: now,
    });

    // ✅ Add timeline entry
    await db
      .collection("orders")
      .doc(orderId)
      .collection("timeline")
      .add({
        status: "payment_failed",
        event: "payment_failed",
        error: error?.description,
        timestamp: now,
      });

    logger("WARN", `Payment failed for order ${orderId}`, {
      orderId,
      error: error?.description,
    });

    res.status(200).json({
      success: true,
      message: "Payment failure recorded",
    });
  } catch (error) {
    logger("ERROR", `Payment failure webhook error: ${error.message}`);

    res.status(500).json({
      success: false,
      message: "Webhook processing failed",
    });
  }
});

module.exports = router;