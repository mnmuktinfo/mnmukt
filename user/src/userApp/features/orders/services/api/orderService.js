const isDev = typeof import.meta !== 'undefined' ? import.meta.env?.DEV : process.env.NODE_ENV !== 'production';

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL)
  ? import.meta.env.VITE_API_URL
  : 'http://localhost:5000/api/v1';

const REQUEST_TIMEOUT_MS = 15000;

const apiFetch = async (endpoint, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (options.token) {
      headers['Authorization'] = `Bearer ${options.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    // No-content responses (e.g. 204) have no body to parse.
    if (response.status === 204) {
      if (!response.ok) {
        const err = new Error(`API Error: ${response.status}`);
        err.status = response.status;
        throw err;
      }
      return null;
    }

    const contentType = response.headers.get('content-type') || '';
    let data;

    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // Non-JSON body (HTML error page, proxy error, empty string, etc.)
      const text = await response.text();
      if (!response.ok) {
        const err = new Error(`API Error: ${response.status}`);
        err.status = response.status;
        throw err;
      }
      if (isDev) console.warn(`⚠️ [OrderService] Non-JSON 2xx response from ${endpoint}:`, text.slice(0, 200));
      data = null;
    }

    // 👇 NEW: Smarter error extraction to catch nested Mongoose validation errors
    if (!response.ok) {
      let errorMsg = data?.message || data?.error || `API Error: ${response.status}`;
      
      // Dig into Mongoose "errors" object
      if (data?.errors && typeof data.errors === 'object') {
        const detailedErrors = Object.values(data.errors)
          .map(e => e.message || e)
          .join(" | ");
        if (detailedErrors) errorMsg = `Validation: ${detailedErrors}`;
      } 
      // Dig into Joi/Zod "details" array
      else if (Array.isArray(data?.details)) {
        const detailedErrors = data.details.map(d => d.message).join(" | ");
        if (detailedErrors) errorMsg = `Validation: ${detailedErrors}`;
      }

      const err = new Error(errorMsg);
      err.status = response.status;
      err.rawData = data; // Attach full payload just in case
      throw err;
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      const timeoutErr = new Error('Request timed out. Please check your connection and try again.');
      timeoutErr.status = null;
      if (isDev) console.error(`🚨 [OrderService] Timeout at ${endpoint}`);
      throw timeoutErr;
    }
    if (isDev) console.error(`🚨 [OrderService] API Error at ${endpoint}:`, error);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

const unwrap = (response) => response?.data ?? response;

export const OrderService = {
 createOrder: async (apiPayload, token) => {
  try {
    const response = await apiFetch("/orders", {
      method: "POST",
      body: JSON.stringify(apiPayload),
      token,
    });

    return unwrap(response);
  } catch (err) {
    console.error("🚨 Order Create Failed");
    console.log("Payload:", apiPayload);
    console.log("Backend:", err.response);
    throw err;
  }
},

  getOrderById: async (orderId, token) => {
    const response = await apiFetch(`/orders/${orderId}`, {
      method: 'GET',
      token,
    });
    return unwrap(response);
  },

  getMyOrders: async (token) => {
    const response = await apiFetch('/orders', {
      method: 'GET',
      token,
    });
    return unwrap(response);
  },

  getSharedOrder: async (shareToken) => {
    const response = await apiFetch(`/orders/shared/${shareToken}`, {
      method: 'GET',
    });
    return unwrap(response);
  },

  createPaymentOrder: async (orderId, token) => {
    const response = await apiFetch('/payments/razorpay/order', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
      token,
    });
    return unwrap(response);
  },

  verifyPayment: async (paymentResponse, token) => {
    const response = await apiFetch('/payments/razorpay/verify', {
      method: 'POST',
      body: JSON.stringify(paymentResponse),
      token,
    });
    return unwrap(response);
  },
};