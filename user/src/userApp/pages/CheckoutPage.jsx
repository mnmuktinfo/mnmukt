import React, { useMemo, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/context/UserContext";
import { useCart } from "../features/cart/context/CartContext";
import {
  ExclamationCircleIcon,
  ShoppingBagIcon,
  MapPinIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  MinusIcon,
  PlusIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";

import { useCheckout } from "../features/orders/hooks/useCheckout";
import { useShippingServiceability } from "../features/orders/hooks/useShippingServiceability";
import { useAddressBook } from "../features/address/hook/useAddressBook";

import { OrderPricingService } from "../features/orders/services/core/orderPricing.service";
import { OrderValidationService } from "../features/orders/services/core/orderValidation.service";
import {
  PAYMENT_METHODS,
  PRICING_DEFAULTS,
} from "../features/orders/services/schema";
import Footer from "../components/footer/Footer";
import { IMAGES } from "../../assets/images";

// NOTE: adjust this path if appLogo.png doesn't live at src/assets/images/

// ---------- Helpers ----------

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const inputClass = (hasError) =>
  `w-full px-3.5 py-3 text-[14px] rounded-md border outline-none transition-colors bg-white ${
    hasError
      ? "border-red-400 focus:border-red-500"
      : "border-gray-300 focus:border-black"
  }`;

// Normalizes a raw "buy now" item (from a product page) into the same
// shape the cart uses, so pricing/quantity logic can treat both the same.
const normalizeItems = (items = []) =>
  items.map((rawItem) => {
    const productId = rawItem.productId || rawItem.id;
    const selectedSize =
      rawItem.selectedSize || rawItem.variant?.size || "onesize";
    return {
      ...rawItem,
      cartKey: rawItem.cartKey || `${productId}_${selectedSize}`,
      productId,
      quantity: rawItem.quantity || 1,
      price: Number(rawItem.price ?? 0),
      originalPrice: Number(rawItem.originalPrice || rawItem.price || 0),
      variant: {
        size: selectedSize,
        color: rawItem.selectedColor || rawItem.variant?.color || null,
      },
    };
  });

// ---------- Checkout session persistence ----------
//
// "Buy Now" and "cart" checkout both arrive here via `navigate(..., { state })`.
// That state is lost on a hard refresh or direct URL visit, which previously
// made this page think there was nothing to check out and bounce to "/".
// We mirror it into sessionStorage so a refresh can recover it.

const CHECKOUT_SESSION_KEY = "checkout:lastSession";

const readStoredCheckoutSession = () => {
  try {
    const raw = sessionStorage.getItem(CHECKOUT_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    // sessionStorage can throw in private/incognito modes — treat as "no session"
    return null;
  }
};

const writeStoredCheckoutSession = (session) => {
  try {
    sessionStorage.setItem(CHECKOUT_SESSION_KEY, JSON.stringify(session));
  } catch {
    // Non-critical — worst case a refresh just won't recover the session.
  }
};

const clearStoredCheckoutSession = () => {
  try {
    sessionStorage.removeItem(CHECKOUT_SESSION_KEY);
  } catch {
    // no-op
  }
};

// Guards against an infinite error loop if the placeholder image itself
// fails to load.
const handleItemImageError = (e) => {
  if (!e.target.dataset.fallback) {
    e.target.dataset.fallback = "true";
    e.target.src = "/placeholder-image.jpg";
  }
};

// Reusable size/color line for a cart item, used in both the mobile and
// desktop summaries. Kept at module scope (not defined inside CheckoutPage)
// so it isn't recreated — and its DOM remounted — on every render.
const ItemAttributes = ({ item }) => {
  const size = item.variant?.size;
  const color = item.variant?.color;

  return (
    <div className="mt-1 space-y-1">
      {size && size !== "onesize" && (
        <div className="flex items-center gap-1.5 text-[12px]">
          <span className="text-gray-400">Size:</span>
          <span className="font-medium text-gray-700">{size}</span>
        </div>
      )}
      {color && (
        <div className="flex items-center gap-1.5 text-[12px]">
          <span className="text-gray-400">Color:</span>
          <span className="font-medium text-gray-700">
            {typeof color === "object" ? color.name : color}
          </span>
          {typeof color === "object" && color.hex && (
            <span
              className="w-3 h-3 rounded-full border border-gray-200 shadow-sm ml-1"
              style={{ backgroundColor: color.hex }}
            />
          )}
        </div>
      )}
    </div>
  );
};

const CheckoutPage = () => {
  const { user, isLoggedIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Bring in global Cart Context (Using removePurchasedItems for safety)
  const {
    cart: globalCart,
    updateQuantity: updateGlobalQuantity,
    removePurchasedItems,
  } = useCart();

  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [localError, setLocalError] = useState("");

  const { isLoading, error: checkoutError, performCheckout } = useCheckout();

  // ── Determine Source (Cart vs Buy Now) ─────────────────────────────────
  // Prefer fresh router state (we just navigated here). If it's missing —
  // most likely because the page was refreshed — recover the last saved
  // session from sessionStorage instead of treating checkout as empty.
  const [checkoutSource, setCheckoutSource] = useState(() => {
    if (location.state?.items?.length) {
      return {
        items: location.state.items,
        type: location.state.type || "single",
      };
    }
    return readStoredCheckoutSession() || { items: [], type: "single" };
  });

  const isCartMode = checkoutSource.type === "cart";

  const [localItems, setLocalItems] = useState(() =>
    isCartMode ? [] : normalizeItems(checkoutSource.items),
  );

  // Keep things in sync if fresh state arrives (e.g. "Buy Now" clicked on a
  // different product without a full page reload), and persist every fresh
  // navigation so a later refresh can recover it.
  useEffect(() => {
    if (!location.state?.items?.length) return;

    const nextSource = {
      items: location.state.items,
      type: location.state.type || "single",
    };
    writeStoredCheckoutSession(nextSource);
    setCheckoutSource(nextSource);
    if (nextSource.type !== "cart") {
      setLocalItems(normalizeItems(nextSource.items));
    }
  }, [location.state]);

  const displayItems = isCartMode ? globalCart : localItems;

  // Scroll to top once, on mount — not on every displayItems change.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!displayItems || displayItems.length === 0) {
      navigate("/");
    }
  }, [displayItems, navigate]);

  // ── Pricing Calculation ────────────────────────────────────────────────
  const pricing = useMemo(
    () => OrderPricingService.calculatePricing(displayItems),
    [displayItems],
  );

  const {
    itemsTotal = 0,
    shippingFee = 0,
    discount: cartDiscount = 0,
    tax = 0,
    totalAmount = 0,
  } = pricing || {};

  const originalTotalAmount = totalAmount + cartDiscount;

  // ✅ Explicitly calculate the COD Total for the UI button preview
  // FIX: use ?? instead of || so a legitimate COD_CHARGE of 0 (e.g. a
  // "free COD" promo) isn't silently overridden to 50.
  const activeCodCharge = PRICING_DEFAULTS?.COD_CHARGE ?? 50;
  const codTotal = totalAmount + activeCodCharge;

  // ── Unified Quantity Handler ───────────────────────────────────────────
  const handleQuantityChange = (cartKey, currentQty, change, stock) => {
    const nextQty = currentQty + change;
    // FIX: use ?? instead of || so stock === 0 (out of stock) isn't treated
    // as "no stock info" and defaulted to a cap of 10.
    const maxQty = Math.min(stock ?? 10, 10);
    if (nextQty < 1 || nextQty > maxQty) return;

    if (isCartMode) {
      updateGlobalQuantity(cartKey, nextQty);
    } else {
      setLocalItems((prev) =>
        prev.map((item) =>
          item.cartKey === cartKey ? { ...item, quantity: nextQty } : item,
        ),
      );
    }
  };

  const {
    isGuest,
    addresses,
    selectedAddress,
    addressDraft,
    formErrors,
    listLoading,
    actionLoading,
    actionError,
    handleAddressChange,
    selectAddress,
    saveAddress,
  } = useAddressBook();

  const {
    shippingInfo,
    shippingLoading,
    shippingError,
    pinStatus,
    checkPincode,
    reset: resetShipping,
  } = useShippingServiceability();

  const lastCheckedPinRef = useRef(null);

  useEffect(() => {
    const pin = (selectedAddress || addressDraft)?.postalCode;
    const isValidPin = pin && /^\d{6}$/.test(pin);

    if (isValidPin && pin !== lastCheckedPinRef.current) {
      lastCheckedPinRef.current = pin;
      checkPincode(pin);
    } else if (!isValidPin) {
      lastCheckedPinRef.current = null;
      resetShipping();
    }
  }, [(selectedAddress || addressDraft)?.postalCode, checkPincode]);

  // ── Checkout Execution ─────────────────────────────────────────────────
  const handleCheckout = async (paymentMethod = PAYMENT_METHODS.RAZORPAY) => {
    setLocalError("");

    const cartValidation =
      OrderValidationService.validateCartItems(displayItems);
    if (!cartValidation.isValid) {
      setLocalError(cartValidation.error);
      return;
    }

    if (shippingLoading) {
      setLocalError(
        "Please wait while delivery availability is being checked.",
      );
      return;
    }

    if (!shippingInfo?.available) {
      setLocalError(shippingError || "Delivery is not available for this PIN.");
      return;
    }

    const savedAddress = await saveAddress();

    if (!savedAddress) return;

    const checkoutAddress = savedAddress;
    const { email, saveToProfile, ...validShippingAddress } = checkoutAddress;
    const safePaymentMethod = String(paymentMethod).toLowerCase();

    // ✅ Safely apply the COD extra charge to the payload based on user selection
    const isCOD = safePaymentMethod === PAYMENT_METHODS.COD;
    const appliedCodFee = isCOD ? activeCodCharge : 0;

    const finalPricing = {
      ...pricing,
      codFee: appliedCodFee,
      totalAmount: (pricing.totalAmount || 0) + appliedCodFee,
    };

    let guestInfo = null;
    if (!isLoggedIn && email) {
      guestInfo = {
        email: email,
        name: validShippingAddress.fullName,
        phone: validShippingAddress.phone,
      };
    }

    // NOTE (security): items/pricing below are computed client-side and are
    // tamperable (sessionStorage, devtools, intercepted requests). The
    // backend order-creation endpoint MUST re-fetch current price/stock
    // per productId and recompute totals itself rather than trusting these
    // values. This file only fixes client-side logic bugs; server-side
    // revalidation is out of scope for this diff.
    const result = await performCheckout({
      items: displayItems,
      pricing: finalPricing,
      shippingAddress: validShippingAddress,
      guestInfo,
      paymentMethod: safePaymentMethod,
    });

    if (result?.success) {
      // Order placed — clear the recovery snapshot so it can't resurface
      // stale items on a future visit to this route.
      clearStoredCheckoutSession();
      if (isCartMode) {
        // ✅ Safely remove only the items purchased, preserving any non-checked-out items
        await removePurchasedItems(displayItems);
      }
      setTimeout(() => navigate(`/order-tracking/${result.orderId}`), 1200);
    }
  };

  const handleSignIn = () => {
    const currentUrl = location.pathname + location.search;
    navigate("/login", { state: { returnUrl: currentUrl } });
  };

  if (!displayItems || displayItems.length === 0) return null;

  const displayError = checkoutError || localError || actionError;
  const codBlocked = shippingInfo && shippingInfo.codAvailable === false;

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="w-full shadow-sm border-b border-gray-100 bg-white">
        <header className="w-full max-w-6xl mx-auto px-6 md:px-16 py-5 flex justify-between items-center">
          <div className="flex items-center">
            <img
              src={IMAGES.brand.logo}
              alt="Store Logo"
              className="h-8 md:h-10 w-auto object-contain cursor-pointer"
              onClick={() => navigate("/")}
            />
          </div>
          <div className="flex items-center gap-6">
            {!isLoggedIn && (
              <button
                onClick={handleSignIn}
                className="text-gray-600 hover:text-pink-500 transition-colors text-sm font-medium tracking-wide">
                Sign in
              </button>
            )}
            <button
              className="text-pink-500 hover:text-pink-600 transition-colors"
              onClick={() => navigate("/cart")}
              aria-label="View cart">
              <ShoppingBagIcon
                className="w-[26px] h-[26px]"
                strokeWidth={1.5}
              />
            </button>
          </div>
        </header>
      </div>

      {/* MOBILE SUMMARY */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-6 lg:hidden">
        <div className="bg-[#f9fafb] border border-gray-200 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
            className="w-full flex items-center justify-between p-4 bg-[#f9fafb] hover:bg-gray-100 transition-colors border-b border-gray-200">
            <div className="flex items-center gap-1 text-blue-600">
              <span className="text-[14px] font-medium">Order summary</span>
              {isSummaryExpanded ? (
                <ChevronUpIcon className="w-4 h-4" />
              ) : (
                <ChevronDownIcon className="w-4 h-4" />
              )}
            </div>
            <div className="text-right flex flex-col items-end">
              {cartDiscount > 0 && (
                <span className="text-[12px] text-gray-500 line-through leading-none mb-1">
                  {fmt(originalTotalAmount)}
                </span>
              )}
              <span className="text-[18px] font-semibold text-gray-900 leading-none">
                {fmt(totalAmount)}
              </span>
            </div>
          </button>

          <div
            className={`${isSummaryExpanded ? "block" : "hidden"} bg-[#f9fafb]`}>
            <div className="px-4 py-4 space-y-5">
              {displayItems.map((item, index) => (
                <div
                  key={item.cartKey || item.id || index}
                  className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md border border-gray-200 bg-white"
                      onError={handleItemImageError}
                    />
                    <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-black text-white text-[11px] font-semibold flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] text-gray-900 truncate">
                      {item.name}
                    </p>
                    <ItemAttributes item={item} />
                  </div>
                  <div className="text-right flex-shrink-0 flex flex-col items-end">
                    <p className="text-[14px] font-medium text-gray-900">
                      {fmt(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 pb-6 space-y-2 text-[14px] border-t border-gray-200 pt-5">
              <div className="flex justify-between text-gray-800">
                <span>Subtotal · {displayItems.length} items</span>
                <span className="font-medium">{fmt(itemsTotal)}</span>
              </div>
              <div className="flex justify-between text-gray-800">
                <span className="flex items-center gap-1">Shipping</span>
                <span>{shippingFee > 0 ? fmt(shippingFee) : "FREE"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {displayError && (
        <div className="max-w-6xl mx-auto px-4 sm:px-8 mt-6">
          <div className="p-3 bg-red-50 border border-red-200 rounded flex items-start gap-2">
            <ExclamationCircleIcon className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
            <span className="text-red-700 text-sm">{displayError}</span>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
        <div className="flex flex-col lg:flex-row-reverse gap-10 lg:gap-16">
          {/* DESKTOP RIGHT PANEL */}
          <div className="hidden md:flex w-full lg:w-[42%]">
            <div className="lg:sticky lg:top-8 lg:bg-gray-50 lg:border lg:border-gray-100 rounded-xl lg:p-6 w-full">
              <div className="space-y-6">
                {displayItems.map((item, index) => (
                  <div
                    key={item.cartKey || item.id || index}
                    className="flex flex-col gap-2 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-md border border-gray-200"
                          onError={handleItemImageError}
                        />
                        <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-black text-white text-[11px] font-semibold flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium text-gray-900 truncate">
                          {item.name}
                        </p>
                        <ItemAttributes item={item} />
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center border border-gray-300 rounded bg-white">
                            <button
                              type="button"
                              onClick={() =>
                                handleQuantityChange(
                                  item.cartKey,
                                  item.quantity,
                                  -1,
                                  item.stock,
                                )
                              }
                              disabled={item.quantity <= 1}
                              className="px-2 py-0.5 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                              aria-label={`Decrease quantity of ${item.name}`}>
                              <MinusIcon className="w-3 h-3" />
                            </button>
                            <span className="px-3 text-[12px] font-medium">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleQuantityChange(
                                  item.cartKey,
                                  item.quantity,
                                  1,
                                  item.stock,
                                )
                              }
                              // FIX: use ?? instead of || so item.stock === 0
                              // correctly disables the increment button
                              // instead of falling back to a cap of 10.
                              disabled={item.quantity >= (item.stock ?? 10)}
                              className="px-2 py-0.5 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                              aria-label={`Increase quantity of ${item.name}`}>
                              <PlusIcon className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {item.originalPrice > item.price && (
                          <p className="text-[12px] text-gray-400 line-through">
                            {fmt(item.originalPrice * item.quantity)}
                          </p>
                        )}
                        <p className="text-[14px] font-semibold text-gray-900">
                          {fmt(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-2 text-[14px] border-t border-gray-200 pt-4">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>{fmt(itemsTotal)}</span>
                </div>
                {cartDiscount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Discount</span>
                    <span>-{fmt(cartDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  {/* ✅ UI checks logic from OrderPricingService */}
                  <span>{shippingFee > 0 ? fmt(shippingFee) : "FREE"}</span>
                </div>
                {tax > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>Tax</span>
                    <span>{fmt(tax)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-baseline">
                <span className="text-[16px] font-bold text-gray-900">
                  Total
                </span>
                <span className="text-[20px] font-bold text-gray-900">
                  {fmt(totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* LEFT PANEL: ADDRESS FORM */}
          <div className="w-full lg:w-[58%]">
            <section className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[18px] font-semibold text-gray-900">
                  Contact
                </h2>
                {!isLoggedIn && (
                  <button
                    onClick={handleSignIn}
                    className="text-[14px] text-blue-600 hover:underline">
                    Sign in
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <input
                    type="email"
                    name="email"
                    value={addressDraft.email || ""}
                    onChange={handleAddressChange}
                    placeholder="Email"
                    className={inputClass(formErrors.email)}
                  />
                </div>
                <div>
                  <input
                    name="fullName"
                    value={addressDraft.fullName || ""}
                    onChange={handleAddressChange}
                    placeholder="Full name"
                    className={inputClass(formErrors.fullName)}
                  />
                </div>
              </div>
              <div className="mt-3">
                <input
                  name="phone"
                  value={addressDraft.phone || ""}
                  onChange={handleAddressChange}
                  placeholder="Mobile number"
                  className={inputClass(formErrors.phone)}
                />
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[18px] font-semibold text-gray-900">
                  Delivery
                </h2>
                {!isGuest && addresses.length > 1 && (
                  <select
                    value={selectedAddress?.id || ""}
                    onChange={(e) => {
                      const addr = addresses.find(
                        (a) => a.id === e.target.value,
                      );
                      if (addr) selectAddress(addr);
                    }}
                    className="text-[13px] border border-gray-300 rounded-md px-2 py-1.5 outline-none">
                    {addresses.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.tag || "Address"} — {a.city}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {listLoading ? (
                <div className="flex items-center gap-2 text-[13px] text-gray-500 py-6">
                  <ArrowPathIcon className="w-4 h-4 animate-spin" /> Loading
                  your details…
                </div>
              ) : (
                <>
                  <div className="relative mb-3">
                    <input
                      name="postalCode"
                      value={addressDraft.postalCode || ""}
                      onChange={handleAddressChange}
                      placeholder="Pincode"
                      maxLength={6}
                      className={inputClass(formErrors.postalCode)}
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                      {shippingLoading ? (
                        <ArrowPathIcon className="w-4 h-4 animate-spin text-gray-400" />
                      ) : (
                        <MapPinIcon className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {addressDraft.postalCode?.length === 6 && (
                    <div className="mb-3 text-[13px]">
                      {shippingLoading && (
                        <p className="text-gray-500">
                          Checking delivery availability…
                        </p>
                      )}
                      {!shippingLoading && shippingInfo?.available && (
                        <p className="text-green-700 font-medium flex items-center gap-1.5">
                          <CheckCircleIcon className="w-3.5 h-3.5" />{" "}
                          Deliverable
                        </p>
                      )}
                      {!shippingLoading &&
                        (shippingError || pinStatus === "invalid") && (
                          <p className="text-red-500 font-medium flex items-center gap-1.5">
                            <ExclamationCircleIcon className="w-3.5 h-3.5" />{" "}
                            {shippingError || "Not serviceable."}
                          </p>
                        )}
                    </div>
                  )}

                  <input
                    name="addressLine1"
                    value={addressDraft.addressLine1 || ""}
                    onChange={handleAddressChange}
                    placeholder="Flat, house no, building"
                    className={`${inputClass(formErrors.addressLine1)} mb-3`}
                  />
                  <input
                    name="addressLine2"
                    value={addressDraft.addressLine2 || ""}
                    onChange={handleAddressChange}
                    placeholder="Area, street, village"
                    className={`${inputClass(formErrors.addressLine2)} mb-3`}
                  />
                  <input
                    name="landmark"
                    value={addressDraft.landmark || ""}
                    onChange={handleAddressChange}
                    placeholder="Landmark (optional)"
                    className={`${inputClass(false)} mb-3`}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                    <input
                      name="city"
                      value={addressDraft.city || ""}
                      onChange={handleAddressChange}
                      placeholder="City"
                      className={inputClass(formErrors.city)}
                    />
                    <input
                      name="district"
                      value={addressDraft.district || ""}
                      onChange={handleAddressChange}
                      placeholder="District"
                      className={inputClass(formErrors.district)}
                    />
                    <input
                      name="state"
                      value={addressDraft.state || ""}
                      onChange={handleAddressChange}
                      placeholder="State"
                      className={inputClass(formErrors.state)}
                    />
                  </div>

                  {!isGuest && (
                    <label className="flex items-start gap-2 cursor-pointer mb-2">
                      <input
                        type="checkbox"
                        name="saveToProfile"
                        checked={addressDraft.saveToProfile || false}
                        onChange={handleAddressChange}
                        className="w-4 h-4 mt-0.5 accent-black"
                      />
                      <span className="text-[13px] text-gray-700">
                        Save this information for next time
                      </span>
                    </label>
                  )}
                </>
              )}
            </section>

            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] p-4 sm:static sm:border-0 sm:shadow-none sm:p-0 sm:bg-transparent mt-8">
              <div className="max-w-5xl mx-auto flex flex-row gap-3">
                <button
                  onClick={() => handleCheckout(PAYMENT_METHODS.COD)}
                  disabled={isLoading || actionLoading || codBlocked}
                  className="flex-1 h-[60px] border border-gray-300 font-semibold text-sm text-gray-900 bg-white hover:bg-gray-50 disabled:opacity-50 transition-all duration-200">
                  <div className="flex flex-col items-center justify-center">
                    <span>Cash on Delivery</span>
                    {/* ✅ Correctly displays Total + the COD extra charge */}
                    <span className="text-[11px] font-medium text-gray-500 mt-0.5">
                      Total: {fmt(codTotal)}
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => handleCheckout(PAYMENT_METHODS.RAZORPAY)}
                  disabled={isLoading || actionLoading}
                  className="flex-1 h-[60px] bg-black text-white font-semibold hover:bg-gray-800 disabled:opacity-50 transition-all duration-200">
                  {isLoading || actionLoading ? "Processing..." : "Pay Now"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
