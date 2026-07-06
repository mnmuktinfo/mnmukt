import React, { useState, useEffect, useRef } from "react";
import { X, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom"; // ✅ Added router import

import { useCart } from "../../features/cart/context/CartContext";
import { useAuth } from "../../features/auth/context/UserContext";
import { useCheckout } from "../../features/orders/hooks/useCheckout";
import { useShippingServiceability } from "../../features/orders/hooks/useShippingServiceability";

import { OrderPricingService } from "../../features/orders/services/core/orderPricing.service";
import { OrderValidationService } from "../../features/orders/services/core/orderValidation.service";
import {
  EMPTY_ADDRESS_FORM,
  PAYMENT_METHODS,
  VALIDATION_RULES,
} from "../../features/orders/services/schema";

import CartView from "./CartView";
import CheckoutAddressView from "./CheckoutAddressView";

const CartDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate(); // ✅ Setup navigation
  const { user, address } = useAuth();
  const { cart, updateQuantity, remove, loading: cartLoading } = useCart();

  const {
    isLoading,
    error: checkoutError,
    loadingMessage,
    performCheckout,
  } = useCheckout();

  const pricing = OrderPricingService.calculatePricing(cart);

  const [uiMode, setUiMode] = useState("cart");
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [localError, setLocalError] = useState(""); // ✅ New local error state to replace alerts

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const [addressDraft, setAddressDraft] = useState({
    ...EMPTY_ADDRESS_FORM,
    email: user?.email || "",
    fullName: user?.name || "",
  });

  const [formErrors, setFormErrors] = useState({});

  const {
    shippingInfo,
    shippingLoading,
    shippingError,
    pinStatus,
    checkPincode,
    reset: resetShipping,
  } = useShippingServiceability();

  const redirectTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    const initialAddress = {
      ...EMPTY_ADDRESS_FORM,
      email: address?.email || user?.email || "",
      fullName: address?.fullName || user?.name || "",
      phone: address?.phone || user?.phone || "",
      addressLine1: address?.addressLine1 || "",
      addressLine2: address?.addressLine2 || "",
      city: address?.city || "",
      district: address?.district || "",
      state: address?.state || "",
      postalCode: address?.postalCode || "",
      landmark: address?.landmark || "",
      tag: address?.tag || "Home",
      id: crypto.randomUUID(),
    };

    setAddressDraft(initialAddress);

    if (address?.addressLine1) {
      setSavedAddresses([initialAddress]);
      setSelectedAddress(initialAddress);
      setIsEditingAddress(false);
    } else {
      setIsEditingAddress(true);
    }
  }, [user, address]);

  useEffect(() => {
    if (
      !isEditingAddress &&
      selectedAddress?.postalCode &&
      VALIDATION_RULES.POSTAL_CODE_REGEX.test(selectedAddress.postalCode)
    ) {
      checkPincode(selectedAddress.postalCode);
    }
  }, [selectedAddress, isEditingAddress, checkPincode]);

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;

    setAddressDraft((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "postalCode") {
      checkPincode(value);
    }

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleNewAddress = () => {
    resetShipping();
    setAddressDraft({
      ...EMPTY_ADDRESS_FORM,
      email: user?.email || "",
      fullName: user?.name || "",
    });
    setFormErrors({});
    setIsEditingAddress(true);
  };

  const handleSaveAddress = () => {
    const validation = OrderValidationService.validateAddress(addressDraft);
    if (!validation.isValid) {
      setFormErrors(validation.errors || { form: validation.error });
      return false;
    }

    const newAddress = {
      ...addressDraft,
      id: crypto.randomUUID(),
    };

    setSavedAddresses((prev) => [...prev, newAddress]);
    setSelectedAddress(newAddress);
    setFormErrors({});
    setIsEditingAddress(false);

    checkPincode(newAddress.postalCode);
    return true;
  };

  const handleSelectAddress = (selected) => {
    resetShipping();
    setSelectedAddress(selected);
    setAddressDraft(selected);
    setIsEditingAddress(false);
  };

  const handleCheckout = async (paymentMethod = PAYMENT_METHODS.RAZORPAY) => {
    setLocalError(""); // Reset local errors

    const cartValidation = OrderValidationService.validateCartItems(cart);
    if (!cartValidation.isValid) {
      setLocalError(cartValidation.error); // ✅ Replaced alert
      return;
    }

    const checkoutAddress = selectedAddress || addressDraft;
    const addressValidation =
      OrderValidationService.validateAddress(checkoutAddress);

    if (!addressValidation.isValid) {
      setFormErrors(
        addressValidation.errors || { form: addressValidation.error },
      );
      setIsEditingAddress(true);
      return;
    }

    if (shippingLoading) {
      setLocalError(
        "Please wait while delivery availability is being checked.",
      ); // ✅ Replaced alert
      return;
    }

    if (!shippingInfo?.available) {
      setLocalError(shippingError || "Delivery is not available for this PIN."); // ✅ Replaced alert
      return;
    }

    const result = await performCheckout({
      items: cart,
      shippingAddress: checkoutAddress,
      paymentMethod,
    });

    if (result.success) {
      redirectTimerRef.current = setTimeout(() => {
        setUiMode("cart");
        onClose();
        navigate(`/order-tracking/${result.orderId}`); // ✅ Replaced window.location.href
      }, 1200);
    }
  };

  if (!isOpen) return null;

  // Determine the error message to show (prioritize checkout errors from backend)
  const displayError = checkoutError || localError;

  return (
    <div className="fixed inset-0 z-[500] flex justify-end bg-black/50">
      <div className="w-full max-w-md bg-white h-full flex flex-col">
        <div className="flex justify-between p-5 border-b">
          <h2 className="font-semibold">
            {uiMode === "address" ? "Shipping Details" : "Your Cart"}
          </h2>

          <button onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        {/* Unified Error Banner */}
        {displayError && (
          <div className="m-4 p-3 bg-red-50 border border-red-200 rounded flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
            <span className="text-red-700 text-sm">{displayError}</span>
          </div>
        )}

        {uiMode === "address" ? (
          <CheckoutAddressView
            cart={cart}
            pricing={pricing}
            updateQuantity={updateQuantity}
            savedAddresses={savedAddresses}
            selectedAddress={selectedAddress}
            onSelectAddress={handleSelectAddress}
            isEditing={isEditingAddress}
            onEditClick={() => setIsEditingAddress(true)}
            onSaveAddress={handleSaveAddress}
            formErrors={formErrors}
            addressDraft={addressDraft}
            onAddressChange={handleAddressChange}
            onAddNewAddress={handleNewAddress}
            pinLoading={shippingLoading}
            pinStatus={pinStatus}
            shippingLoading={shippingLoading}
            shippingInfo={shippingInfo}
            shippingError={shippingError}
            isLoading={isLoading}
            hasItems={!!cart?.length}
            onPayNow={() => handleCheckout(PAYMENT_METHODS.RAZORPAY)}
            onCashOnDelivery={() => handleCheckout(PAYMENT_METHODS.COD)}
          />
        ) : (
          <CartView
            cart={cart}
            pricing={pricing}
            isLoading={isLoading}
            onUpdateQuantity={updateQuantity}
            onRemove={remove}
            onProceedToAddress={() => setUiMode("address")}
          />
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
