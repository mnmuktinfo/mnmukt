import { PAYMENT_STATUS } from "../services/schema";

export const buildOrderPayload = ({
  idempotencyKey,
  items,
  shippingAddress,
  userUid,
  guestInfo,
  paymentMethod,
  pricing,
  customerNote = "",
}) => {
  if (!idempotencyKey) throw new Error("idempotencyKey is required");
  if (!items?.length) throw new Error("items are required");
  if (!shippingAddress) throw new Error("shippingAddress is required");
  if (!pricing) throw new Error("pricing is required");

  // Address -> OrderSchema
  const apiShippingAddress = {
    fullName: (shippingAddress.fullName || guestInfo?.name || "").trim(),
    phone: (shippingAddress.phone || guestInfo?.phone || "").trim(),
    addressLine1: (
      shippingAddress.line1 ||
      shippingAddress.addressLine1 ||
      ""
    ).trim(),
    addressLine2:
      (
        shippingAddress.line2 ||
        shippingAddress.addressLine2 ||
        ""
      ).trim() || undefined,
    city: (shippingAddress.city || "").trim(),
    district: (shippingAddress.district || "").trim() || undefined,
    state: (shippingAddress.state || "").trim(),
    postalCode: (
      shippingAddress.pincode ||
      shippingAddress.postalCode ||
      ""
    ).trim(),
    country:
      shippingAddress.country === "India"
        ? "IN"
        : shippingAddress.country || "IN",
    landmark: (shippingAddress.landmark || "").trim() || undefined,
    tag: (shippingAddress.tag || "Home").trim(),
  };

  // Cart Item -> OrderItemSchema
  const apiItems = items.map((item) => ({
    productId: String(item.productId),
    variantId: item.variantId || undefined,

    name: item.name,
    price: Number(item.price),
    quantity: Number(item.quantity),

    image: item.image,

    variant: {
      size: item.variant?.size || "",

      color: {
        name: item.variant?.color?.name || "",
        hex: item.variant?.color?.hex || "",
        image: item.variant?.color?.image || "",
      },
    },
  }));

  const apiPayload = {
    idempotencyKey,

    items: apiItems,

    shippingAddress: apiShippingAddress,

    pricing: {
      itemsTotal: Number(pricing.itemsTotal),
      shippingFee: Number(pricing.shippingFee || 0),
      codFee: Number(pricing.codFee || 0),
      discount: Number(pricing.discount || 0),
      tax: Number(pricing.tax || 0),
      totalAmount: Number(pricing.totalAmount),
      currency: pricing.currency || "INR",
    },

    userUid: userUid || null,

    guestInfo:
      !userUid && guestInfo
        ? {
            name: guestInfo.name?.trim(),
            email: guestInfo.email?.trim(),
            phone: guestInfo.phone?.trim(),
          }
        : undefined,

    payment: {
  status: PAYMENT_STATUS.PENDING,
  method: String(paymentMethod || "razorpay").toLowerCase(),
},

    notes: customerNote?.trim() || undefined,
  };

  return {
    apiPayload,
    displayPricing: pricing,
  };
};