"use strict";

const Cashfree = require("../config/cashfree");
const crypto = require("crypto");

/**
 * Creates an order on Cashfree and returns the payment_session_id required
 * to launch Hosted Checkout on the frontend.
 *
 * @param {Object} params
 * @param {string} params.orderId - Internal order ID
 * @param {number} params.orderAmount - Final calculated order total
 * @param {string} [params.orderCurrency='INR']
 * @param {Object} params.customerDetails - { customerId, customerName, customerEmail, customerPhone }
 * @returns {Promise<{ paymentSessionId: string, cfOrderId: string, orderStatus: string }>}
 */
async function createCashfreeOrder({
  orderId,
  orderAmount,
  orderCurrency = "INR",
  customerDetails,
}) {
  if (!orderId) throw new Error("[cashfree.service] orderId is required");
  if (!orderAmount || orderAmount <= 0) {
    throw new Error("[cashfree.service] orderAmount must be a positive number");
  }
  if (!customerDetails?.customerId || !customerDetails?.customerPhone) {
    throw new Error("[cashfree.service] customerDetails.customerId and customerPhone are required");
  }

  const request = {
    order_id: orderId,
    order_amount: Number(orderAmount.toFixed(2)),
    order_currency: orderCurrency,
    customer_details: {
      customer_id: String(customerDetails.customerId),
      customer_name: customerDetails.customerName || "Customer",
      customer_email: customerDetails.customerEmail || "no-reply@example.com",
      customer_phone: String(customerDetails.customerPhone),
    },
    order_meta: {
      return_url: `${process.env.CLIENT_URL || process.env.FRONTEND_URL || "http://localhost:5173"}/payment/status?order_id={order_id}`,
      notify_url: `${process.env.BACKEND_URL || "http://localhost:5000"}/api/v1/payments/webhook`,
    },
  };

  try {
    const response = await Cashfree.PGCreateOrder("2023-08-01", request);
    if (!response || !response.data) {
      throw new Error("Cashfree did not return a valid response");
    }
    const data = response.data;
    return {
      paymentSessionId: data.payment_session_id,
      cfOrderId: data.order_id,
      orderStatus: data.order_status,
      raw: data,
    };
  } catch (error) {
    throw new Error(`[Cashfree] createCashfreeOrder failed: ${error.message}`);
  }
}

/**
 * Fetches the latest order status directly from Cashfree.
 *
 * @param {string} orderId - Cashfree order_id
 * @returns {Promise<{ orderStatus: string, raw: Object }>}
 */
async function fetchCashfreeOrderStatus(orderId) {
  if (!orderId) throw new Error("[cashfree.service] orderId is required");

  try {
    const response = await Cashfree.PGFetchOrder("2023-08-01", orderId);
    const data = response.data;
    return {
      orderStatus: data.order_status,
      raw: data,
    };
  } catch (error) {
    throw new Error(`[Cashfree] fetchCashfreeOrderStatus(${orderId}) failed: ${error.message}`);
  }
}

/**
 * Verifies a Cashfree webhook signature.
 *
 * @param {string} rawBody - Raw unparsed JSON string
 * @param {string} signature - x-webhook-signature header
 * @param {string} timestamp - x-webhook-timestamp header
 * @returns {boolean}
 */
function verifyWebhookSignature({ rawBody, signature, timestamp }) {
  try {
    Cashfree.PGVerifyWebhookSignature(signature, rawBody, timestamp);
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = {
  createCashfreeOrder,
  fetchCashfreeOrderStatus,
  verifyWebhookSignature,
};