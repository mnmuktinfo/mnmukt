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

  // Map exactly to Mongoose AddressSchema
  const apiShippingAddress = {
    fullName: (shippingAddress.fullName || guestInfo?.name || "").trim(),
    phone: (shippingAddress.phone || guestInfo?.phone || "").trim(),
    addressLine1: (shippingAddress.line1 || shippingAddress.addressLine1 || "").trim(),
    addressLine2: (shippingAddress.line2 || shippingAddress.addressLine2 || "").trim() || undefined,
    city: (shippingAddress.city || "").trim(),
    district: (shippingAddress.district || "").trim() || undefined,
    state: (shippingAddress.state || "").trim(),
    postalCode: (shippingAddress.pincode || shippingAddress.postalCode || "").trim(),
    country: shippingAddress.country === "India" ? "IN" : (shippingAddress.country || "IN"),
    landmark: (shippingAddress.landmark || "").trim() || undefined,
    tag: (shippingAddress.tag || "Home").trim(),
  };

  const apiPayload = {
    idempotencyKey,
    items,
    shippingAddress: apiShippingAddress,
    pricing, 
    userUid: userUid || null,
    guestInfo: !userUid && guestInfo ? {
      name: guestInfo.name?.trim(),
      email: guestInfo.email?.trim(),
      phone: guestInfo.phone?.trim(),
    } : undefined,
    payment: {
      status: PAYMENT_STATUS.PENDING,
      method: paymentMethod, 
    },
    notes: customerNote?.trim() || undefined,
  };

  return { apiPayload, displayPricing: pricing };
};