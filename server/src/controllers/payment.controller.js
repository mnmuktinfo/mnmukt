const crypto = require("crypto");
const logger = require("../utils/logger");

const Order = require("../models/Order");
const razorpayService = require("../services/razorpay.service");
const { sendOrderConfirmationEmail } = require("../services/resend.email");

// ✅ CENTRAL CONSTANTS
const {
  ORDER_STATUS,
  PAYMENT_STATUS,
  PAYMENT_GATEWAY,
  ACTOR_TYPE,
  ORDER_FLAGS,
} = require("../constants");

// =========================================================
// CREATE RAZORPAY ORDER
// =========================================================
const createRazorpayOrder = async (req, res) => {
  try {
    let { amount, currency = "INR", orderId, customerEmail } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount provided",
      });
    }

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    const amountInPaise = Math.round(Number(amount) * 100);

    // =====================================================
    // FIND ORDER
    // =====================================================
    const order = await Order.findOne({
      orderId: orderId.toUpperCase(),
      isDeleted: false,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // =====================================================
    // AUTH CHECK
    // =====================================================
    if (req.isAuthenticated && req.user?.uid) {
      if (order.customer.uid !== req.user.uid) {
        logger("WARN", "Unauthorized payment attempt", {
          orderId,
          userId: req.user.uid,
        });

        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    } else if (order.flags?.isGuest) {
      if (!customerEmail) {
        return res.status(400).json({
          success: false,
          message: "Email required for guest payment",
        });
      }

      if (order.customer.email.toLowerCase() !== customerEmail.toLowerCase()) {
        return res.status(403).json({
          success: false,
          message: "Email mismatch",
        });
      }
    } else {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // =====================================================
    // AMOUNT VALIDATION
    // =====================================================
    const expectedAmount = order.pricing?.total || 0;

    if (Math.abs(expectedAmount - amount) > 1) {
      return res.status(400).json({
        success: false,
        message: "Amount mismatch",
      });
    }

    // =====================================================
    // PAYMENT STATUS CHECK
    // =====================================================
    if (order.payment?.status === PAYMENT_STATUS.PAID) {
      return res.status(400).json({
        success: false,
        message: "Order already paid",
      });
    }

    if (
      [ORDER_STATUS.CANCELLED, ORDER_STATUS.REFUNDED].includes(
        order.orderStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message: `Cannot pay for ${order.orderStatus} order`,
      });
    }

    // =====================================================
    // CREATE RAZORPAY ORDER
    // =====================================================
    const razorpayOrder = await razorpayService.createOrder({
      amount: amountInPaise,
      currency,
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

    // =====================================================
    // SAVE PAYMENT META
    // =====================================================
    order.payment = order.payment || {};
    order.payment.gateway = PAYMENT_GATEWAY.RAZORPAY;
    order.payment.status = PAYMENT_STATUS.PENDING;
    order.payment.gatewayMeta = {
      ...(order.payment.gatewayMeta || {}),
      razorpay_order_id: razorpayOrder.id,
    };

    order.markModified("payment");

    await order.save();

    logger("INFO", "Razorpay order created", {
      orderId,
      razorpayOrderId: razorpayOrder.id,
    });

    return res.json({
      success: true,
      data: razorpayOrder,
    });
  } catch (error) {
    logger("ERROR", error.message);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================================
// VERIFY PAYMENT
// =========================================================
const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
      customerEmail,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !orderId
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing payment data",
      });
    }

    // =====================================================
    // VERIFY SIGNATURE
    // =====================================================
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }

    // =====================================================
    // FIND ORDER
    // =====================================================
    const order = await Order.findOne({
      orderId: orderId.toUpperCase(),
      isDeleted: false,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // =====================================================
    // AUTH CHECK
    // =====================================================
    if (req.isAuthenticated && req.user?.uid) {
      if (order.customer.uid !== req.user.uid) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized",
        });
      }
    } else if (order.flags?.isGuest) {
      if (!customerEmail) {
        return res.status(400).json({
          success: false,
          message: "Email required",
        });
      }

      if (order.customer.email.toLowerCase() !== customerEmail.toLowerCase()) {
        return res.status(403).json({
          success: false,
          message: "Email mismatch",
        });
      }
    }

    // =====================================================
    // VERIFY ORDER ID MATCH
    // =====================================================
    if (
      order.payment?.gatewayMeta?.razorpay_order_id !== razorpay_order_id
    ) {
      return res.status(400).json({
        success: false,
        message: "Order ID mismatch",
      });
    }

    // =====================================================
    // IDEMPOTENCY CHECK
    // =====================================================
    if (order.payment?.status === PAYMENT_STATUS.PAID) {
      return res.json({
        success: true,
        message: "Payment already verified",
        data: {
          orderId: order.orderId,
          orderStatus: order.orderStatus,
          paymentStatus: order.payment.status,
        },
      });
    }

    // =====================================================
    // UPDATE ORDER
    // =====================================================
    order.payment = order.payment || {};
    order.payment.status = PAYMENT_STATUS.PAID;
    order.payment.paidAt = new Date();
    order.payment.amountPaid = order.pricing?.total || 0;

    order.payment.gatewayMeta = {
      ...(order.payment.gatewayMeta || {}),
      razorpay_payment_id,
      razorpay_signature,
    };

    order.orderStatus = ORDER_STATUS.CONFIRMED;

    order.markModified("payment");

    if (typeof order.addTimeline === "function") {
      order.addTimeline(
        ORDER_STATUS.CONFIRMED,
        "Payment verified via Razorpay",
        {
          type: ACTOR_TYPE.SYSTEM,
          id: "razorpay",
          name: "Razorpay",
        }
      );
    }

    await order.save();
    
    // Trigger Email Asynchronously
    sendOrderConfirmationEmail(order).catch((err) => {
       logger("ERROR", `Email sending failed on verify: ${err.message}`);
    });

    return res.json({
      success: true,
      message: "Payment verified",
      data: {
        orderId: order.orderId,
        orderStatus: order.orderStatus,
        paymentStatus: order.payment.status,
      },
    });
  } catch (error) {
    logger("ERROR", error.message);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
};