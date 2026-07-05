// src/features/orders/services/checkout/payment.service.js
import { orderService } from "../orderService";
import { ERROR_MESSAGES } from "../schema";

// =========================
// ORDER / PAYMENT API WRAPPERS
// =========================
export const createOrderAsync = async (payload) => {
  const order = await orderService.createOrder(payload);
  if (!order?.orderId) throw new Error(ERROR_MESSAGES.ORDER_CREATION_FAILED);
  return order;
};

// NOTE: the backend always charges order.pricing.total from the DB — no
// `amount` is sent here. `customerEmail` matters for guests only.
export const createPaymentOrderAsync = async ({ orderId, customerEmail } = {}) => {
  const paymentOrder = await orderService.createPaymentOrder({ orderId, customerEmail });
  if (!paymentOrder?.id) throw new Error(ERROR_MESSAGES.PAYMENT_ORDER_FAILED);
  return paymentOrder;
};

export const verifyPaymentAsync = async (data) => {
  const result = await orderService.verifyPayment(data);
  if (!result?.success && !result?.data?.success) {
    throw new Error(ERROR_MESSAGES.PAYMENT_VERIFICATION_FAILED);
  }
  return result;
};

// =========================
// RAZORPAY SCRIPT LOADER
// =========================
export const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);

    // Guard against loading the script twice if called again before the
    // first <script> tag finishes (e.g. user retries checkout quickly).
    const existing = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });