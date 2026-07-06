import { PRICING_DEFAULTS } from "../schema";

const isDev = typeof import.meta !== 'undefined' ? import.meta.env?.DEV : process.env.NODE_ENV !== 'production';

export const OrderPricingService = {
  calculatePricing: (normalizedItems = []) => {
    const itemsTotal = normalizedItems.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );

    const shippingFee = itemsTotal >= PRICING_DEFAULTS.FREE_SHIPPING_THRESHOLD
      ? 0
      : PRICING_DEFAULTS.SHIPPING_CHARGE;

    const tax = itemsTotal * PRICING_DEFAULTS.TAX_RATE;
    const discount = 0; // Expandable for coupon logic

    const totalAmount = itemsTotal + shippingFee + tax - discount;

    const pricingOutput = {
      itemsTotal,
      shippingFee,
      discount,
      tax,
      totalAmount,
      currency: PRICING_DEFAULTS.CURRENCY,
    };

    if (isDev) console.log("🛠️ [PricingService] Calculated Pricing:", pricingOutput);
    return pricingOutput;
  }
};