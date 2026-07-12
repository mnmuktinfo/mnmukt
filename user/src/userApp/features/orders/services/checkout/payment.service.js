// src/features/orders/services/checkout/payment.service.js
import { orderService } from "../orderService";
import { ERROR_MESSAGES } from "../schema";
import { load } from "@cashfreepayments/cashfree-js";

// =========================
// ORDER / PAYMENT API WRAPPERS
// =========================
export const createOrderAsync = async (payload) => {
  const order = await orderService.createOrder(payload);
  if (!order?.orderId) throw new Error(ERROR_MESSAGES.ORDER_CREATION_FAILED);
  return order;
};

export const createPaymentOrderAsync = async ({ orderId, customerEmail } = {}) => {
  const paymentOrder = await orderService.createPaymentOrder({ orderId, customerEmail });
  if (!paymentOrder?.payment_session_id) throw new Error(ERROR_MESSAGES.PAYMENT_ORDER_FAILED);
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
// CASHFREE SCRIPT LOADER
// =========================
export const loadCashfree = async () => {
  const cashfree = await load({
    mode: import.meta.env.VITE_CASHFREE_MODE || "sandbox",
  });
  return cashfree;
};