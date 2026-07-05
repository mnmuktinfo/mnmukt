// src/features/orders/services/itemUtils.js
// Shared, dependency-free helpers used by both checkoutService (frontend
// hint-building) and orderService (API payload sanitization), kept in their
// own module so neither service has to import the other for it and we avoid
// a circular import between checkoutService <-> orderService.

/**
 * Single fallback-SKU rule. Previously checkoutService and orderService each
 * had their own slightly different fallback expression — checkoutService's
 * omitted the index (`SKU-${Date.now()}`), which could produce identical
 * SKUs for two SKU-less items added in the same cart within the same
 * millisecond. This is the one rule both should use.
 *
 * @param {Object} item - a cart/order line item (raw or normalized)
 * @param {number} [index=0] - position of the item in its array, used only
 *   as a last-resort uniqueness guard when nothing else identifies the item
 * @returns {string} a non-empty SKU string
 */
export const buildFallbackSku = (item, index = 0) =>
  item?.sku?.trim() ||
  item?.productId ||
  item?._id ||
  item?.id ||
  `SKU-${Date.now()}-${index}`;