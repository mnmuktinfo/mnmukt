'use strict';

const { asyncHandler } = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const paymentService = require('../services/payment.service');
const { ApiError } = require('../utils/ApiError');

const razorpayWebhook = asyncHandler(async (req, res) => {
  const signatureHeader = req.headers['x-razorpay-signature'];
  if (!req.rawBody) throw ApiError.internal('Raw body unavailable for signature verification');

  const payload = req.body; // parsed for logic — signature is verified against rawBody, not this
  const eventId = payload?.id || req.headers['x-razorpay-event-id'];
  const eventType = payload?.event;

  if (!eventId || !eventType) throw ApiError.badRequest('Malformed webhook payload');

  const result = await paymentService.handleRazorpayWebhook({
    rawBody: req.rawBody,
    signatureHeader,
    eventId,
    eventType,
    payload,
  });

  return sendSuccess(res, { message: result.alreadyProcessed ? 'Already processed' : 'Webhook processed' });
});

module.exports = { razorpayWebhook };