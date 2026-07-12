// src/features/orders/services/orderService.js
import axios from "axios";
import { auth } from "../../../../config/firebaseAuth";
import { buildFallbackSku } from "./itemUtils";

// Fail loudly in production if the API URL was never configured, instead of
// silently pointing a live build at localhost. In dev, falling back to
// localhost is convenient, so we only enforce this in prod builds.
const resolveBaseUrl = () => {
  const configured = import.meta.env.VITE_API_URL;
  if (configured) return configured;

  if (import.meta.env.PROD) {
    throw new Error(
      "VITE_API_URL is not set. Refusing to fall back to localhost in production.",
    );
  }
  return "http://localhost:5000/api/v1";
};

const API = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 15000,
});

const getAuthToken = async () => {
  try {
    const user = auth.currentUser;
    return user ? await user.getIdToken() : null;
  } catch {
    return null; // guests fall through with no token — backend must allow this
  }
};

const getAuthHeaders = async () => {
  const token = await getAuthToken();
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

const handleApiError = (error, defaultMsg) => {
  const msg = error.response?.data?.message || error.message || defaultMsg;
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.error("ORDER API ERROR:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
  }
  throw new Error(msg);
};

/**
 * POST /orders
 * Auth optional — Bearer token for logged-in users, or guest fields for guests.
 *
 * NOTE: the backend recalculates subtotal/total from `items` itself
 * (pre('validate')), so `pricing` here is just a best-effort hint.
 *
 * NOTE: on success the backend also seeds the order's timeline with a
 * "pending" entry itself, e.g.
 *   order.addTimeline(ORDER_STATUS.PENDING, "Order placed — awaiting payment", {
 *     type: ACTOR_TYPE.CUSTOMER,
 *     id: uid || "guest",
 *   });
 * so the frontend should never construct that first timeline entry locally —
 * always read `timeline` back from GET /orders/status/:orderId instead.
 */
export const createOrder = async (orderData) => {
  try {
    const {
      customer = {},
      shippingAddress = {},
      paymentMethod = "",
      items = [],
      pricing = {},
      customerNote = "",
    } = orderData || {};

    // Use Firebase auth as source of truth for guest detection everywhere
    // in this file (createOrder previously used `!firebaseUser`, while
    // createPaymentOrder used `!firebaseUser?.uid` — same intent, two
    // slightly different checks; unified here).
    const firebaseUser = auth.currentUser;
    const isGuest = !firebaseUser?.uid;

    const normalizedPaymentMethod = String(paymentMethod).trim().toLowerCase();
    const allowedPaymentMethods = ["cashfree", "cod"];

    if (!allowedPaymentMethods.includes(normalizedPaymentMethod)) {
      throw new Error(`Unsupported payment method: ${paymentMethod}`);
    }

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("Cannot create an order with no items");
    }

    const sanitizedItems = items.map((item, index) => {
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const price = Math.max(0, Number(item.price) || 0);

      return {
        ...item,
        productId: item.productId || item._id || item.id || "",
        sku: buildFallbackSku(item, index),
        name: item.name?.trim() || "",
        image: item.image || item.thumbnail || item.banner || "",
        quantity,
        price,
        originalPrice: Math.max(0, Number(item.originalPrice || item.price) || 0),
        totalPrice: quantity * price,
      };
    });

    const payload = {
      items: sanitizedItems,

      // orderService.js — createOrder's shippingAddress payload
shippingAddress: {
  fullName: shippingAddress?.fullName?.trim() || "",
  email: shippingAddress?.email?.trim() || "",
  phone: shippingAddress?.phone?.trim() || "",
  addressLine1: shippingAddress?.addressLine1?.trim() || "",
  addressLine2: shippingAddress?.addressLine2?.trim() || "",
  city: shippingAddress?.city?.trim() || "",
  district: shippingAddress?.district?.trim() || "",  
  state: shippingAddress?.state?.trim() || "",
  postalCode: shippingAddress?.postalCode?.trim() || "",
  landmark: shippingAddress?.landmark?.trim() || "",
  tag: shippingAddress?.tag?.trim() || "Home",         
  country: shippingAddress?.country?.trim() || "India",
},

      pricing: {
        subtotal: Math.max(0, Number(pricing.subtotal) || 0),
        discount: Math.max(0, Number(pricing.discount) || 0),
        shipping: Math.max(
          0,
          Number(pricing.shipping ?? pricing.shippingCharge ?? pricing.deliveryFee) || 0,
        ),
        tax: Math.max(0, Number(pricing.tax) || 0),
        total: Math.max(0, Number(pricing.total ?? pricing.totalPayable) || 0),
      },

      paymentMethod: normalizedPaymentMethod,
      customerNote: customerNote?.trim() || "",

      customerEmail:
        customer?.email?.trim() ||
        shippingAddress?.email?.trim() ||
        firebaseUser?.email?.trim() ||
        "",

      customerName:
        customer?.name?.trim() ||
        shippingAddress?.fullName?.trim() ||
        firebaseUser?.displayName?.trim() ||
        "",
    };

    if (isGuest && !payload.customerEmail) {
      throw new Error("Guest email missing");
    }

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log("FINAL ORDER PAYLOAD:", {
        ...payload,
        // Avoid dumping full address/email/phone to the console even in dev,
        // where console history often gets pasted into chat/tickets.
        shippingAddress: { city: payload.shippingAddress.city, postalCode: payload.shippingAddress.postalCode },
        customerEmail: payload.customerEmail ? "[present]" : "[missing]",
      });
    }

    const headers = await getAuthHeaders();
    const { data } = await API.post("/orders", payload, { headers });

    if (!data?.data?.orderId) {
      throw new Error("Order creation failed");
    }

    return data.data;
  } catch (error) {
    handleApiError(error, "Failed to create order");
  }
};

/**
 * POST /payments/create-order
 * Auth optional. Do NOT send `amount` — the backend always charges
 * order.pricing.total from the DB and ignores any client-supplied amount.
 * `customerEmail` is required for guests only; logged-in users are
 * authorized via the Bearer token.
 */
export const createPaymentOrder = async ({ orderId, customerEmail } = {}) => {
  try {
    if (!orderId) {
      throw new Error("orderId required");
    }

    const firebaseUser = auth.currentUser;
    const isGuest = !firebaseUser?.uid;

    const payload = {
      orderId,
      customerEmail: customerEmail?.trim() || firebaseUser?.email?.trim() || "",
    };

    if (isGuest && !payload.customerEmail) {
      throw new Error("Email required for guest payment");
    }

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log("PAYMENT PAYLOAD:", {
        orderId,
        isGuest,
        customerEmail: payload.customerEmail ? "[present]" : "[missing]",
      });
    }

    const headers = await getAuthHeaders();
    const { data } = await API.post("/payments/create-order", payload, { headers });

    if (!data?.data?.id) {
      throw new Error("Payment order failed");
    }

    return data.data;
  } catch (error) {
    handleApiError(error, "Payment init failed");
  }
};

/**
 * POST /payments/verify
 * Called from the Razorpay Checkout `handler` callback.
 * payload: { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature, customerEmail? }
 */
export const verifyPayment = async (payload) => {
  try {
    if (!payload?.orderId || !payload?.razorpay_payment_id) {
      throw new Error("Missing orderId or payment ID for verification");
    }
    const headers = await getAuthHeaders();
    const { data } = await API.post("/payments/verify", payload, { headers });
    return data;
  } catch (error) {
    handleApiError(error, "Payment verification failed");
  }
};

// GET /orders/:id — logged-in users only, own orders
export const getOrderDetails = async (orderId) => {
  try {
    if (!orderId) throw new Error("orderId required");
    const headers = await getAuthHeaders();
    const { data } = await API.get(`/orders/${orderId}`, { headers });
    return data.data;
  } catch (error) {
    handleApiError(error, "Failed to fetch order");
  }
};

// GET /orders?page=&limit=&status= — logged-in users only
export const getUserOrders = async ({ page = 1, limit = 20, status } = {}) => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error("Login required");

    const params = { page, limit, ...(status && { status }) };
    const { data } = await API.get("/orders", {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return data?.data || [];
  } catch (error) {
    handleApiError(error, "Failed to fetch orders");
  }
};

/**
 * GET /orders/status/:orderId
 * Logged-in: Bearer token used, `email` query param omitted.
 * Guest: `email` query param required, no auth header.
 * Returns live `timeline` — including the backend-seeded "pending" entry —
 * so poll this after a reload instead of trusting local state.
 */
export const getOrderStatus = async (orderId, email) => {
  try {
    if (!orderId) throw new Error("orderId required");

    const token = await getAuthToken();
    const config = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : { params: { email: email || "" } };

    if (!token && !email) {
      throw new Error("Email required to look up a guest order");
    }

    const { data } = await API.get(`/orders/status/${orderId}`, config);
    return data.data;
  } catch (error) {
    handleApiError(error, "Failed to fetch status");
  }
};

/**
 * PATCH /orders/:id — logged-in only.
 * Only allowed while pending/confirmed and before a shipment exists.
 * payload: { shippingAddress?, customerNote? }
 */
export const updateOrder = async (orderId, updates) => {
  try {
    if (!orderId) throw new Error("orderId required");

    const token = await getAuthToken();
    if (!token) throw new Error("Login required");

    const { data } = await API.patch(`/orders/${orderId}`, updates, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data.data;
  } catch (error) {
    handleApiError(error, "Failed to update order");
  }
};

/**
 * PATCH /orders/:id/cancel — logged-in only.
 * Only allowed before the order is shipped.
 * payload: { reason }
 */
export const cancelOrder = async (orderId, reason) => {
  try {
    if (!orderId) throw new Error("orderId required");

    const token = await getAuthToken();
    if (!token) throw new Error("Login required");

    const { data } = await API.patch(
      `/orders/${orderId}/cancel`,
      { reason },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return data.data;
  } catch (error) {
    handleApiError(error, "Failed to cancel order");
  }
};

// Shipping serviceability check (calls your backend, which calls Shiprocket)
export const checkServiceability = async (pincode, options = {}) => {
  try {
    if (!pincode) throw new Error("Pincode required");

    const { data } = await API.get(`/shipping/serviceability/${pincode}`, {
      signal: options.signal,
    });
    return data;
  } catch (error) {
    // Let AbortError/CanceledError propagate untouched — useShippingServiceability
    // specifically checks err.name for these and treats them as "not a real
    // error, just a superseded request." Wrapping them in a generic Error
    // here would break that check.
    if (error.name === "AbortError" || error.name === "CanceledError") {
      throw error;
    }
    handleApiError(error, "Failed to check delivery availability");
  }
};

export const orderService = {
  createOrder,
  createPaymentOrder,
  verifyPayment,
  getOrderDetails,
  getUserOrders,
  getOrderStatus,
  updateOrder,
  cancelOrder,
  checkServiceability,
};