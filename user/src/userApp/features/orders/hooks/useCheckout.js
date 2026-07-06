import { useState, useRef, useCallback } from "react";
import { useAuth } from "../../auth/context/UserContext"; 
import { useOrder } from "../context/OrderContext";
import { auth } from "../../../../config/firebaseAuth";
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

const isDev = typeof import.meta !== 'undefined' ? import.meta.env?.DEV : process.env.NODE_ENV !== 'production';

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
    async ({ items, shippingAddress, customerNote, paymentMethod }) => {
      setLoadingMessage(UI_MESSAGES.CREATING_ORDER);
      const isGuest = !user?.uid;

      if (!idempotencyKeyRef.current) {
        idempotencyKeyRef.current = crypto.randomUUID();
      }

      const { apiPayload, displayPricing } = CheckoutEngine.prepareOrderPayload({
        idempotencyKey: idempotencyKeyRef.current,
        cartItems: items,
        shippingAddress: shippingAddress || savedAddress,
        userUid: user?.uid,
        guestInfo: isGuest ? shippingAddress : null,
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
          email: apiPayload.shippingAddress.email,
          name: apiPayload.shippingAddress.fullName,
        },
        shippingAddress: apiPayload.shippingAddress,
        items: apiPayload.items,
        pricing: displayPricing,
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
            name: paymentOrder.storeDetails?.name || "Your Store Name",
            description: `Order #${orderId}`,
            image: paymentOrder.storeDetails?.logo || "https://your-default-logo-url.png",
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
                const verified = await OrderService.verifyPayment(
                  {
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpaySignature: response.razorpay_signature,
                  },
                  token
                );

                updateOrder({
                  orderId,
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
                safeReject(new Error(ErrorService.getErrorMessage("PAYMENT_CANCELLED")));
              },
            },
          });

          razorpay.on("payment.failed", (response) => {
            safeReject(
              new Error(
                response?.error?.description || ErrorService.getErrorMessage("PAYMENT_FAILED")
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
      shippingAddress,
      paymentMethod = PAYMENT_METHODS.RAZORPAY,
      customerNote = "",
    }) => {
      if (checkoutRef.current) return { success: false, error: "Checkout in progress" };

      checkoutRef.current = true;
      setIsLoading(true);
      setError("");

      try {
        const { order, token } = await performOrderCreation({
          items,
          shippingAddress,
          customerNote,
          paymentMethod,
        });

        if (paymentMethod === PAYMENT_METHODS.RAZORPAY) {
          const prefillData = {
            name: shippingAddress?.fullName || savedAddress?.fullName || user?.name,
            email: shippingAddress?.email || savedAddress?.email || user?.email,
            phone: shippingAddress?.phone || savedAddress?.phone,
          };
          await performRazorpayPayment(order._id, prefillData, token);
        }

        // ✅ FIX: Reset idempotency key strictly on success so users can buy again later
        idempotencyKeyRef.current = null; 
        
        return { success: true, orderId: order._id };
      } catch (err) {
        const msg = ErrorService.getErrorMessage(err);
        setError(msg);
        return { success: false, error: msg, orderId: orderIdRef.current };
      } finally {
        setIsLoading(false);
        checkoutRef.current = false;
      }
    },
    [user, savedAddress, performOrderCreation, performRazorpayPayment]
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