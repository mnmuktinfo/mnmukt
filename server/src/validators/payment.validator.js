'use strict';

const { z } = require('zod');

/* =========================
   CREATE RAZORPAY ORDER
========================= */
const createRazorpayOrderSchema = z.object({
  orderId: z.string().min(1),
});

/* =========================
   VERIFY RAZORPAY PAYMENT
========================= */
const verifyPaymentSchema = z.object({
  orderId: z.string().min(1),

  razorpayOrderId: z.string().min(1),

  razorpayPaymentId: z.string().min(1),

  razorpaySignature: z.string().min(1),
});

/* =========================
   UPDATE PAYMENT METHOD
========================= */
const paymentMethodSchema = z.object({
  orderId: z.string().min(1),

  method: z.enum(['razorpay', 'cod']),
});

module.exports = {
  createRazorpayOrderSchema,
  verifyPaymentSchema,
  paymentMethodSchema,
};