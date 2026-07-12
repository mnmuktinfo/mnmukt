import { useState, useRef, useCallback } from "react";
import { useAuth } from "../../auth/context/UserContext"; 
import { useOrder } from "../context/OrderContext";
import { auth } from "../../../../config/firebaseConfig";
import { CheckoutEngine } from "../services/core/checkout.engine";
import { OrderValidationService } from "../services/core/orderValidation.service";
import { ErrorService } from "../services/core/error.service";
import { OrderService } from "../services/api/orderService";
import { PaymentService } from "../services/api/payment.service"; 

import {
  UI_MESSAGES,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  ORDER_STATUS,
} from "../services/schema";

export const useCheckout = () => {
  const { user, address: savedAddress } = useAuth();
  const { storeOrder, updateOrder } = useOrder();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingMessage, setLoadingMessage] = useState("");

  const orderIdRef = useRef(null);
  const checkoutRef = useRef(false);
  const idempotencyKeyRef = useRef(null); 

  const performAddressValidation = useCallback((addressData) => {
    const result = OrderValidationService.validateAddress(addressData);
    if (!result.isValid) setError(result.error);
    return result;
  }, []);

  const performOrderCreation = useCallback(
    async ({ items, pricing, shippingAddress, guestInfo, customerNote, paymentMethod }) => {
      setLoadingMessage(UI_MESSAGES.CREATING_ORDER);
      const isGuest = !user?.uid;

      if (!idempotencyKeyRef.current) {
        idempotencyKeyRef.current =
          window.crypto?.randomUUID?.() ||
          `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      }

      const { apiPayload, displayPricing } = CheckoutEngine.prepareOrderPayload({
        idempotencyKey: idempotencyKeyRef.current,
        cartItems: items,
        pricing: pricing, 
        shippingAddress: shippingAddress || savedAddress,
        userUid: user?.uid,
        guestInfo: guestInfo || null, 
        paymentMethod,
        customerNote,
      });

      let token = null;
      if (auth.currentUser) {
        token = await auth.currentUser.getIdToken();
      }

      const order = await OrderService.createOrder(apiPayload, token);
      orderIdRef.current = order._id;

      storeOrder({
        orderId: order._id,
        orderStatus: order.orderStatus || ORDER_STATUS.PENDING,
        customer: {
          isGuest,
          email: guestInfo?.email || user?.email || "",
          name: shippingAddress?.fullName || guestInfo?.name || user?.name || "",
        },
        shippingAddress: apiPayload.shippingAddress,
        items: apiPayload.items,
        pricing: displayPricing || pricing,
        createdAt: new Date().toISOString(),
        paymentStatus: order.payment?.status || PAYMENT_STATUS.PENDING,
      });

      return { order, token };
    },
    [user, savedAddress, storeOrder]
  );

  const performRazorpayPayment = useCallback(
    async (orderId, prefillData, token) => {
      setLoadingMessage(UI_MESSAGES.LOADING_PAYMENT);

      const loaded = await PaymentService.loadRazorpayScript();
      if (!loaded) throw new Error(ErrorService.getErrorMessage("PAYMENT_GATEWAY_FAILED"));

      setLoadingMessage(UI_MESSAGES.PREPARING_PAYMENT);

      const paymentOrder = await OrderService.createPaymentOrder(orderId, token);

      if (!paymentOrder?.keyId || !paymentOrder?.razorpayOrderId) {
        throw new Error(
          paymentOrder?.message ||
            ErrorService.getErrorMessage("PAYMENT_GATEWAY_FAILED")
        );
      }

      return new Promise((resolve, reject) => {
        let settled = false;
        const safeResolve = (val) => {
          if (settled) return;
          settled = true;
          resolve(val);
        };
        const safeReject = (err) => {
          if (settled) return;
          settled = true;
          reject(err);
        };

        try {
          const razorpay = new window.Razorpay({
            key: paymentOrder.keyId,
            amount: paymentOrder.amount,
            currency: paymentOrder.currency,
            order_id: paymentOrder.razorpayOrderId,
            name: paymentOrder.storeDetails?.name || "Mnmukt",
            description: `Order #${orderId}`,
            image: paymentOrder.storeDetails?.logo || "https://mnmukt.com/assets/appLogo-BQ3RAogG.png",
            prefill: {
              name: prefillData?.name || "",
              email: prefillData?.email || "",
              contact: prefillData?.phone || "",
            },
            theme: {
              color: paymentOrder.storeDetails?.themeColor || "#3399cc",
            },
            handler: async (response) => {
              setLoadingMessage(UI_MESSAGES.VERIFYING_PAYMENT);
              try {
                // ✅ FIX: Added `orderId: orderId` to the payload matching Zod schema
                const verified = await OrderService.verifyPayment(
                  {
                    orderId: orderId, 
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpaySignature: response.razorpay_signature,
                  },
                  token
                );

                updateOrder(orderId, {
                  paymentStatus: PAYMENT_STATUS.PAID,
                  orderStatus: ORDER_STATUS.CONFIRMED,
                });

                safeResolve(verified);
              } catch (err) {
                safeReject(err);
              }
            },
            modal: {
              ondismiss: () => {
                idempotencyKeyRef.current = null;
                safeReject(
                  new Error(ErrorService.getErrorMessage("PAYMENT_CANCELLED"))
                );
              },
            },
          });

          razorpay.on("payment.failed", (response) => {
            idempotencyKeyRef.current = null;
            safeReject(
              new Error(
                response?.error?.description ||
                  ErrorService.getErrorMessage("PAYMENT_FAILED")
              )
            );
          });

          razorpay.open();
        } catch (err) {
          safeReject(err);
        }
      });
    },
    [updateOrder]
  );

  const performCheckout = useCallback(
    async ({
      items,
      pricing,
      shippingAddress,
      guestInfo, 
      paymentMethod = PAYMENT_METHODS.RAZORPAY,
      customerNote = "",
    }) => {
      if (checkoutRef.current) {
        return {
          success: false,
          error: "Checkout in progress",
        };
      }

      checkoutRef.current = true;
      setIsLoading(true);
      setError("");

      const validation = performAddressValidation(
        shippingAddress || savedAddress
      );

      if (!validation.isValid) {
        checkoutRef.current = false;
        setIsLoading(false);
        return {
          success: false,
          error: validation.error,
        };
      }

      try {
        const { order, token } = await performOrderCreation({
          items,
          pricing, 
          shippingAddress,
          guestInfo,
          customerNote,
          paymentMethod,
        });

        if (paymentMethod === PAYMENT_METHODS.RAZORPAY) {
          const prefillData = {
            name:
              guestInfo?.name ||
              shippingAddress?.fullName ||
              savedAddress?.fullName ||
              user?.name ||
              "",
            email:
              guestInfo?.email ||
              savedAddress?.email ||
              user?.email ||
              "",
            phone:
              guestInfo?.phone ||
              shippingAddress?.phone ||
              savedAddress?.phone ||
              "",
          };

          await performRazorpayPayment(order._id, prefillData, token);
        }

        idempotencyKeyRef.current = null;

        return {
          success: true,
          orderId: order._id,
        };
      } catch (err) {
        idempotencyKeyRef.current = null;
        const msg = ErrorService.getErrorMessage(err);
        setError(msg);

        return {
          success: false,
          error: msg,
          orderId: orderIdRef.current,
        };
      } finally {
        setIsLoading(false);
        setLoadingMessage("");
        checkoutRef.current = false;
      }
    },
    [
      user,
      savedAddress,
      performAddressValidation,
      performOrderCreation,
      performRazorpayPayment,
    ]
  );

  const resetCheckout = useCallback(() => {
    setIsLoading(false);
    setError("");
    setLoadingMessage("");
    orderIdRef.current = null;
    checkoutRef.current = false;
    idempotencyKeyRef.current = null;
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