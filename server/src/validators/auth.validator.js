'use strict';

const { z } = require('zod');

const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});
// Note: unitPrice/subtotal are intentionally NOT accepted from the client.

const guestInfoSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email(),
  phone: z.string().min(7).max(15),
});

const shippingAddressSchema = z.object({
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().min(4).max(10),
  country: z.string().default('IN'),
});

const createOrderSchema = z.object({
  idempotencyKey: z.string().min(10, 'idempotencyKey must be a unique client-generated string'),
  items: z.array(orderItemSchema).min(1),
  guestInfo: guestInfoSchema.optional(),
  shippingAddress: shippingAddressSchema,
  notes: z.string().max(500).optional(),
});

const updateOrderStatusSchema = z.object({
  toStatus: z.enum([
    'pending', 'confirmed', 'processing', 'shipped',
    'out_for_delivery', 'delivered', 'cancelled', 'returned', 'refunded',
  ]),
  note: z.string().max(500).optional(),
});

module.exports = { createOrderSchema, updateOrderStatusSchema };