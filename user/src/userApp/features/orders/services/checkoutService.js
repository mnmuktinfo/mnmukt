// src/services/checkoutService.js

import { orderService } from "../services/orderService";
import {
  ERROR_MESSAGES,
  VALIDATION_RULES,
  PRICING_DEFAULTS,
  CUSTOMER,
  PAYMENT_GATEWAY,
  UI_MESSAGES,
} from "../constants/appConstants";

/**
 * Checkout Service - Centralized checkout logic
 */


// =========================
// CART VALIDATION (NEW)
// =========================

export const validateCartItems = (items) => {
  const errors = [];

  // ✅ Check if cart is empty
  if (!items || !Array.isArray(items) || items.length === 0) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.CART_EMPTY,
      errors: ["Cart is empty"],
    };
  }

  // ✅ Check total items count
  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  if (totalItems > VALIDATION_RULES.MAX_ITEMS) {
    return {
      isValid: false,
      error: `Cart exceeds maximum ${VALIDATION_RULES.MAX_ITEMS} items`,
      errors: [`You have ${totalItems} items, maximum allowed is ${VALIDATION_RULES.MAX_ITEMS}`],
    };
  }

  // ✅ Validate each item
  items.forEach((item, index) => {
    // Check required fields
    if (!item.productId && !item.id && !item._id) {
      errors.push(`Item ${index + 1}: Missing product ID`);
    }

    if (!item.name) {
      errors.push(`Item ${index + 1}: Missing product name`);
    }

    if (!item.image && !item.thumbnail && !item.banner) {
      errors.push(`Item ${index + 1}: Missing product image`);
    }

    // Check price
    const price = item.unitPrice ?? item.price ?? item.salePrice ?? 0;
    if (price <= 0) {
      errors.push(
        `Item ${index + 1} (${item.name}): Invalid price (₹${price})`
      );
    }

    // Check quantity
    const qty = item.quantity || 1;
    if (qty < VALIDATION_RULES.MIN_QUANTITY) {
      errors.push(
        `Item ${index + 1} (${item.name}): Quantity must be at least 1`
      );
    }

    if (qty > VALIDATION_RULES.MAX_QUANTITY) {
      errors.push(
        `Item ${index + 1} (${item.name}): Maximum quantity is ${VALIDATION_RULES.MAX_QUANTITY}`
      );
    }
  });

  // ✅ Return validation result
  if (errors.length > 0) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.INVALID_ITEMS,
      errors,
    };
  }

  return {
    isValid: true,
    error: null,
    errors: [],
  };
};
// =========================
// VALIDATION
// =========================

export const validateEmail = (email) => {
  if (!email?.trim()) return ERROR_MESSAGES.EMAIL_REQUIRED;
  if (!VALIDATION_RULES.EMAIL_REGEX.test(email)) {
    return ERROR_MESSAGES.EMAIL_INVALID;
  }
  return null;
};

export const validatePhone = (phone) => {
  if (!phone?.trim()) return ERROR_MESSAGES.PHONE_REQUIRED;

  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length < VALIDATION_RULES.PHONE_MIN_DIGITS) {
    return ERROR_MESSAGES.PHONE_INVALID;
  }

  return null;
};

export const validatePostalCode = (postalCode) => {
  if (!postalCode?.trim()) return ERROR_MESSAGES.POSTAL_CODE_REQUIRED;

  if (!VALIDATION_RULES.POSTAL_CODE_REGEX.test(postalCode)) {
    return ERROR_MESSAGES.POSTAL_CODE_INVALID;
  }

  return null;
};

export const validateAddress = (addressData) => {
  const errors = {};

  if (!addressData.fullName?.trim()) {
    errors.fullName = ERROR_MESSAGES.FULLNAME_REQUIRED;
  }

  const emailError = validateEmail(addressData.email);
  if (emailError) errors.email = emailError;

  const phoneError = validatePhone(addressData.phone);
  if (phoneError) errors.phone = phoneError;

  if (!addressData.addressLine1?.trim()) {
    errors.addressLine1 = ERROR_MESSAGES.ADDRESS_REQUIRED;
  }

  if (!addressData.city?.trim()) {
    errors.city = ERROR_MESSAGES.CITY_REQUIRED;
  }

  if (!addressData.state?.trim()) {
    errors.state = ERROR_MESSAGES.STATE_REQUIRED;
  }

  const postalError = validatePostalCode(addressData.postalCode);
  if (postalError) errors.postalCode = postalError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// =========================
// ITEM NORMALIZATION
// =========================

export const normalizeItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) return [];

  return items.map((item) => ({
    productId: item.productId || item._id || item.id,
    sku: item.sku || "",
    name: item.name || "",
    image: item.image || item.thumbnail || item.banner || "",
    brand: item.brand || "Default",
    category: item.category || "",

    variant: {
      size: item.selectedSize || item.variant?.size || "",
      color: item.selectedColor || item.variant?.color || "",
    },

    quantity: Number(item.quantity || 1),

    unitPrice: Number(item.unitPrice ?? item.price ?? item.salePrice ?? 0),

    mrp: Number(
      item.originalPrice ||
        item.mrp ||
        item.unitPrice ||
        item.price ||
        item.salePrice ||
        0
    ),

    gst: item.gst || {},

    totalPrice:
      Number(item.quantity || 1) *
      Number(item.unitPrice ?? item.price ?? item.salePrice ?? 0),
  }));
};

// =========================
// PRICING (WITH SHIPPING LOGIC)
// =========================

export const calculatePricing = (normalizedItems) => {
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
    };
  }

  let subtotal = 0; // selling price total
  let totalMRP = 0; // MRP total
  let totalQuantity = 0;

  normalizedItems.forEach((item) => {
    const qty = Number(item.quantity || 1);
    totalQuantity += qty;

    const sellingPrice = Number(item.unitPrice || 0);
    const mrp = Number(item.mrp || sellingPrice);

    subtotal += sellingPrice * qty;
    totalMRP += mrp * qty;
  });

  // =========================
  // DISCOUNTS
  // =========================
  const itemDiscount = totalMRP - subtotal;
  const discountPercent =
    totalMRP > 0 ? Math.round((itemDiscount / totalMRP) * 100) : 0;

  // =========================
  // SHIPPING (based on subtotal)
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

  return {
    // Core values
    subtotal, // Selling price total
    totalMRP, // Original MRP total
    totalPayable, // Final amount to pay
    
    // Discounts
    itemDiscount,
    discountPercent,
    savingsAmount: itemDiscount,

    // Fees & Tax
    deliveryFee,
    taxAmount,

    // Meta
    totalQuantity,
    currency: PRICING_DEFAULTS.CURRENCY,
  };
};

// =========================
// ORDER PAYLOAD
// =========================

export const buildOrderPayload = ({
  items,
  shippingAddress,
  paymentMethod,
  customer,
  pricing,
  source = "web",
}) => {
  const normalizedItems = normalizeItems(items);

  // ✅ Only calculate pricing if not provided
  const finalPricing = pricing || calculatePricing(normalizedItems);

  return {
    customer,
    shippingAddress: {
      fullName: shippingAddress.fullName,
      phone: shippingAddress.phone,
      addressLine1: shippingAddress.addressLine1,
      addressLine2: shippingAddress.addressLine2,
      city: shippingAddress.city,
      state: shippingAddress.state,
      postalCode: shippingAddress.postalCode,
      landmark: shippingAddress.landmark,
      country: shippingAddress.country || "India",
    },
    paymentMethod,
    items: normalizedItems,
    pricing: {
      subtotal: finalPricing.totalMRP,
      itemDiscount: finalPricing.itemDiscount,
      couponDiscount: 0,
      prepaidDiscount: 0,
      bulkDiscount: 0,
      shippingCharge: finalPricing.deliveryFee,
      taxAmount: finalPricing.taxAmount,
      roundOff: 0,
      total: finalPricing.totalPayable,
      currency: finalPricing.currency,
    },
    source,
  };
};

// =========================
// ORDER API
// =========================

export const createOrderAsync = async (payload) => {
  try {
    const order = await orderService.createOrder(payload);

    if (!order?.orderId) {
      throw new Error(ERROR_MESSAGES.ORDER_CREATION_FAILED);
    }

    return order;
  } catch (error) {
    throw new Error(
      error.message || ERROR_MESSAGES.ORDER_CREATION_FAILED
    );
  }
};

// =========================
// RAZORPAY
// =========================

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

export const createPaymentOrderAsync = async (orderId, amount) => {
  try {
    const paymentOrder = await orderService.createPaymentOrder({
      orderId,
      amount,
    });

    if (!paymentOrder?.id) {
      throw new Error(ERROR_MESSAGES.PAYMENT_ORDER_FAILED);
    }

    return paymentOrder;
  } catch (error) {
    throw new Error(
      error.message || ERROR_MESSAGES.PAYMENT_ORDER_FAILED
    );
  }
};

export const verifyPaymentAsync = async (data) => {
  try {
    const result = await orderService.verifyPayment(data);

    if (!result?.success && !result?.data?.success) {
      throw new Error(ERROR_MESSAGES.PAYMENT_VERIFICATION_FAILED);
    }

    return result;
  } catch (error) {
    throw new Error(
      error.message || ERROR_MESSAGES.PAYMENT_VERIFICATION_FAILED
    );
  }
};

// =========================
// ERROR HANDLING
// =========================

export const getErrorMessage = (error) => {
  if (!error) return ERROR_MESSAGES.CHECKOUT_FAILED;

  if (typeof error === "string") return error;

  const msg = error.message?.toLowerCase() || "";

  if (msg.includes("network")) return ERROR_MESSAGES.NETWORK_ERROR;
  if (msg.includes("payment")) return ERROR_MESSAGES.PAYMENT_GATEWAY_FAILED;
  if (msg.includes("validation")) return ERROR_MESSAGES.INVALID_ITEMS;

  return error.message || ERROR_MESSAGES.CHECKOUT_FAILED;
};

// =========================
// UTILITIES
// =========================

// ✅ FIX: Added null safety check
export const formatPrice = (price, locale = "en-IN") =>
  new Intl.NumberFormat(locale).format(price || 0);

// ✅ FIX: Added null safety check
export const calculatePoints = (price) =>
  Math.round((price || 0) * PRICING_DEFAULTS.POINTS_MULTIPLIER) +
  PRICING_DEFAULTS.POINTS_MIN;

export const getDiscount = (original, current) => {
  if (!original || !current || original <= current) return 0;
  return Math.round(((original - current) / original) * 100);
};

// ✅ NEW: Export UI_MESSAGES for use in components
export { UI_MESSAGES };