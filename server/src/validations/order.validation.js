// validations/order.validation.js

const { z } = require("zod");

/* ===========================================================
   ENUMS (match MongoDB Order model exactly)
=========================================================== */

const ORDER_STATUS = [
  "pending",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "returned",
  "refunded",
  "on_hold",
];

// ✅ MATCHES MONGODB: PAYMENT_GATEWAY enum
const PAYMENT_GATEWAY = [
  "razorpay",
  "stripe",
  "phonepe",
  "paytm",
  "cashfree",
  "cod",
  "bank_transfer",
  "whatsapp",
];

const ORDER_SOURCE = ["web", "mobile", "whatsapp", "admin", "api"];

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

  postalCode: z.string().regex(/^[1-9][0-9]{5}$/, "Invalid postal code"),

  landmark: z.string().trim().max(200).optional(),
});

/* ===========================================================
   PRODUCT VARIANT
=========================================================== */

const variantSchema = z
  .object({
    color: z.string().optional(),
    size: z.string().optional(),
    weight: z.string().optional(),
    other: z.string().optional(),
  })
  .partial()
  .optional();

/* ===========================================================
   ORDER ITEM
=========================================================== */

const orderItemSchema = z.object({
  productId: z.string().min(1),

  sku: z.string().optional(),

  name: z.string().min(1),

  brand: z.string().optional(),

  category: z.string().optional(),

  image: z.string().optional(),

  variant: variantSchema,

  quantity: z.number().int().min(1).max(100),

  unitPrice: z.number().nonnegative(),

  mrp: z.number().nonnegative().optional(),

  totalPrice: z.number().nonnegative(),

  // GST at item level
  gst: z
    .object({
      rate: z.number().nonnegative().optional(),
      amount: z.number().nonnegative().optional(),
      hsn: z.string().optional(),
    })
    .optional(),
});

/* ===========================================================
   PRICING
   
   Supports both naming conventions:
   - itemDiscount, shippingCharge, taxAmount (model format)
   - discount, shipping, tax (frontend format)
=========================================================== */

const pricingSchema = z.object({
  subtotal: z.number().nonnegative(),

  // Item discount (both field names supported)
  itemDiscount: z.number().nonnegative().optional(),
  discount: z.number().nonnegative().optional(),

  couponDiscount: z.number().nonnegative().default(0),

  prepaidDiscount: z.number().nonnegative().default(0),

  bulkDiscount: z.number().nonnegative().default(0),

  // Shipping (both field names supported)
  shippingCharge: z.number().nonnegative().optional(),
  shipping: z.number().nonnegative().optional(),

  // Tax (both field names supported)
  taxAmount: z.number().nonnegative().optional(),
  tax: z.number().nonnegative().optional(),

  roundOff: z.number().default(0),

  // Total (both field names supported)
  total: z.number().positive(),
  totalPayable: z.number().positive().optional(),

  currency: z.enum(["INR"]).default("INR"),
});

/* ===========================================================
   CREATE ORDER
   
   ✅ UPDATED: Now supports BOTH authenticated and guest users
   
   For authenticated users:
   - Firebase token in header (middleware sets req.user)
   - Can omit customerEmail, customerName
   - Will use user profile data
   
   For guest users:
   - No Firebase token
   - Must provide: customerEmail, customerName
   - isGuest must be true
   
   Example guest payload:
   {
     items: [...],
     shippingAddress: {...},
     pricing: {...},
     paymentMethod: "razorpay",
     isGuest: true,
     customerEmail: "guest@example.com",
     customerName: "Guest User"
   }
   
   Example auth payload:
   {
     items: [...],
     shippingAddress: {...},
     pricing: {...},
     paymentMethod: "razorpay"
   }
=========================================================== */

const createSchema = z
  .object({
    orderId: z.string().min(6).max(50).optional(),

    items: z
      .array(orderItemSchema)
      .min(1, "Order must have at least one item"),

    shippingAddress: addressSchema,

    pricing: pricingSchema,

    // Payment method
    paymentMethod: z.enum(PAYMENT_GATEWAY),

    // Order source channel
    source: z.enum(ORDER_SOURCE).default("web"),

    // Optional customer note
    customerNote: z.string().trim().max(500).optional(),

    // ✅ NEW: Guest user fields (optional - only required if isGuest=true)
    isGuest: z.boolean().default(false),
    customerEmail: z
      .string()
      .email("Invalid email format")
      .nullable()
      .optional(),
    customerName: z.string().min(2).max(100).nullable().optional(),
    userId: z.string().nullable().optional(), // For explicit userId (usually from middleware)
  })
  .strict()
  .refine(
    (data) => {
      // If isGuest is true, must have customerEmail and customerName
      if (data.isGuest) {
        return data.customerEmail && data.customerName;
      }
      return true;
    },
    {
      message: "Guest users must provide customerEmail and customerName",
      path: ["isGuest"],
    }
  )
  .transform((data) => {
    // ✅ Normalize pricing field names for consistency
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
        roundOff: pricing.roundOff ?? 0,
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
=========================================================== */

const updateStatusSchema = z
  .object({
    orderStatus: z.enum(ORDER_STATUS),

    courier: z.string().trim().optional(),

    trackingNumber: z.string().trim().optional(),

    trackingUrl: z.string().trim().optional(),

    adminNote: z.string().trim().max(1000).optional(),
  })
  .strict();

/* ===========================================================
   PARAM VALIDATION
=========================================================== */

const idParamSchema = z.object({
  id: z.string().min(6),
});

/* ===========================================================
   EXPORTS
=========================================================== */

const orderSchemas = {
  idParam: idParamSchema,
  create: createSchema,
  update: updateSchema,
  updateStatus: updateStatusSchema,
};

module.exports = {
  orderSchemas,
};