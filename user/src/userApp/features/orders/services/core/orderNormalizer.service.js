const isDev =
  typeof import.meta !== "undefined"
    ? import.meta.env?.DEV
    : process.env.NODE_ENV !== "production";

export const OrderNormalizerService = {
  /**
   * Normalizes raw UI cart items into OrderItemSchema shape.
   */
  normalizeItems: (rawItems = []) => {
    if (!Array.isArray(rawItems)) return [];

    const normalized = rawItems.map((item) => ({
      productId: String(item.productId || item.id || ""),
      variantId: item.variantId ? String(item.variantId) : undefined,

      name: String(item.name || "Unknown Item"),

      price: Math.max(0, Number(item.price) || 0),
      quantity: Math.max(1, Number(item.quantity) || 1),

      image: item.image || undefined,

      variant: {
        size: String(item.variant?.size || ""),

        color: {
          name: String(item.variant?.color?.name || ""),
          hex: String(item.variant?.color?.hex || ""),
          image: String(item.variant?.color?.image || ""),
        },
      },
    }));

    if (isDev) {
      console.log("🛠️ [NormalizerService] Normalized Items:", normalized);
    }

    return normalized;
  },
};