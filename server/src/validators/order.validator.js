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
  district: z.string().trim().optional(),
  state: z.string().trim().min(2).max(100),

  postalCode: z.string().regex(/^[1-9][0-9]{5}$/, "Invalid postal code"),

  country: z.string().default("IN"),
  landmark: z.string().trim().optional(),
  tag: z.string().trim().optional(),
});

/* =========================
   VARIANT
========================= */
const variantSchema = z
  .object({
    size: z.string().trim().optional().nullable(),

    color: z
      .object({
        name: z.string().trim().optional().nullable(),
        hex: z.string().trim().optional().nullable(),
image: z
  .string()
  .trim()
  .refine(
    (val) =>
      !val ||
      val.startsWith("http://") ||
      val.startsWith("https://"),
    {
      message: "Invalid image URL",
    }
  )
  .optional()
  .nullable(),      })
      .optional()
      .nullable(),
  })
  .optional()
  .nullable();

/* =========================
   ORDER ITEM
========================= */
const orderItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional().nullable(),

  name: z.string().min(1),

  quantity: z.number().int().min(1).max(100),

  price: z.number().nonnegative(),

  image: z.string().optional().nullable(),

  variant: variantSchema,
});

/* =========================
   PRICING
========================= */
const pricingSchema = z.object({
  itemsTotal: z.number().nonnegative(),

  shippingFee: z.number().nonnegative().default(0),

  codFee: z.number().nonnegative().default(0),

  discount: z.number().nonnegative().default(0),

  tax: z.number().nonnegative().default(0),

  totalAmount: z.number().nonnegative(),

  currency: z.string().default("INR"),
});

/* =========================
   PAYMENT
========================= */
const paymentSchema = z.object({
  status: z.string(),

  // Match your Mongoose schema
  method: z.enum(["razorpay", "cod"]),

  razorpayOrderId: z.string().optional().nullable(),
  razorpayPaymentId: z.string().optional().nullable(),
});

/* =========================
   GUEST INFO
========================= */
const guestInfoSchema = z
  .object({
    name: z.string().trim().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
  })
  .optional()
  .nullable();

/* =========================
   CREATE ORDER
========================= */
const createSchema = z.object({
  idempotencyKey: z.string().min(6),

  items: z.array(orderItemSchema).min(1),

  shippingAddress: addressSchema,

  pricing: pricingSchema,

  payment: paymentSchema,

  userUid: z.string().optional().nullable(),

  guestInfo: guestInfoSchema,

  notes: z.string().trim().max(500).optional().nullable(),
});

/* =========================
   UPDATE STATUS
========================= */
const updateStatusSchema = z.object({
  toStatus: z.string().min(3),
  note: z.string().trim().max(500).optional(),
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