// src/features/orders/hooks/useCheckout.js
import { useState, useRef, useCallback } from "react";
import { useAuth } from "../../auth/context/UserContext";
import { useOrder } from "../context/OrderContext";
import {
  validateAddress,
  normalizeItems,
  calculatePricing,
  buildOrderPayload,
  createOrderAsync,
  createPaymentOrderAsync,
  verifyPaymentAsync,
  loadRazorpayScript,
  getErrorMessage,
} from "../services/checkout/checkoutService";          
import {
  ERROR_MESSAGES,
  UI_MESSAGES,
  PAYMENT_GATEWAY,
  PAYMENT_STATUS,
  ORDER_STATUS,
} from "../services/schema";

 
export const useCheckout = () => {
  const { user, address } = useAuth();
  const { storeOrder, updateOrder } = useOrder();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingMessage, setLoadingMessage] = useState("");

  const orderIdRef = useRef(null);
  const checkoutRef = useRef(false);

  /* ========================================
     ADDRESS VALIDATION
  ======================================== */
  const performAddressValidation = useCallback((addressData) => {
    const validation = validateAddress(addressData);
    if (!validation.isValid) {
      setError(Object.values(validation.errors)[0] || ERROR_MESSAGES.CHECKOUT_FAILED);
    }
    return validation;
  }, []);

  /* ========================================
     BUILD CUSTOMER
  ======================================== */
  const buildCustomer = useCallback(
    (shippingAddress = {}) => {
      const mergedAddress = { ...address, ...shippingAddress };

      return user?.uid
        ? {
            userId: user.uid,
            email: user.email || mergedAddress.email || "",
            name: user.name || mergedAddress.fullName || "",
            isGuest: false,
          }
        : {
            userId: null,
            email: mergedAddress.email || "",
            name: mergedAddress.fullName || "",
            isGuest: true,
          };
    },
    [user, address],
  );

  /* ========================================
     CREATE ORDER
  ======================================== */
  const performOrderCreation = useCallback(
    async ({ items, shippingAddress, paymentMethod, customerNote, pricing }) => {
      setLoadingMessage(UI_MESSAGES.CREATING_ORDER);

      const mergedAddress = {
        ...address,
        ...shippingAddress,
        email: shippingAddress?.email || user?.email || address?.email || "",
        fullName: shippingAddress?.fullName || user?.name || address?.fullName || "",
        phone: shippingAddress?.phone || address?.phone || "",
      };

      const customer = buildCustomer(mergedAddress);
      const normalizedItems = normalizeItems(items);

      // Use the confirmed pricing passed in by the caller (e.g. CartDrawer,
      // which resolves the real PIN-based shipping charge via
      // useShippingServiceability) rather than silently recomputing a
      // generic tier-based estimate. Only fall back when nothing was passed.
      const finalPricing = pricing ?? calculatePricing(normalizedItems);

      const payload = buildOrderPayload({
        items: normalizedItems, // already normalized — buildOrderPayload must not re-normalize
        shippingAddress: mergedAddress,
        paymentMethod,
        customer,
        pricing: finalPricing,
        customerNote,
      });

      if (import.meta.env.DEV) {
  console.log("CHECKOUT PAYLOAD:", {
    ...payload,
    shippingAddress: {
      city: payload.shippingAddress.city,
      postalCode: payload.shippingAddress.postalCode,
    },
    customer: {
      ...payload.customer,
      email: payload.customer?.email ? "[present]" : "[missing]",
      name: payload.customer?.name ? "[present]" : "[missing]",
    },
  });
}

      const order = await createOrderAsync(payload);
      orderIdRef.current = order.orderId;

      storeOrder({
        orderId: order.orderId,
        orderStatus: order.orderStatus || ORDER_STATUS.PENDING,
        customer,
        shippingAddress: mergedAddress,
        items: normalizedItems,
        pricing: finalPricing,
        createdAt: new Date().toISOString(),
        isGuest: customer.isGuest,
        paymentStatus:
          order.paymentStatus ||
          (paymentMethod === PAYMENT_GATEWAY.COD
            ? PAYMENT_STATUS.COD_PENDING
            : PAYMENT_STATUS.PENDING),
        trackingUrl: order.trackingUrl || null,
      });

      return order;
    },
    [user, address, buildCustomer, storeOrder],
  );

  /* ========================================
     RAZORPAY
  ======================================== */
  const performRazorpayPayment = useCallback(
    async (orderId, prefillData) => {
      setLoadingMessage(UI_MESSAGES.LOADING_PAYMENT);

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error(ERROR_MESSAGES.PAYMENT_GATEWAY_FAILED);
      }

      setLoadingMessage(UI_MESSAGES.PREPARING_PAYMENT);

      const paymentOrder = await createPaymentOrderAsync({
        orderId,
        customerEmail: prefillData?.email,
      });

      return new Promise((resolve, reject) => {
        try {
          const razorpay = new window.Razorpay({
            key: import.meta.env.VITE_RAZORPAY_KEY_ID || "",
            amount: paymentOrder.amount,
            currency: paymentOrder.currency,
            order_id: paymentOrder.id,
            name: import.meta.env.VITE_STORE_NAME || "Store",
            description: `Order #${orderId}`,
            prefill: {
              name: prefillData?.name || "",
              email: prefillData?.email || "",
              contact: prefillData?.phone || "",
            },
            theme: { color: "#000000" },

            handler: async (response) => {
              try {
                setLoadingMessage(UI_MESSAGES.VERIFYING_PAYMENT);

                const verifyResult = await verifyPaymentAsync({
                  orderId,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  customerEmail: prefillData?.email,
                });

                const verified = verifyResult?.data || {};

                updateOrder(orderId, {
                  orderStatus: verified.orderStatus || ORDER_STATUS.CONFIRMED,
                  paymentStatus: verified.paymentStatus || PAYMENT_STATUS.PAID,
                  paymentId: response.razorpay_payment_id,
                  paymentVerifiedAt: new Date().toISOString(),
                });

                resolve({ success: true, orderId });
              } catch (err) {
                // Payment likely succeeded on Razorpay's side but our
                // verification call failed (network blip, etc). Surface the
                // error to the caller rather than leaving the promise
                // hanging — the order stays "pending" and can be
                // reconciled via getOrderStatus / webhook on reload.
                reject(err);
              } finally {
                setLoadingMessage("");
              }
            },

            modal: {
              ondismiss: () => {
                setLoadingMessage("");
                reject(new Error(ERROR_MESSAGES.PAYMENT_CANCELLED));
              },
            },
          });

          razorpay.open();
        } catch (err) {
          setLoadingMessage("");
          reject(err);
        }
      });
    },
    [updateOrder],
  );

  /* ========================================
     CHECKOUT
  ======================================== */
  const performCheckout = useCallback(
    async ({
      items,
      shippingAddress,
      paymentMethod = PAYMENT_GATEWAY.RAZORPAY,
      customerNote = "",
      pricing,
      // shippingInfo is accepted for call-signature parity with callers that
      // resolve a confirmed courier/ETA via useShippingServiceability.
      // It isn't persisted separately today because `pricing.deliveryFee`
      // already carries the confirmed number — reserved for future use
      // (e.g. storing courier name / promised delivery date on the order).
      shippingInfo, // eslint-disable-line no-unused-vars
    }) => {
      if (checkoutRef.current) {
        return { success: false, error: "Checkout already in progress" };
      }

      checkoutRef.current = true;
      setIsLoading(true);
      setError("");

      try {
        const validation = performAddressValidation(shippingAddress);
        if (!validation.isValid) {
          return { success: false, error: validation.errors };
        }

        const order = await performOrderCreation({
          items,
          shippingAddress,
          paymentMethod,
          customerNote,
          pricing,
        });

        if (paymentMethod === PAYMENT_GATEWAY.RAZORPAY) {
          await performRazorpayPayment(order.orderId, {
            name: shippingAddress?.fullName || user?.name || address?.fullName,
            email: shippingAddress?.email || user?.email || address?.email,
            phone: shippingAddress?.phone || address?.phone,
          });
        }

        setLoadingMessage("");

        return {
          success: true,
          orderId: order.orderId,
          trackingUrl: order.trackingUrl,
        };
      } catch (err) {
        const msg = getErrorMessage(err);
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setIsLoading(false);
        checkoutRef.current = false;
      }
    },
    [user, address, performAddressValidation, performOrderCreation, performRazorpayPayment],
  );

  const resetCheckout = useCallback(() => {
    setIsLoading(false);
    setError("");
    setLoadingMessage("");
    orderIdRef.current = null;
    checkoutRef.current = false;
  }, []);

  return {
    isLoading,
    error,
    loadingMessage,
    orderId: orderIdRef.current,
    performCheckout,
    resetCheckout,
    performAddressValidation,
  };
};