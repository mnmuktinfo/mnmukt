// src/features/orders/services/checkout/item.service.js
import { buildFallbackSku } from "../itemUtils";
import { VALIDATION_RULES } from "../schema";

// buildFallbackSku lives in ../itemUtils, shared with orderService.js so the
// two layers never diverge. Re-exported here so existing imports keep working.
export { buildFallbackSku };

export const normalizeItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) return [];

  return items.map((item, index) => {
    const quantity = Math.max(VALIDATION_RULES.MIN_QUANTITY, Number(item.quantity) || 1);
    const price = Math.max(0, Number(item.price) || 0);

    return {
      productId: item.productId || item._id || item.id || "",
      sku: buildFallbackSku(item, index),
      slug: item.slug || "",
      name: item.name || "",
      image: item.image || item.thumbnail || item.banner || "",
      brand: item.brand || "Default",
      category: item.category || "",
      variant: {
        size: item.selectedSize || item.variant?.size || "",
        color: item.selectedColor || item.variant?.color || "",
      },
      quantity,
      price,
      originalPrice: Math.max(0, Number(item.originalPrice || price) || 0),
      gst: item.gst || {},
      totalPrice: quantity * price,
    };
  });
};