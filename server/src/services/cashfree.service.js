/**
 * services/cashfree.service.js
 *
 * Thin, dependency-free service layer around the Cashfree Payment Gateway
 * REST API (Hosted Checkout flow only).
 *
 * Docs: https://www.cashfree.com/docs/api-reference/payments/latest/orders/create
 *
 * Required environment variables (see .env.example):
 *   CASHFREE_APP_ID        - x-client-id
 *   CASHFREE_SECRET_KEY    - x-client-secret (also used for webhook HMAC verification)
 *   CASHFREE_ENVIRONMENT   - "sandbox" | "production"
 *   FRONTEND_URL           - used to build the return_url sent to Cashfree
 *   BACKEND_URL            - used to build the notify_url (webhook) sent to Cashfree
 */

import axios from 'axios';
import crypto from 'crypto';

const {
  CASHFREE_APP_ID,
  CASHFREE_SECRET_KEY,
  CASHFREE_ENVIRONMENT,
  FRONTEND_URL,
  BACKEND_URL,
} = process.env;

if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
  // Fail fast on boot rather than failing silently on the first checkout attempt.
  throw new Error(
    '[cashfree.service] CASHFREE_APP_ID and CASHFREE_SECRET_KEY must be set in the environment.'
  );
}

const IS_PRODUCTION = (CASHFREE_ENVIRONMENT || 'sandbox').toLowerCase() === 'production';

const CASHFREE_BASE_URL = IS_PRODUCTION
  ? 'https://api.cashfree.com/pg'
  : 'https://sandbox.cashfree.com/pg';

// Cashfree API version. Keep this pinned explicitly (do not rely on Cashfree's
// implicit default) so a Cashfree-side default bump can never silently change
// our integration's behaviour.
const CASHFREE_API_VERSION = '2025-01-01';

const cashfreeClient = axios.create({
  baseURL: CASHFREE_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'x-api-version': CASHFREE_API_VERSION,
    'x-client-id': CASHFREE_APP_ID,
    'x-client-secret': CASHFREE_SECRET_KEY,
  },
});

/**
 * Normalizes Cashfree/axios errors into a single Error shape so callers
 * never have to think about axios internals.
 */
function normalizeCashfreeError(error, context) {
  const cfMessage =
    error?.response?.data?.message ||
    error?.response?.data?.error_description ||
    error?.message ||
    'Unknown Cashfree error';
  const err = new Error(`[Cashfree] ${context}: ${cfMessage}`);
  err.statusCode = error?.response?.status || 502;
  err.cashfreeResponse = error?.response?.data || null;
  return err;
}

/**
 * Creates an order on Cashfree and returns the payment_session_id required
 * to launch Hosted Checkout on the frontend.
 *
 * @param {Object} params
 * @param {string} params.orderId - Our internal, already-generated order id. Passed
 *                                  through as Cashfree's order_id so both systems
 *                                  share the same identifier (idempotency-friendly).
 * @param {number} params.orderAmount - Final, backend-calculated order total.
 * @param {string} [params.orderCurrency='INR']
 * @param {Object} params.customerDetails - { customerId, customerName, customerEmail, customerPhone }
 * @param {string} [params.idempotencyKey] - Optional explicit idempotency key. If not
 *                                            provided, orderId is reused, which is safe
 *                                            because Cashfree order_ids must be unique anyway.
 * @returns {Promise<{ paymentSessionId: string, cfOrderId: string, orderStatus: string, raw: Object }>}
 */
export async function createCashfreeOrder({
  orderId,
  orderAmount,
  orderCurrency = 'INR',
  customerDetails,
  idempotencyKey,
}) {
  if (!orderId) throw new Error('[cashfree.service] orderId is required');
  if (!orderAmount || orderAmount <= 0) {
    throw new Error('[cashfree.service] orderAmount must be a positive number');
  }
  if (!customerDetails?.customerId || !customerDetails?.customerPhone) {
    throw new Error('[cashfree.service] customerDetails.customerId and customerPhone are required');
  }

  const payload = {
    order_id: orderId,
    order_amount: Number(orderAmount.toFixed(2)),
    order_currency: orderCurrency,
    customer_details: {
      customer_id: String(customerDetails.customerId),
      customer_name: customerDetails.customerName || 'Customer',
      customer_email: customerDetails.customerEmail || 'no-reply@example.com',
      customer_phone: String(customerDetails.customerPhone),
    },
    order_meta: {
      // {order_id} placeholder is substituted by Cashfree on redirect.
      return_url: `${FRONTEND_URL}/payment/status?order_id={order_id}`,
      notify_url: `${BACKEND_URL}/api/payment/webhook`,
    },
    order_note: 'Ecommerce order checkout',
  };

  try {
    const headers = idempotencyKey ? { 'x-idempotency-key': idempotencyKey } : {};
    const { data } = await cashfreeClient.post('/orders', payload, { headers });

    if (!data?.payment_session_id) {
      throw new Error('Cashfree did not return a payment_session_id');
    }

    return {
      paymentSessionId: data.payment_session_id,
      cfOrderId: data.order_id,
      orderStatus: data.order_status,
      raw: data,
    };
  } catch (error) {
    if (error.isAxiosError === undefined && error instanceof Error && !error.response) {
      // Already one of our own thrown errors (validation) - rethrow as-is.
      throw error;
    }
    throw normalizeCashfreeError(error, 'createCashfreeOrder failed');
  }
}

/**
 * Fetches the latest order status directly from Cashfree. Used as a fallback
 * / reconciliation check — the webhook remains the source of truth, but this
 * lets the status page and status API poll Cashfree if a webhook is delayed.
 *
 * @param {string} orderId - Cashfree order_id (same as our internal order id)
 * @returns {Promise<{ orderStatus: string, raw: Object }>}
 */
export async function fetchCashfreeOrderStatus(orderId) {
  if (!orderId) throw new Error('[cashfree.service] orderId is required');

  try {
    const { data } = await cashfreeClient.get(`/orders/${encodeURIComponent(orderId)}`);
    return {
      orderStatus: data.order_status, // ACTIVE | PAID | EXPIRED | TERMINATED
      raw: data,
    };
  } catch (error) {
    throw normalizeCashfreeError(error, `fetchCashfreeOrderStatus(${orderId}) failed`);
  }
}

/**
 * Fetches all payment attempts for an order. Useful to pull the final
 * payment method, cf_payment_id, and failure reason for storage.
 *
 * @param {string} orderId - Cashfree order_id
 * @returns {Promise<Array<Object>>}
 */
export async function fetchCashfreeOrderPayments(orderId) {
  if (!orderId) throw new Error('[cashfree.service] orderId is required');

  try {
    const { data } = await cashfreeClient.get(`/orders/${encodeURIComponent(orderId)}/payments`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    throw normalizeCashfreeError(error, `fetchCashfreeOrderPayments(${orderId}) failed`);
  }
}

/**
 * Verifies a Cashfree webhook signature.
 *
 * Cashfree signs `x-webhook-timestamp + rawBody` with HMAC-SHA256 using your
 * secret key, then base64-encodes the digest into the `x-webhook-signature`
 * header. The raw (unparsed) request body MUST be used — JSON.stringify(JSON.parse(body))
 * is not guaranteed to reproduce the exact bytes Cashfree signed.
 *
 * @param {Object} params
 * @param {string} params.rawBody - Exact raw request body string/Buffer as received.
 * @param {string} params.signature - Value of the `x-webhook-signature` header.
 * @param {string} params.timestamp - Value of the `x-webhook-timestamp` header.
 * @returns {boolean}
 */
export function verifyWebhookSignature({ rawBody, signature, timestamp }) {
  if (!rawBody || !signature || !timestamp) return false;

  const bodyString = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : rawBody;
  const signedPayload = `${timestamp}${bodyString}`;

  const expectedSignature = crypto
    .createHmac('sha256', CASHFREE_SECRET_KEY)
    .update(signedPayload)
    .digest('base64');

  const expectedBuffer = Buffer.from(expectedSignature);
  const receivedBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== receivedBuffer.length) return false;

  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

export default {
  createCashfreeOrder,
  fetchCashfreeOrderStatus,
  fetchCashfreeOrderPayments,
  verifyWebhookSignature,
};