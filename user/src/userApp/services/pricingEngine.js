import { PRICING_DEFAULTS } from "../features/orders/constants/appConstants";

export const calculatePricing = (items = []) => {
  let subtotal = 0; // selling price total
  let originalTotalPrice = 0; // MRP total
  let totalQuantity = 0;

  items.forEach((item) => {
    const qty = Number(item.quantity || 1);
    totalQuantity += qty;

    const sellingPrice = Number(
      item.unitPrice ??
      item.price ??
      item.salePrice ??
      0
    );

    const mrp = Number(
      item.mrp ??
      item.originalPrice ??
      sellingPrice
    );

    subtotal += sellingPrice * qty;
    originalTotalPrice += mrp * qty;
  });

  // =========================
  // DISCOUNTS
  // =========================
  const itemDiscount = originalTotalPrice - subtotal;

  const discountPercent =
    originalTotalPrice > 0
      ? Math.round((itemDiscount / originalTotalPrice) * 100)
      : 0;

  // =========================
  // SHIPPING (using constants)
  // =========================
  let deliveryFee = PRICING_DEFAULTS.SHIPPING_CHARGE;

  if (subtotal > 0 && subtotal < 499) {
    deliveryFee = 50;
  } else if (subtotal < 999) {
    deliveryFee = 25;
  } else {
    deliveryFee = PRICING_DEFAULTS.SHIPPING_CHARGE;
  }

  // =========================
  // TAX (from constants)
  // =========================
  const taxRate = PRICING_DEFAULTS.TAX_RATE || 0;
  const taxAmount = Number((subtotal * taxRate).toFixed(2));

  // =========================
  // FINAL TOTAL
  // =========================
  const totalPayable = subtotal + deliveryFee + taxAmount;

  // =========================
  // OUTPUT (FULLY ALIGNED)
  // =========================
  return {
    // CORE VALUES (used everywhere)
    subtotal,
    totalMRP: originalTotalPrice,
    totalPayable,

    // DISCOUNTS
    itemDiscount,
    discountPercent,
    savingsAmount: itemDiscount,

    // FEES
    deliveryFee,
    taxAmount,

    // META
    totalQuantity,
    currency: PRICING_DEFAULTS.CURRENCY,
  };
};