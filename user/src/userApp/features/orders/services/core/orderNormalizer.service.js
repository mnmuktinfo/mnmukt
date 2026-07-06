const isDev = typeof import.meta !== 'undefined' ? import.meta.env?.DEV : process.env.NODE_ENV !== 'production';

export const OrderNormalizerService = {
  /**
   * Normalizes raw UI cart items into strict OrderItemSchema shape.
   */
  normalizeItems: (rawItems = []) => {
    if (!Array.isArray(rawItems)) return [];

    const normalized = rawItems.map((item) => ({
      // Normalize IDs
      productId: String(item.productId || item.id || ""),
      variantId: item.variantId ? String(item.variantId) : null,
      
      name: String(item.name || "Unknown Item"),
      
      // Math.max guarantees we never send negative prices or zero quantities
      price: Math.max(0, Number(item.price) || 0),
      quantity: Math.max(1, Number(item.quantity) || 1),
      
      image: item.image || null,

      // Strictly map variant object
      variant: item.variant
        ? {
            size: item.variant.size
              ? {
                  label: String(item.variant.size.label || ""),
                  value: String(item.variant.size.value || ""),
                }
              : undefined,
            color: item.variant.color
              ? {
                  name: String(item.variant.color.name || ""),
                  hex: String(item.variant.color.hex || ""),
                }
              : undefined,
          }
        : null,
    }));

    if (isDev) console.log("🛠️ [NormalizerService] Normalized Items:", normalized);
    return normalized;
  }
};