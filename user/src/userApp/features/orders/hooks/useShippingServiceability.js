import { useState, useRef, useCallback, useEffect } from "react";
import { ShippingService } from "../services/api/shipping.service";
import { VALIDATION_RULES } from "../services/schema";

const DEBOUNCE_MS = 400;
const isDev = typeof import.meta !== 'undefined' ? import.meta.env?.DEV : process.env.NODE_ENV !== 'production';

export function useShippingServiceability() {
  const [shippingInfo, setShippingInfo] = useState(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState(null);

  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  const runCheck = useCallback(async (pincode) => {
    // 1. Cancel previous request if user is typing fast
    abortRef.current?.abort();

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await ShippingService.checkServiceability(pincode, {
        signal: controller.signal,
      });

      // 🛡️ RACE CONDITION GUARD: 
      // If the controller no longer matches the current active request, safely exit.
      if (abortRef.current !== controller) return;

      if (isDev) console.log("📦 [Shipping] API Response:", response);

      if (response.success && response.data?.available) {
        setShippingInfo(response.data);
        setShippingError(null);
      } else {
        setShippingInfo(null);
        setShippingError(response.message || "Delivery not available for this PIN code");
      }
    } catch (err) {
      // 🛡️ RACE CONDITION GUARD: Prevent old aborted requests from altering state
      if (abortRef.current !== controller) return;

      if (err.name === "AbortError" || err.name === "CanceledError") {
        return; // Safe to ignore
      }

      if (isDev) console.error("🚨 [Shipping] Error:", err);
      
      setShippingInfo(null);
      setShippingError(err.message || "Could not check delivery for this PIN code");
    } finally {
      // 🛡️ RACE CONDITION GUARD: Only turn off loading if this is still the active request
      if (abortRef.current === controller) {
        setShippingLoading(false);
      }
    }
  }, []);

  const checkPincode = useCallback(
    (pincode) => {
      clearTimeout(debounceRef.current);

      // 2. Abort active requests if the pincode becomes invalid (e.g., user backspaces)
      if (!VALIDATION_RULES.POSTAL_CODE_REGEX.test(pincode)) {
        abortRef.current?.abort();
        setShippingInfo(null);
        setShippingError(null);
        setShippingLoading(false);
        return;
      }

      // 3. UX FIX: Instantly set loading to true to give immediate visual feedback during the debounce delay
      setShippingInfo(null);
      setShippingError(null);
      setShippingLoading(true);

      debounceRef.current = setTimeout(() => {
        runCheck(pincode);
      }, DEBOUNCE_MS);
    },
    [runCheck]
  );

  const reset = useCallback(() => {
    clearTimeout(debounceRef.current);
    abortRef.current?.abort();

    setShippingInfo(null);
    setShippingLoading(false);
    setShippingError(null);
  }, []);

  useEffect(() => {
    return () => {
      clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, []);

  const pinStatus = shippingLoading
    ? "loading"
    : shippingInfo
      ? "valid"
      : shippingError
        ? "invalid"
        : "idle";

  return {
    shippingInfo,
    shippingLoading,
    shippingError,
    pinStatus,
    checkPincode,
    reset,
  };
}