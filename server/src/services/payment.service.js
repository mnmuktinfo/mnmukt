'use strict';

const crypto = require('crypto');
const { razorpay } = require('../config/razorpay');
const { env } = require('../config/env');
const Order = require('../models/order.model');
const { WebhookEvent } = require('../models/webhookEvent.model');
const { PAYMENT_STATUS } = require('../constants/paymentStatus');
const { ApiError } = require('../utils/ApiError');
const { logger } = require('../utils/logger');
const { markOrderConfirmedAfterPayment } = require('./order.service');
const { sendOrderConfirmationEmail } = require('./email.service');

/** Creates a Razorpay order using the server-calculated amount only. */
async function createRazorpayOrder(orderId) {
  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound('Order not found');

  if (order.payment.status === PAYMENT_STATUS.PAID) {
    throw ApiError.conflict('Order has already been paid');
  }

  // Reuse an existing pending Razorpay order instead of minting a new one
  // on every retry/page-reload — avoids orphaned duplicate orders.
  if (order.payment.razorpayOrderId && order.payment.status === PAYMENT_STATUS.PENDING) {
    return {
      razorpayOrderId: order.payment.razorpayOrderId,
      amount: Math.round(order.pricing.totalAmount * 100),
      currency: order.pricing.currency,
      keyId: env.RAZORPAY_KEY_ID,
    };
  }

  if (!order.pricing?.totalAmount || order.pricing.totalAmount <= 0) {
    throw ApiError.badRequest('Order has no valid amount to charge');
  }
  if (!order.pricing?.currency) {
    throw ApiError.badRequest('Order is missing a currency');
  }

  const amountInPaise = Math.round(order.pricing.totalAmount * 100);

  const razorpayOrder = await razorpay.orders.create({
    amount: amountInPaise,
    currency: order.pricing.currency,
    receipt: order.idempotencyKey,
    payment_capture: 1, // don't rely on dashboard config — capture explicitly
    notes: { orderId: order._id.toString() },
  });

  order.payment.razorpayOrderId = razorpayOrder.id;
  order.payment.status = PAYMENT_STATUS.PENDING;
  await order.save();

  return {
    razorpayOrderId: razorpayOrder.id,
    amount: amountInPaise,
    currency: order.pricing.currency,
    keyId: env.RAZORPAY_KEY_ID,
  };
}

/** Constant-time comparison — never use === on signatures/secrets. */
function safeCompare(a, b) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function computeSignature(payload, secret) {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

/**
 * Verifies payment after client-side checkout completes. This is the primary
 * confirmation path; the webhook is a fallback in case this call is missed.
 */
async function verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = computeSignature(payload, env.RAZORPAY_KEY_SECRET);

  if (!safeCompare(expectedSignature, razorpaySignature)) {
    logger.warn({ razorpayOrderId, razorpayPaymentId }, 'Invalid payment signature on client verify');
    throw ApiError.badRequest('Invalid payment signature');
  }

  const order = await Order.findOne({ 'payment.razorpayOrderId': razorpayOrderId });
  if (!order) throw ApiError.notFound('Order not found for this payment');

  // Atomic guard: only the first caller to see "pending" flips it to "paid".
  const updated = await Order.findOneAndUpdate(
    { _id: order._id, 'payment.status': { $ne: PAYMENT_STATUS.PAID } },
    {
      $set: {
        'payment.status': PAYMENT_STATUS.PAID,
        'payment.razorpayPaymentId': razorpayPaymentId,
        'payment.razorpaySignature': razorpaySignature,
        'payment.paidAt': new Date(),
      },
    },
    { new: true }
  );

  if (updated) {
    await markOrderConfirmedAfterPayment(updated._id, 'razorpay:signature-verify');
    sendOrderConfirmationEmail(updated).catch((err) =>
      logger.error({ err, orderId: updated._id }, 'Failed to send order confirmation email')
    );
  }

  return updated || order; // idempotent: already-paid orders just return current state
}

/**
 * Handles Razorpay webhooks. Verifies signature against the RAW request body
 * (never the parsed/re-serialized object). Uses WebhookEvent's unique index
 * for fast dedup, but rolls the event record back if downstream processing
 * fails — otherwise a legitimate retry would be swallowed as "duplicate"
 * before the order was ever actually updated.
 */
async function handleRazorpayWebhook({ rawBody, signatureHeader, eventId, eventType, payload }) {
  const expectedSignature = computeSignature(rawBody, env.RAZORPAY_WEBHOOK_SECRET);

  if (!signatureHeader || !safeCompare(expectedSignature, signatureHeader)) {
    logger.warn({ eventId, eventType }, 'Invalid webhook signature');
    throw ApiError.badRequest('Invalid webhook signature');
  }

  let eventRecord;
  try {
    eventRecord = await WebhookEvent.create({ eventId, provider: 'razorpay', eventType });
  } catch (err) {
    if (err.code === 11000) {
      logger.info({ eventId }, 'Duplicate webhook event ignored');
      return { alreadyProcessed: true };
    }
    throw err;
  }

  try {
    if (eventType === 'payment.captured') {
      const razorpayOrderId = payload.payment.entity.order_id;
      const razorpayPaymentId = payload.payment.entity.id;

      const updated = await Order.findOneAndUpdate(
        { 'payment.razorpayOrderId': razorpayOrderId, 'payment.status': { $ne: PAYMENT_STATUS.PAID } },
        {
          $set: {
            'payment.status': PAYMENT_STATUS.PAID,
            'payment.razorpayPaymentId': razorpayPaymentId,
            'payment.paidAt': new Date(),
          },
        },
        { new: true }
      );

      if (updated) {
        await markOrderConfirmedAfterPayment(updated._id, 'razorpay:webhook');
        sendOrderConfirmationEmail(updated).catch((err) =>
          logger.error({ err, orderId: updated._id }, 'Failed to send order confirmation email')
        );
      }
    }

    if (eventType === 'payment.failed') {
      const razorpayOrderId = payload.payment.entity.order_id;
      await Order.findOneAndUpdate(
        { 'payment.razorpayOrderId': razorpayOrderId, 'payment.status': PAYMENT_STATUS.PENDING },
        { $set: { 'payment.status': PAYMENT_STATUS.FAILED } }
      );
    }

    return { alreadyProcessed: false };
  } catch (err) {
    // Processing failed after we recorded the event — remove the record so
    // Razorpay's retry of this eventId isn't dropped as a false duplicate.
    await WebhookEvent.deleteOne({ _id: eventRecord._id }).catch((delErr) =>
      logger.error({ delErr, eventId }, 'Failed to roll back webhook event record after processing error')
    );
    throw err;
  }
}

module.exports = { createRazorpayOrder, verifyPaymentSignature, handleRazorpayWebhook };