// src/hooks/useCheckout.js
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
} from "../services/checkoutService";

import {
  ERROR_MESSAGES,
  UI_MESSAGES,
  PAYMENT_GATEWAY,
  PAYMENT_STATUS,
} from "../constants/appConstants";

export const useCheckout = () => {
  const { user } = useAuth();
  const { storeOrder, updateOrder } = useOrder();

  // STATE
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingMessage, setLoadingMessage] = useState("");

  // REFS
  const orderIdRef = useRef(null);
  const checkoutRef = useRef(false);

  // prevent double submit
  const isCheckoutInProgress = useCallback(() => checkoutRef.current, []);

  const setCheckoutInProgress = useCallback((value) => {
    checkoutRef.current = value;
  }, []);

  // ===============================
  // ADDRESS VALIDATION
  // ===============================
  const performAddressValidation = useCallback((addressData) => {
    const validation = validateAddress(addressData);

    if (!validation.isValid) {
      const firstError =
        Object.values(validation.errors)[0] ||
        ERROR_MESSAGES.CHECKOUT_FAILED;

      setError(firstError);
    }

    return validation;
  }, []);

  // ===============================
  // ORDER CREATION
  // ===============================
  const performOrderCreation = useCallback(
    async ({ items, shippingAddress, paymentMethod, source }) => {
      setLoadingMessage(UI_MESSAGES.CREATING_ORDER);

      const customer = user?.uid
        ? {
            userId: user.uid,
            email: user.email || "",
            name: user.name || "",
            isGuest: false,
          }
        : {
            userId: null,
            email: shippingAddress.email || "",
            name: shippingAddress.fullName || "",
            isGuest: true,
          };

      const normalizedItems = normalizeItems(items);
      const pricing = calculatePricing(normalizedItems);

      const payload = buildOrderPayload({
        items: normalizedItems,
        shippingAddress,
        paymentMethod,
        customer,
        pricing,
        source,
      });

      const order = await createOrderAsync(payload);

      orderIdRef.current = order.orderId;

      // store in context
      storeOrder({
        orderId: order.orderId,
        customer,
        shippingAddress,
        items: normalizedItems,
        pricing,
        createdAt: new Date().toISOString(),
        isGuest: !user?.uid,
        paymentStatus: PAYMENT_STATUS.PENDING,
      });

      return order;
    },
    [user, storeOrder]
  );

  // ===============================
  // RAZORPAY PAYMENT
  // ===============================
  const performRazorpayPayment = useCallback(
    async (orderId, amount, prefillData) => {
      setLoadingMessage(UI_MESSAGES.LOADING_PAYMENT);

      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error(ERROR_MESSAGES.PAYMENT_GATEWAY_FAILED);
      }

      setLoadingMessage(UI_MESSAGES.PREPARING_PAYMENT);

      const paymentOrder = await createPaymentOrderAsync(orderId, amount);

      return new Promise((resolve, reject) => {
        try {
          const razorpay = new window.Razorpay({
            key:
              import.meta.env.VITE_RAZORPAY_KEY_ID || "",
            amount: Math.round(amount * 100),
            currency: "INR",
            name: import.meta.env.VITE_STORE_NAME || "Store",
            description: `Order #${orderId}`,
            order_id: paymentOrder.id,

            prefill: {
              name: prefillData?.name || "",
              email: prefillData?.email || "",
              contact: prefillData?.phone || "",
            },

            theme: { color: "#000000" },

            handler: async (response) => {
              try {
                setLoadingMessage(UI_MESSAGES.VERIFYING_PAYMENT);

                await verifyPaymentAsync({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId,
                });

                updateOrder(orderId, {
                  paymentStatus: PAYMENT_STATUS.PAID,
                  paymentId: response.razorpay_payment_id,
                  paymentVerifiedAt: new Date().toISOString(),
                });

                setLoadingMessage("");
                resolve({ success: true, orderId });
              } catch (err) {
                setLoadingMessage("");
                reject(err);
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
    [updateOrder]
  );

  // ===============================
  // MAIN CHECKOUT FLOW
  // ===============================
  const performCheckout = useCallback(
    async ({
      items,
      shippingAddress,
      paymentMethod = PAYMENT_GATEWAY.RAZORPAY,
      source = "web",
    }) => {
      if (checkoutRef.current) return;

      checkoutRef.current = true;
      setIsLoading(true);
      setError("");

      try {
        // 1. validate
        const validation = performAddressValidation(shippingAddress);

        if (!validation.isValid) {
          checkoutRef.current = false;
          setIsLoading(false);

          return {
            success: false,
            error: validation.errors,
          };
        }

        // 2. create order
        const order = await performOrderCreation({
          items,
          shippingAddress,
          paymentMethod,
          source,
        });

        // 3. payment
        const normalizedItems = normalizeItems(items);
        const pricing = calculatePricing(normalizedItems);

        if (paymentMethod === PAYMENT_GATEWAY.RAZORPAY) {
          await performRazorpayPayment(
            order.orderId,
            pricing.totalPayable, // ✅ FIXED: Changed from pricing.total to pricing.totalPayable
            {
              name: shippingAddress.fullName,
              email: shippingAddress.email,
              phone: shippingAddress.phone,
            }
          );
        } else if (paymentMethod === PAYMENT_GATEWAY.COD) {
          updateOrder(order.orderId, {
            paymentStatus: PAYMENT_STATUS.PENDING,
          });
        }

        setLoadingMessage("");

        return {
          success: true,
          orderId: order.orderId,
        };
      } catch (err) {
        const msg = getErrorMessage(err);

        setError(msg);
        setLoadingMessage("");

        return {
          success: false,
          error: msg,
        };
      } finally {
        setIsLoading(false);
        checkoutRef.current = false;
      }
    },
    [
      performAddressValidation,
      performOrderCreation,
      performRazorpayPayment,
      updateOrder,
    ]
  );

  // ===============================
  // RESET
  // ===============================
  const resetCheckout = useCallback(() => {
    setIsLoading(false);
    setError("");
    setLoadingMessage("");
    orderIdRef.current = null;
    checkoutRef.current = false;
  }, []);

  return {
    // state
    isLoading,
    error,
    loadingMessage,
    orderId: orderIdRef.current,

    // actions
    performCheckout,
    resetCheckout,
    performAddressValidation,
    isCheckoutInProgress,
    setCheckoutInProgress,
  };
};