// src/features/orders/services/checkout/orderPayload.service.js
import { calculatePricing } from "./pricing.service";

/**
 * Builds the payload for POST /orders. `pricing` is mapped onto the API's
 * canonical OrderPricingPayload shape — {subtotal, discount, shipping, tax,
 * total} — since that's what orderService.createOrder / the backend
 * actually reads. The backend recalculates subtotal/total itself from
 * `items`, so this is a best-effort hint, not the source of truth.
 *
 * IMPORTANT: `items` must already be normalized by the caller. This function
 * does NOT re-normalize — doing so previously ran normalizeItems twice per
 * checkout, which was harmless only because normalizeItems is idempotent.
 * Callers own normalization exactly once.
 */
export const buildOrderPayload = ({
  items,
  shippingAddress,
  paymentMethod,
  customer,
  pricing,
  customerNote = "",
}) => {
  const finalPricing = pricing || calculatePricing(items);

  return {
    customer,
    shippingAddress: {
      fullName: shippingAddress.fullName,
      email: shippingAddress.email || customer?.email || "",
      phone: shippingAddress.phone,
      addressLine1: shippingAddress.addressLine1,
      addressLine2: shippingAddress.addressLine2 || "",
      city: shippingAddress.city,
      district: shippingAddress.district || "",
      state: shippingAddress.state,
      postalCode: shippingAddress.postalCode,
      landmark: shippingAddress.landmark || "",
      tag: shippingAddress.tag || "Home",
      country: shippingAddress.country || "India",
    },
    paymentMethod,
    items,
    customerNote,
    pricing: {
      subtotal: finalPricing.subtotal,
      discount: finalPricing.itemDiscount,
      shipping: finalPricing.deliveryFee,
      tax: finalPricing.taxAmount,
      total: finalPricing.totalPayable,
    },
  };
};