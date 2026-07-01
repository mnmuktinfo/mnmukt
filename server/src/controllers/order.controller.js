const logger = require("../utils/logger");
const Order = require("../models/Order");
const { makeOrderId } = require("../utils/orderId");
const { db } = require("../config/firebaseAdmin");

// ✅ CENTRAL CONSTANTS
const {
  ORDER_STATUS,
  PAYMENT_GATEWAY,
  PAYMENT_STATUS,
  ORDER_SOURCE,
  ACTOR_TYPE,
  ORDER_FLAGS,
} = require("../constants");

// ==========================================
// ALLOWED STATUS TRANSITIONS (CONSTANT-BASED)
// ==========================================
const ALLOWED_TRANSITIONS = {
  [ORDER_STATUS.PENDING]: [
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.CANCELLED,
    ORDER_STATUS.ON_HOLD,
  ],

  [ORDER_STATUS.CONFIRMED]: [
    ORDER_STATUS.PROCESSING,
    ORDER_STATUS.CANCELLED,
  ],

  [ORDER_STATUS.PROCESSING]: [
    ORDER_STATUS.PACKED,
    ORDER_STATUS.CANCELLED,
  ],

  [ORDER_STATUS.PACKED]: [
    ORDER_STATUS.SHIPPED,
  ],

  [ORDER_STATUS.SHIPPED]: [
    ORDER_STATUS.OUT_FOR_DELIVERY,
  ],

  [ORDER_STATUS.OUT_FOR_DELIVERY]: [
    ORDER_STATUS.DELIVERED,
  ],

  [ORDER_STATUS.DELIVERED]: [
    ORDER_STATUS.RETURNED,
  ],

  [ORDER_STATUS.RETURNED]: [
    ORDER_STATUS.REFUNDED,
  ],

  [ORDER_STATUS.REFUNDED]: [],
  [ORDER_STATUS.CANCELLED]: [],
  [ORDER_STATUS.ON_HOLD]: [
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.CANCELLED,
  ],
};

// ==========================================
// PAYMENT METHOD → GATEWAY MAPPING
// ==========================================
const mapPaymentMethodToGateway = (paymentMethod) => {
  const mapping = {
    razorpay: PAYMENT_GATEWAY.RAZORPAY,
    cod: PAYMENT_GATEWAY.COD,
    whatsapp: PAYMENT_GATEWAY.COD,
    upi: PAYMENT_GATEWAY.RAZORPAY,
    stripe: PAYMENT_GATEWAY.STRIPE,
    phonepe: PAYMENT_GATEWAY.PHONEPE,
    paytm: PAYMENT_GATEWAY.PAYTM,
    cashfree: PAYMENT_GATEWAY.CASHFREE,
    bank_transfer: PAYMENT_GATEWAY.BANK_TRANSFER,
  };

  return mapping[paymentMethod] || PAYMENT_GATEWAY.COD;
};

// ==========================================
// VERIFY PRICE
// ==========================================
// ==========================================
// VERIFY PRICE (SECURE BACKEND VERIFICATION)
// ==========================================
const verifyOrderAmount = async (items, pricing) => {
  try {
    let calculatedSubtotal = 0;

    // Fetch authoritative prices from Firestore
    for (const item of items) {
      if (!item.productId) return false;
      const productSnap = await db.collection("products").doc(item.productId).get();
      if (!productSnap.exists) return false;
      
      const productData = productSnap.data();
      const actualPrice = Number(productData.price || productData.unitPrice || productData.salePrice || 0);
      
      // Compare frontend price with backend price
      if (Math.abs(actualPrice - item.price) > 1) {
        logger("WARN", `Price manipulation detected for product ${item.productId}. Client sent: ${item.price}, Actual: ${actualPrice}`);
        return false;
      }
      
      calculatedSubtotal += (actualPrice * item.quantity);
    }

    // Add shipping and tax, subtract discounts
    const calculatedTotal =
      calculatedSubtotal +
      (pricing.shippingCharge || 0) +
      (pricing.taxAmount || 0) -
      (pricing.couponDiscount || 0) -
      (pricing.prepaidDiscount || 0) -
      (pricing.bulkDiscount || 0) +
      (pricing.roundOff || 0);

    // Allow a 1-rupee tolerance for floating point math
    return Math.abs(calculatedTotal - pricing.total) <= 1;
  } catch (error) {
    logger("ERROR", `Failed to verify order amount: ${error.message}`);
    return false;
  }
};

// ==========================================
// CREATE ORDER
// ==========================================
const createOrder = async (req, res) => {
  try {
    const {
      orderId: clientOrderId,
      items,
      shippingAddress,
      pricing,
      paymentMethod,
      source = ORDER_SOURCE.WEB,
      customerNote = "",
      customerEmail,
      customerName,
      isGuest = false,
    } = req.body;

    let customer = null;
    let orderUserId = null;
    let isGuestOrder = isGuest;

    // ==========================
    // AUTH USER
    // ==========================
    if (req.isAuthenticated && req.user?.uid) {
      customer = {
        uid: req.user.uid,
        name:
          req.user.name ||
          req.user.displayName ||
          shippingAddress.fullName,
        email: req.user.email || customerEmail || "",
        phone: req.user.phone || shippingAddress.phone,
      };

      orderUserId = req.user.uid;
      isGuestOrder = false;
    }

    // ==========================
    // GUEST USER
    // ==========================
    else if (isGuest || req.isGuest) {
      if (!customerEmail || !customerName) {
        return res.status(400).json({
          success: false,
          message: "Guest users must provide email and name",
        });
      }

      customer = {
        uid: null,
        name: customerName,
        email: customerEmail,
        phone: shippingAddress.phone,
      };

      orderUserId = null;
      isGuestOrder = true;
    } else {
      return res.status(401).json({
        success: false,
        message: "Authentication or guest email required",
      });
    }

    // ==========================
    // ORDER ID
    // ==========================
    const orderId =
      clientOrderId || makeOrderId(customer.name || "guest");

    const existingOrder = await Order.findOne({ orderId });

    if (existingOrder) {
      return res.status(409).json({
        success: false,
        message: "Order already exists",
      });
    }

    // ==========================
    // PRICE VALIDATION (SECURE)
    // ==========================
    const isPriceValid = await verifyOrderAmount(items, pricing);
    if (!isPriceValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid pricing or product not found",
      });
    }

    const gateway = mapPaymentMethodToGateway(paymentMethod);

    // ==========================
    // BUILD ORDER
    // ==========================
    const order = new Order({
      orderId,
      source,
      displayId: Math.floor(Math.random() * 999999),

      customer,

      items: items.map((item) => ({
        productId: item.productId,
        name: item.name,
        image: item.image || "",
        price: item.price,
        quantity: item.quantity,
        sku: item.sku || "N/A",
        slug: item.slug || "N/A",
        originalPrice: item.originalPrice || item.price,
        category: item.category || "General",
        selectedSize: item.selectedSize || "onesize",
        selectedColor: item.selectedColor,
        lineTotal: item.totalPrice || item.price * item.quantity,
      })),

      shippingAddress,
      pricing,

      payment: {
        gateway,
        method: paymentMethod,
        status: PAYMENT_STATUS.PENDING,
        paidAt: null,
        amountPaid: 0,
        currency: "INR",
        gatewayMeta: {},
      },

      orderStatus: ORDER_STATUS.PENDING,

      flags: {
        [ORDER_FLAGS.IS_COD]: gateway === PAYMENT_GATEWAY.COD,
        [ORDER_FLAGS.IS_PREPAID]: gateway !== PAYMENT_GATEWAY.COD,
        [ORDER_FLAGS.IS_GIFT]: false,
        [ORDER_FLAGS.IS_BULK]: false,
        [ORDER_FLAGS.IS_GUEST]: isGuestOrder,
        [ORDER_FLAGS.REQUIRES_REVIEW]: false,
      },

      shipments: [],
      refund: { status: "none" },
      timeline: [],
      customerNote,
      adminNote: "",
      isDeleted: false,
    });

    // ==========================
    // TIMELINE
    // ==========================
    if (typeof order.addTimeline === "function") {
      order.addTimeline(
        ORDER_STATUS.PENDING,
        "Order placed successfully",
        {
          type: ACTOR_TYPE.CUSTOMER,
          id: orderUserId || "guest",
          name: customer.name,
        },
        { isGuest: isGuestOrder }
      );
    }

    await order.save();

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        orderId: order.orderId,
        _id: order._id,
        status: order.orderStatus,
        total: order.pricing.total,
        isGuest: isGuestOrder,
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

// ==========================================
// UPDATE ORDER STATUS (ADMIN)
// ==========================================
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, courier, trackingNumber, trackingUrl, adminNote } =
      req.body;

    const order = await Order.findOne({
      orderId: id,
      isDeleted: false,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const oldStatus = order.orderStatus;

    // VALIDATE STATUS
    if (!Object.values(ORDER_STATUS).includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    // TRANSITION CHECK
    if (oldStatus !== orderStatus) {
      const allowed = ALLOWED_TRANSITIONS[oldStatus] || [];

      if (!allowed.includes(orderStatus)) {
        return res.status(400).json({
          success: false,
          message: `Invalid transition: ${oldStatus} → ${orderStatus}`,
        });
      }
    }

    order.orderStatus = orderStatus;

    if (adminNote) order.adminNote = adminNote;

    if (courier || trackingNumber || trackingUrl) {
      order.shipments.push({
        courier: courier || "",
        trackingNumber: trackingNumber || "",
        trackingUrl: trackingUrl || "",
        updatedAt: new Date(),
      });
    }

    if (typeof order.addTimeline === "function") {
      order.addTimeline(
        orderStatus,
        `Status changed from ${oldStatus} to ${orderStatus}`,
        {
          type: ACTOR_TYPE.ADMIN,
          id: req.user.uid,
          name: req.user.name || "Admin",
        }
      );
    }

    await order.save({ validateBeforeSave: false });

    return res.json({
      success: true,
      message: "Order updated",
      data: order,
    });
  } catch (error) {
    logger("ERROR", error.message);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAdminOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;
    const skip = (page - 1) * limit;
    const { search, status } = req.query;

    const query = { isDeleted: false };

    // Filter by status if provided and not "all"
    if (status && status !== "all") {
      let dbStatus = status;
      if (status === "packaging") dbStatus = "processing";
      if (status === "shipping") dbStatus = "shipped";
      
      query.orderStatus = dbStatus;
    }

    // Search query (case-insensitive regex)
    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { orderId: searchRegex },
        { "customer.name": searchRegex },
        { "customer.phone": searchRegex },
        { "customer.email": searchRegex },
      ];
    }

    // Calculate real-time counts for each status tab
    const counts = {
      all: await Order.countDocuments({ isDeleted: false }),
      pending: await Order.countDocuments({ isDeleted: false, orderStatus: "pending" }),
      confirmed: await Order.countDocuments({ isDeleted: false, orderStatus: "confirmed" }),
      processing: await Order.countDocuments({ isDeleted: false, orderStatus: "processing" }),
      shipped: await Order.countDocuments({ isDeleted: false, orderStatus: "shipped" }),
      delivered: await Order.countDocuments({ isDeleted: false, orderStatus: "delivered" }),
      cancelled: await Order.countDocuments({ isDeleted: false, orderStatus: "cancelled" }),
    };

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        counts,
      },
    });
  } catch (error) {
    logger("ERROR", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAdminOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ orderId: id.toUpperCase(), isDeleted: false });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    return res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    logger("ERROR", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ orderId: id.toUpperCase(), isDeleted: false });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    order.isDeleted = true;
    await order.save({ validateBeforeSave: false });
    return res.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    logger("ERROR", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({ "customer.uid": req.user.uid, isDeleted: false }).sort({ createdAt: -1 });
    return res.json({ success: true, data: orders });
  } catch (error) {
    logger("ERROR", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ orderId: id.toUpperCase(), "customer.uid": req.user.uid, isDeleted: false });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    return res.json({ success: true, data: order });
  } catch (error) {
    logger("ERROR", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { shippingAddress, customerNote } = req.body;
    const order = await Order.findOne({ orderId: id.toUpperCase(), "customer.uid": req.user.uid, isDeleted: false });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (shippingAddress) order.shippingAddress = shippingAddress;
    if (customerNote !== undefined) order.customerNote = customerNote;
    await order.save({ validateBeforeSave: false });
    return res.json({ success: true, data: order });
  } catch (error) {
    logger("ERROR", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ orderId: id.toUpperCase(), "customer.uid": req.user.uid, isDeleted: false });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (order.orderStatus !== "pending" && order.orderStatus !== "confirmed") {
      return res.status(400).json({ success: false, message: "Only pending or confirmed orders can be cancelled" });
    }
    order.orderStatus = "cancelled";
    if (typeof order.addTimeline === "function") {
      order.addTimeline("cancelled", "Order cancelled by customer", {
        type: ACTOR_TYPE.CUSTOMER,
        id: req.user.uid,
        name: order.customer.name,
      });
    }
    await order.save({ validateBeforeSave: false });
    return res.json({ success: true, data: order });
  } catch (error) {
    logger("ERROR", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { email } = req.query;
    const order = await Order.findOne({ orderId: orderId.toUpperCase(), isDeleted: false });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    const isGuest = order.flags?.isGuest || !order.customer.uid;
    if (isGuest) {
      if (!email || email.toLowerCase() !== order.customer.email.toLowerCase()) {
        return res.status(403).json({ success: false, message: "Unauthorized access to guest order status" });
      }
    } else {
      const ownsOrder = req.isAuthenticated && req.user?.uid === order.customer.uid;
      const emailMatches = email && email.toLowerCase() === order.customer.email.toLowerCase();
      if (!ownsOrder && !emailMatches) {
        return res.status(403).json({ success: false, message: "Unauthorized access to order status" });
      }
    }
    return res.json({
      success: true,
      data: {
        orderId: order.orderId,
        status: order.orderStatus,
        customerName: order.customer.name,
        createdAt: order.createdAt,
        pricing: order.pricing,
        timeline: order.timeline,
      },
    });
  } catch (error) {
    logger("ERROR", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  updateOrderStatus,
  getAdminOrders,
  getAdminOrder,
  deleteOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  cancelOrder,
  getOrderStatus,
};