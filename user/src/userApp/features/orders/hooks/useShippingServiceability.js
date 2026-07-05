import { useState, useRef, useCallback, useEffect } from "react";
import { orderService } from "../services/orderService";
import { VALIDATION_RULES } from "../services/schema";

const DEBOUNCE_MS = 400;

/**
 * Single source of truth for "is this PIN code deliverable" checks.
 * Handles debouncing, request cancellation (so a fast typer never sees a
 * stale response overwrite a newer one), and exposes a derived `pinStatus`
 * ("idle" | "loading" | "valid" | "invalid") for badge UI.
 *
 * Usage:
 *   const shipping = useShippingServiceability();
 *   shipping.checkPincode(value); // call on every postalCode change
 *   shipping.reset();             // call when opening a fresh form / modal
 */
export function useShippingServiceability() {
  const [shippingInfo, setShippingInfo] = useState(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState(null);

  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  const runCheck = useCallback((pincode) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setShippingLoading(true);
    setShippingError(null);

    orderService
      .checkServiceability(pincode, { signal: controller.signal })
      .then((data) => {
        if (data?.success) {
          setShippingInfo(data.data);
        } else {
          setShippingInfo(null);
          setShippingError("Delivery not available for this PIN code");
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError" && err.name !== "CanceledError") {
          setShippingInfo(null);
          setShippingError("Could not check delivery for this PIN code");
        }
      })
      .finally(() => setShippingLoading(false));
  }, []);

  /** Call this on every keystroke of the PIN field; debounces + validates format internally. */
  const checkPincode = useCallback(
    (pincode) => {
      setShippingInfo(null);
      setShippingError(null);
      clearTimeout(debounceRef.current);

      if (VALIDATION_RULES.POSTAL_CODE_REGEX.test(pincode)) {
        debounceRef.current = setTimeout(() => runCheck(pincode), DEBOUNCE_MS);
      }
    },
    [runCheck],
  );

  /** Call when opening a fresh address form so stale results don't leak in. */
  const reset = useCallback(() => {
    clearTimeout(debounceRef.current);
    abortRef.current?.abort();
    setShippingInfo(null);
    setShippingError(null);
    setShippingLoading(false);
  }, []);

  useEffect(
    () => () => {
      clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    },
    [],
  );

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