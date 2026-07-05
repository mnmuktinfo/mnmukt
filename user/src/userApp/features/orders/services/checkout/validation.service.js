// src/features/orders/services/checkout/validation.service.js
import { ERROR_MESSAGES, VALIDATION_RULES } from "../schema";

// =========================
// CART VALIDATION
// =========================
export const validateCartItems = (items) => {
  const errors = [];

  if (!Array.isArray(items) || items.length === 0) {
    return { isValid: false, error: ERROR_MESSAGES.CART_EMPTY, errors: ["Cart is empty"] };
  }

  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  if (totalItems > VALIDATION_RULES.MAX_ITEMS) {
    return {
      isValid: false,
      error: `Cart exceeds maximum ${VALIDATION_RULES.MAX_ITEMS} items`,
      errors: [`You have ${totalItems} items, maximum allowed is ${VALIDATION_RULES.MAX_ITEMS}`],
    };
  }

  items.forEach((item, index) => {
    if (!item.productId && !item.id && !item._id) {
      errors.push(`Item ${index + 1}: Missing product ID`);
    }
    if (!item.name) errors.push(`Item ${index + 1}: Missing product name`);
    if (!item.image && !item.thumbnail && !item.banner) {
      errors.push(`Item ${index + 1}: Missing product image`);
    }

    const price = item.price || 0;
    if (price <= 0) errors.push(`Item ${index + 1} (${item.name}): Invalid price (₹${price})`);

    const qty = item.quantity || 1;
    if (qty < VALIDATION_RULES.MIN_QUANTITY) {
      errors.push(`Item ${index + 1} (${item.name}): Quantity must be at least 1`);
    }
    if (qty > VALIDATION_RULES.MAX_QUANTITY) {
      errors.push(`Item ${index + 1} (${item.name}): Maximum quantity is ${VALIDATION_RULES.MAX_QUANTITY}`);
    }
  });

  if (errors.length > 0) return { isValid: false, error: ERROR_MESSAGES.INVALID_ITEMS, errors };
  return { isValid: true, error: null, errors: [] };
};

// =========================
// FIELD VALIDATION
// =========================
export const validateEmail = (email) => {
  if (!email?.trim()) return ERROR_MESSAGES.EMAIL_REQUIRED;
  if (!VALIDATION_RULES.EMAIL_REGEX.test(email)) return ERROR_MESSAGES.EMAIL_INVALID;
  return null;
};

export const validatePhone = (phone) => {
  if (!phone?.trim()) return ERROR_MESSAGES.PHONE_REQUIRED;
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length < VALIDATION_RULES.PHONE_MIN_DIGITS) return ERROR_MESSAGES.PHONE_INVALID;
  return null;
};

export const validatePostalCode = (postalCode) => {
  if (!postalCode?.trim()) return ERROR_MESSAGES.POSTAL_CODE_REQUIRED;
  if (!VALIDATION_RULES.POSTAL_CODE_REGEX.test(postalCode)) return ERROR_MESSAGES.POSTAL_CODE_INVALID;
  return null;
};

export const validateAddress = (addressData) => {
  const errors = {};
  if (!addressData.fullName?.trim()) errors.fullName = ERROR_MESSAGES.FULLNAME_REQUIRED;

  const emailError = validateEmail(addressData.email);
  if (emailError) errors.email = emailError;

  const phoneError = validatePhone(addressData.phone);
  if (phoneError) errors.phone = phoneError;

  if (!addressData.addressLine1?.trim()) errors.addressLine1 = ERROR_MESSAGES.ADDRESS_REQUIRED;
  if (!addressData.city?.trim()) errors.city = ERROR_MESSAGES.CITY_REQUIRED;
  if (!addressData.district?.trim()) errors.district = ERROR_MESSAGES.DISTRICT_REQUIRED;
  if (!addressData.state?.trim()) errors.state = ERROR_MESSAGES.STATE_REQUIRED;

  const postalError = validatePostalCode(addressData.postalCode);
  if (postalError) errors.postalCode = postalError;

  return { isValid: Object.keys(errors).length === 0, errors };
};