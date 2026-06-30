import { auth } from "../../config/firebaseauth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";


/* ==========================================================
   STATUS MAPPING
========================================================== */
const mapServerStatusToUi = (serverStatus) => {
  if (serverStatus === "processing" || serverStatus === "packed") return "packaging";
  if (serverStatus === "shipped" || serverStatus === "out_for_delivery") return "shipping";
  return serverStatus;
};

const mapUiStatusToServer = (uiStatus) => {
  if (uiStatus === "packaging") return "processing";
  if (uiStatus === "shipping") return "shipped";
  return uiStatus;
};

/* ==========================================================
   DATA MAPPING (MongoDB -> Legacy Firestore)
========================================================== */
const mapServerOrderToLegacy = (serverOrder) => {
  const id = serverOrder.orderId || serverOrder._id || serverOrder.id;
  
  let status = mapServerStatusToUi(serverOrder.orderStatus || "pending");
  
  // ✅ AUTO-CONFIRM: If the order is pending but the payment is already paid, promote it to confirmed.
  // This bypasses the "Authorize Order" step for prepaid orders.
  if (status === "pending" && serverOrder.payment?.status === "paid") {
    status = "confirmed";
  }
  
  const mapped = {
    id: id,
    status: status,
    createdAt: serverOrder.createdAt ? {
      toDate: () => new Date(serverOrder.createdAt)
    } : null,
    totalAmount: serverOrder.pricing?.total || serverOrder.totalAmount || 0,
    userSnapshot: {
      name: serverOrder.customer?.name || "Guest",
      phone: serverOrder.customer?.phone || "",
      email: serverOrder.customer?.email || "",
    },
    deliveryAddress: {
      name: serverOrder.shippingAddress?.fullName || serverOrder.customer?.name || "",
      phone: serverOrder.shippingAddress?.phone || serverOrder.customer?.phone || "",
      line1: [serverOrder.shippingAddress?.addressLine1, serverOrder.shippingAddress?.addressLine2].filter(Boolean).join(", "),
      city: serverOrder.shippingAddress?.city || "",
      state: serverOrder.shippingAddress?.state || "",
      pincode: serverOrder.shippingAddress?.postalCode || "",
    },
    items: (serverOrder.items || []).map(item => ({
      name: item.name || "",
      quantity: item.quantity || 1,
      price: item.unitPrice || item.price || 0,
      image: item.image || "",
    })),
    paymentDetails: {
      method: serverOrder.payment?.method || "",
      status: serverOrder.payment?.status || "pending",
      gateway: serverOrder.payment?.gateway || "",
    },
    raw: serverOrder
  };


  return mapped;
};

/* ==========================================================
   AUTH TOKEN HELPER (Handles Firebase Auth Initialization Race Condition)
========================================================== */
const getAuthToken = () => {
  return new Promise((resolve) => {
    // 1. If auth.currentUser is already available, use it immediately
    if (auth.currentUser) {
      auth.currentUser.getIdToken()
        .then((token) => {
          resolve(token);
        })
        .catch((err) => {
          console.error("❌ [AdminOrderService] Error getting token from currentUser:", err);
          resolve(null);
        });
      return;
    }

    // 2. Otherwise, wait for the Auth state to initialize
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      if (user) {
        user.getIdToken()
          .then((token) => {
            resolve(token);
          })
          .catch((err) => {
            console.error("❌ [AdminOrderService] Error getting token after Auth initialization:", err);
            resolve(null);
          });
      } else {
        console.warn("⚠️ [AdminOrderService] Firebase Auth initialized, but no user is logged in.");
        resolve(null);
      }
    });
  });
};

/* ==========================================================
   SERVICE FUNCTIONS
========================================================== */

/**
 * Fetches orders from the server with pagination, status filtering, and search.
 * @param {Number} page
 * @param {Number} limit
 * @param {String} status
 * @param {String} search
 * @returns {Promise<{orders: Array, pagination: Object}>}
 */
export const fetchOrdersService = async (page = 1, limit = 15, status = "all", search = "") => {
  try {
    const token = await getAuthToken();
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      status,
      ...(search ? { search: search.trim() } : {}),
    });

    const response = await fetch(`${API_URL}/orders/admin?${queryParams}`, { headers });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Failed to fetch orders (Status ${response.status})`);
    }

    const { data, pagination } = await response.json();

    const mappedOrders = (data || []).map(mapServerOrderToLegacy);
    return { orders: mappedOrders, pagination };
  } catch (error) {
    console.error("❌ [AdminOrderService] Error in fetchOrdersService:", error);
    throw error;
  }
};

/**
 * Updates the status of a specific order, handling sequential transitions if required.
 * @param {String} orderId 
 * @param {String} newStatus 
 * @param {Object} [dispatchData] - Optional courier and tracking details
 */
export const updateOrderStatusService = async (orderId, newStatus, dispatchData = null) => {
  try {
    const token = await getAuthToken();
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    // 1. Fetch current order status from the server to determine the starting point
    const response = await fetch(`${API_URL}/orders/admin/${orderId}`, { headers });
    if (!response.ok) {
      throw new Error(`Failed to fetch order details for transition (Status ${response.status})`);
    }
    const { data: order } = await response.json();
    const currentServerStatus = order.orderStatus;
    const targetServerStatus = mapUiStatusToServer(newStatus);


    if (currentServerStatus === targetServerStatus) {
      return true;
    }

    // Helper to send the PATCH status request
    const patchStatus = async (status) => {
      
      const bodyPayload = { orderStatus: status };
      
      // If we are dispatching, attach courier and tracking details
      if (status === "shipped" && dispatchData) {
        bodyPayload.courier = dispatchData.courier || "";
        bodyPayload.trackingNumber = dispatchData.trackingNumber || "";
        if (dispatchData.trackingUrl && dispatchData.trackingUrl.trim() !== "") {
          bodyPayload.trackingUrl = dispatchData.trackingUrl.trim();
        }
      }

      const res = await fetch(`${API_URL}/orders/admin/${orderId}/status`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(bodyPayload),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Failed to update status to "${status}" (Status ${res.status})`);
      }
      const result = await res.json();
      return result;
    };

    // Define the linear forward path of statuses
    const STATUS_ORDER = [
      "pending",
      "confirmed",
      "processing",
      "packed",
      "shipped",
      "out_for_delivery",
      "delivered"
    ];

    const currentIndex = STATUS_ORDER.indexOf(currentServerStatus);
    const targetIndex = STATUS_ORDER.indexOf(targetServerStatus);

    // 2. Perform sequential transitions if moving forward in the linear lifecycle
    if (currentIndex !== -1 && targetIndex !== -1 && targetIndex > currentIndex) {
      for (let i = currentIndex + 1; i <= targetIndex; i++) {
        const nextStatus = STATUS_ORDER[i];
        await patchStatus(nextStatus);
      }
    } else {
      // Fallback to direct transition (e.g. cancelling or custom status)
      await patchStatus(targetServerStatus);
    }

    return true;
  } catch (error) {
    console.error(`❌ [AdminOrderService] Error in updateOrderStatusService for #${orderId}:`, error);
    throw error;
  }
};

/**
 * Soft deletes an order.
 * @param {String} orderId 
 */
export const deleteOrderService = async (orderId) => {
  try {
    const token = await getAuthToken();
    const headers = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const response = await fetch(`${API_URL}/orders/admin/${orderId}`, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Failed to delete order (Status ${response.status})`);
    }

    return true;
  } catch (error) {
    console.error(`❌ [AdminOrderService] Error in deleteOrderService for #${orderId}:`, error);
    throw error;
  }
};

