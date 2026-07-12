// validations/order.validation.js

const { z } = require("zod");

/* ===========================================================
   ENUMS (match MongoDB Order model exactly)
=========================================================== */

const ORDER_STATUS = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "returned",
  "refunded",
];

/* ===========================================================
   ADDRESS
=========================================================== */

const addressSchema = z.object({
  fullName: z.string().trim().min(2).max(100),

  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid phone number"),

  addressLine1: z.string().trim().min(5).max(200),

  addressLine2: z.string().trim().max(200).optional(),

  city: z.string().trim().min(2).max(100),

  state: z.string().trim().min(2).max(100),

  country: z.string().trim().default("India"),

  // NOTE: renamed to match the mongoose schema field exactly (was a
  // "pincode" mismatch in the controller before — postalCode everywhere now)
  postalCode: z.string().regex(/^[1-9][0-9]{5}$/, "Invalid postal code"),
});

/* ===========================================================
   PRODUCT VARIANT
=========================================================== */

const variantSchema = z
  .object({
    color: z.string().optional(),
    size: z.string().optional(),
  })
  .partial()
  .optional();

/* ===========================================================
   ORDER ITEM
=========================================================== */

const orderItemSchema = z.object({
  productId: z.string().min(1),
  sku: z.string().min(1),
  slug: z.string().optional(),
  name: z.string().min(1),
  image: z.string().url(),
  variant: variantSchema,
  quantity: z.number().int().min(1).max(100),
  price: z.number().nonnegative(),
});

/* ===========================================================
   PRICING
   Frontend can send either naming convention; order.controller.js's
   mapPricingToSchema() normalizes both into the mongoose pricing shape.
=========================================================== */

const pricingSchema = z.object({
  subtotal: z.number().nonnegative(),

  itemDiscount: z.number().nonnegative().optional(),
  discount: z.number().nonnegative().optional(),
  couponDiscount: z.number().nonnegative().default(0),
  prepaidDiscount: z.number().nonnegative().default(0),
  bulkDiscount: z.number().nonnegative().default(0),

  shippingCharge: z.number().nonnegative().optional(),
  shipping: z.number().nonnegative().optional(),

  taxAmount: z.number().nonnegative().optional(),
  tax: z.number().nonnegative().optional(),

  total: z.number().positive(),
  totalPayable: z.number().positive().optional(),

  currency: z.enum(["INR"]).default("INR"),
});

/* ===========================================================
   CREATE ORDER

   Razorpay-only, guest + authenticated users both supported.

   For authenticated users:
   - Firebase token in header (middleware sets req.user)
   - Can omit customerEmail, customerName

   For guest users:
   - No Firebase token
   - Must provide: customerEmail, customerName
=========================================================== */

const createSchema = z
  .object({
    items: z
      .array(orderItemSchema)
      .min(1, "Order must have at least one item"),

    shippingAddress: addressSchema,

    pricing: pricingSchema,

    paymentMethod: z.enum(["cashfree", "cod"]),

    customerNote: z.string().trim().max(500).optional(),

    customerEmail: z.string().email("Invalid email format").nullable().optional(),
    customerName: z.string().min(2).max(100).nullable().optional(),
      userId: z.string().nullable().optional(),
    isGuest: z.boolean().optional(),
  })

  
  .strict()
  .refine(
    (data) => {
      // customerEmail/customerName are only truly required when there's no
      // authenticated user — that check happens in the controller (it knows
      // req.user), so this just checks the pair is provided together when present.
      if (data.customerEmail && !data.customerName) return false;
      if (data.customerName && !data.customerEmail) return false;
      return true;
    },
    { message: "customerEmail and customerName must be provided together", path: ["customerEmail"] }
  )
  .transform((data) => {
    const pricing = data.pricing;
    return {
      ...data,
      pricing: {
        subtotal: pricing.subtotal,
        itemDiscount: pricing.itemDiscount ?? pricing.discount ?? 0,
        couponDiscount: pricing.couponDiscount ?? 0,
        prepaidDiscount: pricing.prepaidDiscount ?? 0,
        bulkDiscount: pricing.bulkDiscount ?? 0,
        shippingCharge: pricing.shippingCharge ?? pricing.shipping ?? 0,
        taxAmount: pricing.taxAmount ?? pricing.tax ?? 0,
        total: pricing.total ?? pricing.totalPayable,
        currency: pricing.currency ?? "INR",
      },
    };
  });

/* ===========================================================
   UPDATE ORDER
=========================================================== */

const updateSchema = z
  .object({
    shippingAddress: addressSchema.optional(),
    customerNote: z.string().trim().max(500).optional(),
  })
  .strict();

/* ===========================================================
   ADMIN STATUS UPDATE
   courier/trackingNumber/trackingUrl are now actually persisted by
   order.controller.js's updateOrderStatus — this is the manual-shipping
   entry point, so these fields matter.
=========================================================== */

const updateStatusSchema = z
  .object({
    orderStatus: z.enum(ORDER_STATUS),

    message: z.string().trim().max(500).optional(),

    courier: z.string().trim().optional(),
    trackingNumber: z.string().trim().optional(),
    trackingUrl: z.string().trim().url().optional(),

    adminNote: z.string().trim().max(1000).optional(),
  })
  .strict();

/* ===========================================================
   PARAM VALIDATION
=========================================================== */

// For routes like /orders/:id, /orders/admin/:id — accepts either a
// Mongo _id or a human orderId string.
const idParamSchema = z.object({
  id: z.string().min(6),
});

// For /orders/status/:orderId — the param key is `orderId`, not `id`,
// so it needs its own schema (idParamSchema was being reused incorrectly
// against a param that doesn't exist on that route).
const orderIdParamSchema = z.object({
  orderId: z.string().min(6),
});

/* ===========================================================
   EXPORTS
=========================================================== */

const orderSchemas = {
  idParam: idParamSchema,
  orderIdParam: orderIdParamSchema,
  create: createSchema,
  update: updateSchema,
  updateStatus: updateStatusSchema,
};

module.exports = {
  orderSchemas,
};