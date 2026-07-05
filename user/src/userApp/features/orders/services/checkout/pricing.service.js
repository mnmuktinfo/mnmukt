
// src/features/orders/services/checkout/pricing.service.js
import { PRICING_DEFAULTS } from "../schema";

/**
 * @param {Array} normalizedItems - items already passed through normalizeItems.
 * @param {{ shippingOverride?: number }} options - shippingOverride is the
 *   confirmed PIN-based delivery charge (from useShippingServiceability). If
 *   provided and valid, it wins over the tier-based estimate below.
 */
export const calculatePricing = (normalizedItems, options = {}) => {
  const { shippingOverride } = options;

  if (!normalizedItems?.length) {
    return {
      subtotal: 0,
      totalMRP: 0,
      totalPayable: 0,
      itemDiscount: 0,
      discountPercent: 0,
      savingsAmount: 0,
      deliveryFee: 0,
      taxAmount: 0,
      totalQuantity: 0,
      currency: PRICING_DEFAULTS.CURRENCY,
      isShippingConfirmed: false,
    };
  }

  let subtotal = 0;
  let totalMRP = 0;
  let totalQuantity = 0;

  normalizedItems.forEach((item) => {
    const qty = Number(item.quantity || 1);
    totalQuantity += qty;
    subtotal += Number(item.price || 0) * qty;
    totalMRP += Number(item.originalPrice || item.price || 0) * qty;
  });

  const itemDiscount = totalMRP - subtotal;
  const discountPercent = totalMRP > 0 ? Math.round((itemDiscount / totalMRP) * 100) : 0;

  // Provisional tier-based estimate — used before we know the destination PIN.
  let deliveryFee = PRICING_DEFAULTS.SHIPPING_CHARGE;
  if (subtotal > 0 && subtotal < PRICING_DEFAULTS.TIER_1_THRESHOLD) {
    deliveryFee = PRICING_DEFAULTS.TIER_1_CHARGE;
  } else if (subtotal < PRICING_DEFAULTS.FREE_SHIPPING_THRESHOLD) {
    deliveryFee = PRICING_DEFAULTS.TIER_2_CHARGE;
  }

  // Once a PIN has been verified, that number is the real one — it wins.
  const isShippingConfirmed =
    typeof shippingOverride === "number" &&
    Number.isFinite(shippingOverride) &&
    shippingOverride >= 0;

  if (isShippingConfirmed) {
    deliveryFee = shippingOverride;
  }

  const taxRate = PRICING_DEFAULTS.TAX_RATE || 0;
  const taxAmount = Number((subtotal * taxRate).toFixed(2));
  const totalPayable = Number((subtotal + deliveryFee + taxAmount).toFixed(2));

  return {
    subtotal,
    totalMRP,
    totalPayable,
    itemDiscount,
    discountPercent,
    savingsAmount: itemDiscount,
    deliveryFee,
    taxAmount,
    totalQuantity,
    currency: PRICING_DEFAULTS.CURRENCY,
    isShippingConfirmed, // lets the UI say "estimated" vs "confirmed"
  };
};