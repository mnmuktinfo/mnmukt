import React, { useMemo, useEffect, useRef, useState } from "react";
import { useAuth } from "../features/auth/context/UserContext";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useCheckout } from "../features/orders/hooks/useCheckout";
import { useShippingServiceability } from "../features/orders/hooks/useShippingServiceability";
import { useAddressBook } from "../features/address/hook/useAddressBook";

import { OrderPricingService } from "../features/orders/services/core/orderPricing.service";
import { OrderValidationService } from "../features/orders/services/core/orderValidation.service";
import {
  PAYMENT_METHODS,
  VALIDATION_RULES,
} from "../features/orders/services/schema";

import { AlertCircle, ShoppingBag } from "lucide-react";

// NOTE: adjust this relative path so it points at the same
// CheckoutAddressView that CartDrawer renders (it lives next to
// CartDrawer.jsx in your project, e.g. "../components/cart/CheckoutAddressView").
import CheckoutAddressView from "../components/cards/CheckoutAddressView";

const STORE_NAME = import.meta.env.VITE_STORE_NAME || "bAbli";

const SingleItemCheckout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { isLoading, error: checkoutError, performCheckout } = useCheckout();

  const {
    items: stateItems,
    item: legacyItem,
    source = "web",
  } = location.state || {};
  const rawItem = stateItems?.[0] || legacyItem || null;

  const selectedSize =
    searchParams.get("variant") || rawItem?.selectedSize || "";
  const selectedQuantity = Number(searchParams.get("qty")) || 1;

  const [quantity, setQuantity] = useState(selectedQuantity);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // ── Normalize the "buy now" item into the same shape the real cart uses ──
  const normalizedItem = useMemo(() => {
    if (!rawItem) return null;
    const productId = rawItem.productId || rawItem._id || rawItem.id;
    return {
      cartKey: rawItem.cartKey || `${productId}-${selectedSize}`,
      productId,
      sku: rawItem.sku || "",
      name: rawItem.name || "",
      image: rawItem.image || rawItem.banner || rawItem.thumbnail || "",
      quantity,
      price: Number(rawItem.price ?? 0),
      originalPrice: Number(rawItem.originalPrice || rawItem.price || 0),
      variant: {
        size: selectedSize,
        color: rawItem.selectedColor || rawItem.variant?.color || "",
      },
      category: rawItem.category || "",
      brand: rawItem.brand || "",
      selectedSize,
    };
  }, [rawItem, selectedSize, quantity]);

  // Treat this single item as a one-item "cart" so we can drive it through
  // the exact same pricing/validation/checkout pipeline as CartDrawer.
  const cart = useMemo(
    () => (normalizedItem ? [normalizedItem] : []),
    [normalizedItem],
  );

  const pricing = useMemo(
    () => OrderPricingService.calculatePricing(cart),
    [cart],
  );

  const handleUpdateQuantity = (cartKey, nextQty) => {
    if (nextQty < 1) return;
    setQuantity(nextQty);
  };

  // ── Address book (identical hook to CartDrawer — works for guest + logged-in) ──
  const {
    isGuest,
    addresses,
    selectedAddress,
    addressDraft,
    formErrors,
    isEditing,
    listLoading,
    actionLoading,
    actionError,
    handleAddressChange,
    startNewAddress,
    startEditAddress,
    selectAddress,
    saveAddress,
    removeAddress,
    markDefault,
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

  // Re-check serviceability whenever the effective delivery pincode changes.
  useEffect(() => {
    const pin = (selectedAddress || addressDraft)?.postalCode;
    const isValidPin = pin && VALIDATION_RULES.POSTAL_CODE_REGEX.test(pin);

    if (!isEditing && isValidPin && pin !== lastCheckedPinRef.current) {
      lastCheckedPinRef.current = pin;
      checkPincode(pin);
    }
  }, [selectedAddress, addressDraft, isEditing, checkPincode]);

  const handleSelectAddress = (address) => {
    resetShipping();
    lastCheckedPinRef.current = null;
    selectAddress(address);
  };

  const handleAddNewAddress = () => {
    resetShipping();
    lastCheckedPinRef.current = null;
    startNewAddress();
  };

  const handleDeleteAddress = async (address) => {
    if (address.id === selectedAddress?.id) {
      resetShipping();
      lastCheckedPinRef.current = null;
    }
    await removeAddress(address);
  };

  const handleCheckout = async (paymentMethod = PAYMENT_METHODS.RAZORPAY) => {
    setLocalError("");

    const cartValidation = OrderValidationService.validateCartItems(cart);
    if (!cartValidation.isValid) {
      setLocalError(cartValidation.error);
      return;
    }

    const checkoutAddress = selectedAddress || addressDraft;
    const addressValidation =
      OrderValidationService.validateAddress(checkoutAddress);

    if (!addressValidation.isValid) {
      startEditAddress(checkoutAddress);
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

    const result = await performCheckout({
      items: cart,
      shippingAddress: checkoutAddress,
      paymentMethod,
      isGuest,
      source,
    });

    if (result?.success) {
      setTimeout(() => {
        navigate(`/order-tracking/${result.orderId}`);
      }, 1200);
    }
  };

  const handleSignIn = () => {
    const currentUrl = location.pathname + location.search;
    navigate("/login", { state: { returnUrl: currentUrl } });
  };

  if (!rawItem || !selectedSize) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Nothing to checkout
          </h2>
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 bg-[#0058a3] text-white rounded-md font-medium text-sm hover:bg-blue-700 transition-colors">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const displayError = checkoutError || localError || actionError;

  return (
    <div className="min-h-screen bg-white font-sans">
      <header className="max-w-6xl mx-auto px-4 sm:px-8 pt-8 flex justify-between items-center">
        <h1 className="text-3xl font-light text-pink-500 tracking-wide">
          {STORE_NAME}
        </h1>
        <div className="flex items-center gap-4">
          {!user && (
            <button
              onClick={handleSignIn}
              className="text-blue-600 hover:underline text-sm font-medium">
              Sign in
            </button>
          )}
          <ShoppingBag className="text-blue-600 lg:hidden" size={24} />
        </div>
      </header>

      {displayError && (
        <div className="max-w-6xl mx-auto px-4 sm:px-8 mt-6">
          <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle
              size={20}
              className="text-red-600 flex-shrink-0 mt-0.5"
            />
            <div>
              <p className="text-red-800 text-sm font-medium">
                Error processing order
              </p>
              <p className="text-red-700 text-sm mt-1">{displayError}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        {/* Same address/shipping/payment view CartDrawer uses, driven by the
            same hooks and services — just rendered full-page instead of in a drawer. */}
        <CheckoutAddressView
          cart={cart}
          pricing={pricing}
          updateQuantity={handleUpdateQuantity}
          isGuest={isGuest}
          savedAddresses={addresses}
          selectedAddress={selectedAddress}
          onSelectAddress={handleSelectAddress}
          isEditing={isEditing}
          onSaveAddress={saveAddress}
          onEditAddress={startEditAddress}
          onDeleteAddress={handleDeleteAddress}
          onSetDefaultAddress={markDefault}
          formErrors={formErrors}
          addressDraft={addressDraft}
          onAddressChange={handleAddressChange}
          onAddNewAddress={handleAddNewAddress}
          listLoading={listLoading}
          pinLoading={shippingLoading}
          pinStatus={pinStatus}
          shippingLoading={shippingLoading}
          shippingInfo={shippingInfo}
          shippingError={shippingError}
          isLoading={isLoading || actionLoading}
          hasItems={!!cart.length}
          onPayNow={() => handleCheckout(PAYMENT_METHODS.RAZORPAY)}
          onCashOnDelivery={() => handleCheckout(PAYMENT_METHODS.COD)}
        />
      </div>
    </div>
  );
};

export default SingleItemCheckout;
