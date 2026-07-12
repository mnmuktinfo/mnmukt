'use strict';

const { asyncHandler } = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');
const paymentService = require('../services/payment.service');

const razorpayWebhook = asyncHandler(async (req, res) => {
  const signatureHeader = req.headers['x-razorpay-signature'];
  // 👈 FIXED: header is the authoritative, documented dedup key per
  // Razorpay's own docs — a top-level payload.id isn't a reliable field
  // across their event payloads and shouldn't be preferred over it.
  const eventId = req.headers['x-razorpay-event-id'];

  if (!req.rawBody) {
    throw ApiError.internal('Raw body unavailable for signature verification');
  }
  if (!eventId) {
    throw ApiError.badRequest('Missing x-razorpay-event-id header');
  }

  const payload = req.body;
  const eventType = payload?.event;
  if (!eventType) {
    throw ApiError.badRequest('Malformed webhook payload');
  }

  const result = await paymentService.handleRazorpayWebhook({
    rawBody: req.rawBody,
    signatureHeader,
    eventId,
    eventType,
    payload,
  });

  return sendSuccess(res, {
    message: result.alreadyProcessed ? 'Already processed' : 'Webhook processed',
  });
});

module.exports = { razorpayWebhook };