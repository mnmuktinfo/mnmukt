const express = require("express");
const router = express.Router();
const crypto = require("crypto");

const logger = require("../utils/logger");
const Order = require("../models/Order");
const { sendOrderConfirmationEmail } = require("../services/resend.email");

// ==========================================
// WEBHOOK SIGNATURE VERIFICATION
// ==========================================

const verifyRazorpayWebhookSignature = (req) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    if (!signature) return false;

    // Razorpay Webhooks use the RAW JSON body for verification
    const body = JSON.stringify(req.body);
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret) {
      logger("ERROR", "RAZORPAY_WEBHOOK_SECRET is not defined in environment variables");
      return false;
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    logger("WARN", `Signature verification failed: ${error.message}`);
    return false;
  }
};

// ==========================================
// RAZORPAY WEBHOOK HANDLER
// ==========================================

router.post("/razorpay", async (req, res) => {
  try {
    // 1. Verify Signature
    if (!verifyRazorpayWebhookSignature(req)) {
      logger("WARN", `Invalid webhook signature attempt: ${req.ip}`);
      return res.status(401).json({ success: false, message: "Invalid signature" });
    }

    const eventType = req.body.event;
    
    // We only care about payment success and failure events
    if (!["payment.captured", "payment.authorized", "payment.failed", "order.paid"].includes(eventType)) {
      return res.status(200).json({ success: true, message: "Event ignored" });
    }

    const paymentEntity = req.body.payload?.payment?.entity;
    if (!paymentEntity) {
       return res.status(400).json({ success: false, message: "No payment payload" });
    }

    const razorpay_order_id = paymentEntity.order_id;
    const razorpay_payment_id = paymentEntity.id;

    if (!razorpay_order_id) {
       return res.status(400).json({ success: false, message: "Missing order_id in webhook" });
    }

    // 2. Find Order in MongoDB
    const order = await Order.findOne({ "payment.gatewayMeta.razorpay_order_id": razorpay_order_id });

    if (!order) {
      logger("WARN", `Webhook: Order not found for ${razorpay_order_id}`);
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // ==========================================
    // HANDLE SUCCESS EVENTS
    // ==========================================
    if (["payment.captured", "payment.authorized", "order.paid"].includes(eventType)) {
      
      if (order.payment?.status === "paid") {
        logger("INFO", `Webhook: Payment already processed for ${order.orderId}`);
        return res.status(200).json({ success: true, message: "Payment already processed" });
      }

      order.payment = order.payment || {};
      order.payment.status = "paid";
      order.payment.paidAt = new Date();
      order.payment.amountPaid = (paymentEntity.amount || 0) / 100; // Convert paise to rupees
      
      order.payment.gatewayMeta = {
        ...(order.payment.gatewayMeta || {}),
        razorpay_payment_id,
        webhook_verified: true,
      };

      order.orderStatus = "confirmed";
      order.markModified("payment");

      if (typeof order.addTimeline === "function") {
        order.addTimeline(
          "confirmed",
          "Payment confirmed via Razorpay Webhook",
          { type: "system", id: "razorpay_webhook", name: "Razorpay" }
        );
      }

      await order.save();
      
      // Trigger Email Notification safely
      sendOrderConfirmationEmail(order).catch(err => {
         logger("ERROR", `Failed to send email inside webhook: ${err.message}`);
      });

      logger("INFO", `Payment confirmed via Webhook for order ${order.orderId}`);
      return res.status(200).json({ success: true, message: "Payment processed successfully" });
    }

    // ==========================================
    // HANDLE FAILURE EVENTS
    // ==========================================
    if (eventType === "payment.failed") {
      if (order.payment?.status === "failed") {
         return res.status(200).json({ success: true, message: "Already marked as failed" });
      }
      
      const errorReason = paymentEntity.error_description || paymentEntity.error_reason || "Unknown error";

      order.payment = order.payment || {};
      order.payment.status = "failed";
      order.payment.gatewayMeta = {
        ...(order.payment.gatewayMeta || {}),
        razorpay_payment_id,
        failureReason: errorReason,
      };
      
      order.markModified("payment");

      if (typeof order.addTimeline === "function") {
        order.addTimeline(
          "payment_failed",
          `Payment failed: ${errorReason}`,
          { type: "system", id: "razorpay_webhook", name: "Razorpay" }
        );
      }

      await order.save();
      logger("WARN", `Payment failed for order ${order.orderId}`);
      return res.status(200).json({ success: true, message: "Payment failure recorded" });
    }

    return res.status(200).json({ success: true, message: "Event not handled" });

  } catch (error) {
    logger("ERROR", `Webhook error: ${error.message}`);
    res.status(500).json({ success: false, message: "Webhook processing failed" });
  }
});

module.exports = router;