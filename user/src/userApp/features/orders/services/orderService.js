import axios from "axios";
import { auth } from "../../../../config/firebaseAuth";
import { normalizeItems, calculatePricing } from "./checkoutService";

/* ================================================
   AXIOS INSTANCE
================================================ */
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  timeout: 15000,
});

/* ================================================
   AUTH TOKEN
================================================ */
const getAuthToken = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  } catch (err) {
    console.error("Auth token error:", err);
    return null;
  }
};

const getAuthHeaders = async () => {
  const token = await getAuthToken();

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

/* ================================================
   ERROR HANDLER
================================================ */
const handleApiError = (error, defaultMsg) => {
  const msg =
    error.response?.data?.message ||
    error.message ||
    defaultMsg;

  console.error("ORDER API ERROR:", {
    status: error.response?.status,
    data: error.response?.data,
    message: msg,
  });

  throw new Error(msg);
};

/* ================================================
   CREATE ORDER (CLEAN + BACKEND SAFE)
================================================ */
/* ================================================
   CREATE ORDER (AXIOS API CALL)
================================================ */
export const createOrder = async (orderData) => {
  try {
    console.log("📦 Formatting order for backend validation...");

    // 1. Destructure the payload coming from buildOrderPayload
    const {
      customer,
      shippingAddress,
      paymentMethod,
      items = [],
      pricing,
      source = "web",
      customerNote = "",
    } = orderData;

    // 2. Flatten the payload so it perfectly matches the Backend Schema
    const payload = {
      // Flatten customer data
      userId: customer?.userId || null,
      customerEmail: customer?.email || shippingAddress?.email || null,
      customerName: customer?.name || shippingAddress?.fullName || null,
      isGuest: customer?.isGuest ?? true,

      // Pass items and address
      items,
      shippingAddress,
      paymentMethod,
      source,
      customerNote,

      // Map frontend pricing keys to strict backend pricing keys
      pricing: {
        ...pricing,
        // The backend validation usually demands 'shippingCharge' and 'total'
        shippingCharge: pricing.deliveryFee || pricing.shippingCharge || 0,
        total: pricing.totalPayable || pricing.total || 0,
      },
    };

    console.log("🚀 SENDING PAYLOAD TO BACKEND:", JSON.stringify(payload, null, 2));

    // 3. Make the API Call
    const headers = await getAuthHeaders(); // Ensure this function is imported/available
    const { data } = await API.post("/orders", payload, { headers });

    if (!data?.data?.orderId) {
      throw new Error("Order creation failed");
    }

    return data.data;
  } catch (error) {
    // This will print the EXACT 4 validation errors in your console so you can see what failed
    console.error("❌ VALIDATION ERRORS:", error.response?.data?.errors);
    handleApiError(error, "Failed to create order");
  }
};

/* ================================================
   PAYMENT ORDER (RAZORPAY)
================================================ */
export const createPaymentOrder = async ({ orderId, amount }) => {
  try {
    if (!orderId || !amount) {
      throw new Error("OrderId and amount required");
    }

    const headers = await getAuthHeaders();

    const { data } = await API.post(
      "/payments/create-order",
      {
        orderId,
        amount: Number(amount),
      },
      { headers }
    );

    if (!data?.data?.id) {
      throw new Error("Payment order failed");
    }

    return data.data;
  } catch (error) {
    handleApiError(error, "Payment init failed");
  }
};

/* ================================================
   VERIFY PAYMENT
================================================ */
export const verifyPayment = async (payload) => {
  try {
    const headers = await getAuthHeaders();

    const { data } = await API.post(
      "/payments/verify",
      payload,
      { headers }
    );

    return data;
  } catch (error) {
    handleApiError(error, "Payment verification failed");
  }
};

/* ================================================
   GET ORDER DETAILS
================================================ */
export const getOrderDetails = async (orderId) => {
  try {
    const token = await getAuthToken();

    if (!token) {
      throw new Error("Login required");
    }

    const { data } = await API.get(`/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return data.data;
  } catch (error) {
    handleApiError(error, "Failed to fetch order");
  }
};

/* ================================================
   USER ORDERS
================================================ */
export const getUserOrders = async () => {
  try {
    const token = await getAuthToken();

    if (!token) {
      throw new Error("Login required");
    }

    const { data } = await API.get("/orders", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return data?.data || [];
  } catch (error) {
    handleApiError(error, "Failed to fetch orders");
  }
};

/* ================================================
   ORDER STATUS (GUEST SAFE)
================================================ */
export const getOrderStatus = async (orderId, email) => {
  try {
    const { data } = await API.get(
      `/orders/status/${orderId}?email=${encodeURIComponent(email || "")}`
    );

    return data.data;
  } catch (error) {
    handleApiError(error, "Failed to fetch status");
  }
};

/* ================================================
   EXPORT SERVICE
================================================ */
export const orderService = {
  createOrder,
  createPaymentOrder,
  verifyPayment,
  getOrderDetails,
  getUserOrders,
  getOrderStatus,
};