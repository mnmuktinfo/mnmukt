import { OrderNormalizerService } from "./orderNormalizer.service";
import { OrderValidationService } from "./orderValidation.service";
import { OrderPricingService } from "./orderPricing.service";
import { buildOrderPayload } from "../../builders/orderPayload.builder";

const isDev = typeof import.meta !== 'undefined' ? import.meta.env?.DEV : process.env.NODE_ENV !== 'production';

export const CheckoutEngine = {
  /**
   * The single pipeline for preparing an order. 
   * Throws errors if validation fails (caught by useCheckout hook).
   */
  prepareOrderPayload: ({
    idempotencyKey,
    cartItems,
    shippingAddress,
    userUid,
    guestInfo,
    paymentMethod,
    customerNote = "",
  }) => {
    if (isDev) console.log("⚙️ [CheckoutEngine] Pipeline Started");

    // 1. NORMALIZE
    const normalizedItems = OrderNormalizerService.normalizeItems(cartItems);

    // 2. VALIDATE CART
    const cartValidation = OrderValidationService.validateCartItems(normalizedItems);
    if (!cartValidation.isValid) {
      throw new Error(cartValidation.error); // Fail fast
    }

    // 3. VALIDATE ADDRESS (Guest info is usually merged with address from UI)
    const addressToValidate = shippingAddress || guestInfo;
    const addressValidation = OrderValidationService.validateAddress(addressToValidate);
    if (!addressValidation.isValid) {
      throw new Error(addressValidation.error); // Fail fast
    }

    // 4. PRICE
    const pricing = OrderPricingService.calculatePricing(normalizedItems);

    // 5. BUILD
    const { apiPayload, displayPricing } = buildOrderPayload({
      idempotencyKey,
      items: normalizedItems,
      shippingAddress: addressToValidate,
      userUid,
      guestInfo,
      paymentMethod,
      pricing,
      customerNote,
    });

    if (isDev) console.log("⚙️ [CheckoutEngine] Pipeline Completed Successfully");

    return {
      apiPayload,
      displayPricing
    };
  }
};