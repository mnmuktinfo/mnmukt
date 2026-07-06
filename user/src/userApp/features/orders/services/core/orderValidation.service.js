import { VALIDATION_RULES, ERROR_MESSAGES } from "../schema";

const isDev = typeof import.meta !== 'undefined' ? import.meta.env?.DEV : process.env.NODE_ENV !== 'production';

export const OrderValidationService = {
  validateCartItems: (normalizedItems) => {
    if (!normalizedItems || normalizedItems.length === 0) {
      return { isValid: false, error: ERROR_MESSAGES.CART_EMPTY };
    }

    if (normalizedItems.length > VALIDATION_RULES.MAX_ITEMS) {
      return { isValid: false, error: `Cart cannot exceed ${VALIDATION_RULES.MAX_ITEMS} items.` };
    }

    for (const item of normalizedItems) {
      if (item.quantity < VALIDATION_RULES.MIN_QUANTITY) {
        return { isValid: false, error: `Item ${item.name} quantity must be at least ${VALIDATION_RULES.MIN_QUANTITY}.` };
      }
      if (item.quantity > VALIDATION_RULES.MAX_QUANTITY) {
        return { isValid: false, error: `Item ${item.name} quantity cannot exceed ${VALIDATION_RULES.MAX_QUANTITY}.` };
      }
      if (!item.productId) {
        return { isValid: false, error: ERROR_MESSAGES.INVALID_ITEMS };
      }
    }

    if (isDev) console.log("🛠️ [ValidationService] Cart Validated Successfully");
    return { isValid: true };
  },

  validateAddress: (address) => {
    if (!address) {
      return { isValid: false, error: ERROR_MESSAGES.ADDRESS_REQUIRED };
    }

    // Clean data for validation
    const email = (address.email || "").trim();
    // Strip everything except numbers for accurate phone length validation
    const phone = (address.phone || "").replace(/\D/g, ""); 
    const postalCode = (address.pincode || address.postalCode || "").trim();

    if (email && !VALIDATION_RULES.EMAIL_REGEX.test(email)) {
      return { isValid: false, error: ERROR_MESSAGES.EMAIL_INVALID };
    }

    if (!phone || phone.length < VALIDATION_RULES.PHONE_MIN_DIGITS) {
      return { isValid: false, error: ERROR_MESSAGES.PHONE_INVALID };
    }

    if (!postalCode || !VALIDATION_RULES.POSTAL_CODE_REGEX.test(postalCode)) {
      return { isValid: false, error: ERROR_MESSAGES.POSTAL_CODE_INVALID };
    }

    if (isDev) console.log("🛠️ [ValidationService] Address Validated Successfully");
    return { isValid: true };
  }
};