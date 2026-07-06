'use strict';

const { z } = require("zod");

/* =========================
   ADDRESS
========================= */
const addressSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid phone number"),
  
  addressLine1: z.string().trim().min(5).max(200),
  addressLine2: z.string().trim().max(200).optional(),
  
  city: z.string().trim().min(2).max(100),
  district: z.string().trim().optional(), // 👈 Added: Frontend sends this
  state: z.string().trim().min(2).max(100),
  
  postalCode: z.string().regex(/^[1-9][0-9]{5}$/, "Invalid postal code"),
  
  country: z.string().default("IN"), // 👈 Changed: Frontend sends "IN"
  landmark: z.string().trim().optional(), // 👈 Added: Frontend sends this
  tag: z.string().trim().optional(), // 👈 Added: Frontend sends this ("Home", "Office")
});

/* =========================
   VARIANT (FIXED FOR FRONTEND)
========================= */
const variantSchema = z.object({
  // 👈 FIXED: Matches the { label, value } structure from the frontend
  size: z.object({
    label: z.string().optional().nullable(),
    value: z.string().optional().nullable(),
  }).optional().nullable(),
  
  color: z.object({
    name: z.string().optional().nullable(),
    hex: z.string().optional().nullable(),
  }).optional().nullable(),
}).optional().nullable();

/* =========================
   ORDER ITEM 
========================= */
const orderItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional().nullable(),
  name: z.string().min(1),
  quantity: z.number().int().min(1).max(100),
  
  price: z.number().nonnegative(), // 👈 FIXED: Matches frontend 'price'
  
  image: z.string().optional().nullable(),
  variant: variantSchema,
});

/* =========================
   PRICING
========================= */
const pricingSchema = z.object({
  itemsTotal: z.number().nonnegative(),
  shippingFee: z.number().nonnegative().default(0),
  discount: z.number().nonnegative().default(0),
  tax: z.number().nonnegative().default(0),
  totalAmount: z.number().nonnegative(),
  currency: z.string().default("INR"),
});

/* =========================
   CREATE ORDER
========================= */
const createSchema = z.object({
  idempotencyKey: z.string().min(6),
  
  items: z.array(orderItemSchema).min(1),
  shippingAddress: addressSchema,
  pricing: pricingSchema,

  // 👈 FIXED: Matches the nested payment object the frontend generates
  payment: z.object({
    status: z.string(),
    method: z.enum(["RAZORPAY", "COD"]), // 👈 FIXED: Uppercase to match schema.js
  }),

  // Optional fields for logged in users
  userUid: z.string().optional().nullable(),

  guestInfo: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
  }).optional().nullable(),

  notes: z.string().max(500).optional().nullable(),
});

/* =========================
   UPDATE STATUS
========================= */
const updateStatusSchema = z.object({
  toStatus: z.string().min(3),
  note: z.string().max(500).optional(),
});

/* =========================
   PARAMS
========================= */
const orderIdParamSchema = z.object({
  orderId: z.string().min(6),
});

/* =========================
   EXPORTS
========================= */
module.exports = {
  createOrderSchema: createSchema,
  updateOrderStatusSchema: updateStatusSchema,
  orderIdParamSchema,
};