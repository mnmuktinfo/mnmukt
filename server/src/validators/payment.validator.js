'use strict';

const { z } = require('zod');

const createRazorpayOrderSchema = z.object({
  orderId: z.string().min(1),
});

const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

module.exports = { createRazorpayOrderSchema, verifyPaymentSchema };