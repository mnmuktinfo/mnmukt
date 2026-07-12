const isDev = typeof import.meta !== 'undefined' ? import.meta.env?.DEV : process.env.NODE_ENV !== 'production';

const RAZORPAY_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

// Keep your base URL pointing to the versioned API root
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || "http://localhost:5000/api/v1"; 

let razorpayScriptPromise = null;

export const PaymentService = {
  loadRazorpayScript: () => {
    if (window.Razorpay) {
      if (isDev) console.log("🌐 [PaymentService] Razorpay SDK already loaded.");
      return Promise.resolve(true);
    }

    if (razorpayScriptPromise) {
      if (isDev) console.log("🌐 [PaymentService] Razorpay SDK load already in progress, reusing promise.");
      return razorpayScriptPromise;
    }

    razorpayScriptPromise = new Promise((resolve) => {
      if (isDev) console.log("🌐 [PaymentService] Injecting Razorpay SDK script...");

      const script = document.createElement("script");
      script.src = RAZORPAY_SCRIPT_SRC;
      script.async = true;

      script.onload = () => {
        if (isDev) console.log("✅ [PaymentService] Razorpay SDK loaded successfully.");
        resolve(true);
      };

      script.onerror = () => {
        if (isDev) console.error("🚨 [PaymentService] Failed to load Razorpay SDK.");
        script.remove();
        razorpayScriptPromise = null;
        resolve(false);
      };

      document.body.appendChild(script);
    });

    return razorpayScriptPromise;
  },

  verifyPayment: async ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }, token) => {
    // 👈 FIX: Changed from `/api/payments/verify` to `/payments/verify`
    const res = await fetch(`${API_BASE_URL}/payments/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      }),
    });

    let data = null;
    try {
      data = await res.json();
    } catch {
      // non-JSON response body — fall through, res.ok check below still applies
    }

    if (!res.ok) {
      const message = data?.message || data?.error || "Payment verification failed";
      if (isDev) console.error("🚨 [PaymentService] verifyPayment failed:", message);
      throw new Error(message);
    }

    if (isDev) console.log("✅ [PaymentService] Payment verified successfully.");
    return data?.data ?? data;
  },
};