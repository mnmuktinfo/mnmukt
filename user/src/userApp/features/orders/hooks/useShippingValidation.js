// src/features/orders/hooks/useShippingValidation.js

import { useRef, useState, useEffect, useCallback } from "react";
import { VALIDATION_RULES } from "../services/schema";
import { shippingService } from "../services/shippingService";

export const useShippingValidation = () => {
  const [shippingInfo, setShippingInfo] = useState(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState(null);

  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  // =========================
  // API CALL (PIN CHECK)
  // =========================
  const checkPincode = useCallback(async (pincode) => {
    // cancel previous request
    abortRef.current?.abort();

    const controller = new AbortController();
    abortRef.current = controller;

    setShippingLoading(true);
    setShippingError(null);
    setShippingInfo(null);

    try {
      const result = await shippingService.checkServiceability(
        pincode,
        controller.signal
      );

      if (result?.success) {
        setShippingInfo(result.data);
      } else {
        setShippingError(result?.error || "Delivery not available");
      }
    } catch (err) {
      if (err?.name !== "AbortError") {
        setShippingError("Could not check delivery availability");
      }
    } finally {
      setShippingLoading(false);
    }
  }, []);

  // =========================
  // DEBOUNCED INPUT HANDLER
  // =========================
  const handlePincodeChange = useCallback(
    (value) => {
      clearTimeout(debounceRef.current);

      // reset state while typing
      setShippingInfo(null);
      setShippingError(null);

      if (VALIDATION_RULES.POSTAL_CODE_REGEX.test(value)) {
        debounceRef.current = setTimeout(() => {
          checkPincode(value);
        }, 400);
      }
    },
    [checkPincode]
  );

  // =========================
  // RESET STATE (IMPORTANT)
  // =========================
  const resetShipping = useCallback(() => {
    clearTimeout(debounceRef.current);
    abortRef.current?.abort();

    setShippingInfo(null);
    setShippingError(null);
    setShippingLoading(false);
  }, []);

  // =========================
  // CLEANUP ON UNMOUNT
  // =========================
  useEffect(() => {
    return () => {
      clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, []);

  return {
    shippingInfo,
    shippingLoading,
    shippingError,
    handlePincodeChange,
    resetShipping,
  };
};