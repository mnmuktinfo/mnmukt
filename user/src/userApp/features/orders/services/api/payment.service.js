const isDev = typeof import.meta !== 'undefined' ? import.meta.env?.DEV : process.env.NODE_ENV !== 'production';

const RAZORPAY_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || "http://localhost:5000/api/v1"; // adjust to your actual env var name

// Cache the in-flight load promise so concurrent callers share one script tag
// instead of each racing to inject their own before `window.Razorpay` exists.
let razorpayScriptPromise = null;

export const PaymentService = {
  /**
   * Dynamically injects the Razorpay SDK into the browser.
   * Resolves immediately if it's already loaded, and reuses the in-flight
   * promise if a load is already underway, to prevent duplicate script tags.
   */
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
        // Remove the failed tag and clear the cached promise so a later
        // call (e.g. after the user's network recovers) can retry cleanly.
        script.remove();
        razorpayScriptPromise = null;
        resolve(false);
      };

      document.body.appendChild(script);
    });

    return razorpayScriptPromise;
  },

  /**
   * Sends the Razorpay checkout response to the backend for signature
   * verification. Throws on network failure or a non-2xx response so the
   * caller's handler can reject the payment promise instead of treating it
   * as a success.
   */
  verifyPayment: async ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }, token) => {
    const res = await fetch(`${API_BASE_URL}/api/payments/verify`, {
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