import { VALIDATION_RULES, ERROR_MESSAGES } from "../schema";

const isDev =
  typeof import.meta !== "undefined"
    ? import.meta.env?.DEV
    : process.env.NODE_ENV !== "production";

export const OrderValidationService = {
  validateCartItems: (normalizedItems) => {
    if (!Array.isArray(normalizedItems) || normalizedItems.length === 0) {
      return {
        isValid: false,
        error: ERROR_MESSAGES.CART_EMPTY,
      };
    }

    if (normalizedItems.length > VALIDATION_RULES.MAX_ITEMS) {
      return {
        isValid: false,
        error: `Cart cannot exceed ${VALIDATION_RULES.MAX_ITEMS} items.`,
      };
    }

    for (const item of normalizedItems) {
      if (!item.productId) {
        return {
          isValid: false,
          error: ERROR_MESSAGES.INVALID_ITEMS,
        };
      }

      if (!item.name?.trim()) {
        return {
          isValid: false,
          error: "Product name is missing.",
        };
      }

      if (Number(item.price) < 0) {
        return {
          isValid: false,
          error: "Invalid product price.",
        };
      }

      if (
        !Number.isInteger(Number(item.quantity)) ||
        Number(item.quantity) < VALIDATION_RULES.MIN_QUANTITY
      ) {
        return {
          isValid: false,
          error: `Item ${item.name} quantity must be at least ${VALIDATION_RULES.MIN_QUANTITY}.`,
        };
      }
    }

    if (isDev) {
      console.log("🛠️ [ValidationService] Cart validated successfully");
    }

    return { isValid: true };
  },

validateAddress: (address) => {
    if (!address) {
      return {
        isValid: false,
        error: ERROR_MESSAGES.ADDRESS_REQUIRED,
      };
    }

    const fullName = (address.fullName || "").trim();
    const email = (address.email || "").trim();
    const phone = (address.phone || "").replace(/\D/g, "");
    const postalCode = (
      address.pincode ||
      address.postalCode ||
      ""
    ).trim();
    
    // Extract strictly required Mongoose fields
    const addressLine1 = (address.addressLine1 || "").trim();
    const city = (address.city || "").trim();
    const state = (address.state || "").trim();

    if (fullName.length < 2) {
      return {
        isValid: false,
        error: "Full name is required.",
      };
    }

    if (email && !VALIDATION_RULES.EMAIL_REGEX.test(email)) {
      return {
        isValid: false,
        error: ERROR_MESSAGES.EMAIL_INVALID,
      };
    }

    if (!VALIDATION_RULES.PHONE_REGEX.test(phone)) {
      return {
        isValid: false,
        error: ERROR_MESSAGES.PHONE_INVALID,
      };
    }

    if (!VALIDATION_RULES.POSTAL_CODE_REGEX.test(postalCode)) {
      return {
        isValid: false,
        error: ERROR_MESSAGES.POSTAL_CODE_INVALID,
      };
    }

    // --- NEW: Mongoose Required Fields ---
    if (!addressLine1) {
      return {
        isValid: false,
        error: "Address Line 1 (Flat, house no, building) is required.", // Or add to ERROR_MESSAGES
      };
    }

    if (!city) {
      return {
        isValid: false,
        error: "City is required.",
      };
    }

    if (!state) {
      return {
        isValid: false,
        error: "State is required.",
      };
    }

    if (isDev) {
      console.log("🛠️ [ValidationService] Address validated successfully");
    }

    return { isValid: true };
  },
};