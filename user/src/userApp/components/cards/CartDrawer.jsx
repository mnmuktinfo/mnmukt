// src/components/CartDrawer.jsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import { X, AlertCircle } from "lucide-react";
import { useCart } from "../../features/cart/context/CartContext";
import { useAuth } from "../../features/auth/context/UserContext";
import { useCheckout } from "../../features/orders/hooks/useCheckout";
import { useShippingServiceability } from "../../features/orders/hooks/useShippingServiceability";
import {
  EMPTY_ADDRESS_FORM,
  PAYMENT_GATEWAY,
} from "../../features/orders/services/schema";
import {
  validateCartItems,
  validateAddress,
  calculatePricing,
} from "../../features/orders/services/checkout/checkoutService";

import CartView from "./CartView";
import CheckoutAddressView from "./CheckoutAddressView";

const CartDrawer = ({ isOpen, onClose }) => {
  const { user, address } = useAuth();
  const { cart, updateQuantity, remove, loading: cartLoading } = useCart();

  const {
    isLoading,
    error: checkoutError,
    loadingMessage,
    performCheckout,
    performAddressValidation,
  } = useCheckout();

  const [uiMode, setUiMode] = useState("cart");

  const [isEditingAddress, setIsEditingAddress] = useState(false);

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

  const pricing = useMemo(
    () =>
      calculatePricing(cart, {
        shippingOverride: shippingInfo?.shippingCharge,
      }),
    [cart, shippingInfo],
  );

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
      id: Date.now(),
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
    if (!isEditingAddress && selectedAddress?.postalCode && !shippingLoading) {
      checkPincode(selectedAddress.postalCode);
    }
  }, [selectedAddress]);

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
    const { isValid, errors } = validateAddress(addressDraft);
    if (!isValid) {
      setFormErrors(errors);
      return false; // ADD
    }
    const newAddress = { ...addressDraft, id: Date.now() };
    setSavedAddresses((prev) => [...prev, newAddress]);
    setSelectedAddress(newAddress);
    setFormErrors({});
    setIsEditingAddress(false);
    return true; // ADD
  };

  const handleSelectAddress = (selected) => {
    // was `address`, shadowed the outer `address`
    setSelectedAddress(selected);
    setAddressDraft(selected);
    setIsEditingAddress(false);
  };

  const handleCheckout = async (paymentMethod = PAYMENT_GATEWAY.RAZORPAY) => {
    const cartValidation = validateCartItems(cart);

    if (!cartValidation.isValid) {
      alert(cartValidation.error);
      return;
    }

    const checkoutAddress = selectedAddress || addressDraft;

    const addressValidation = performAddressValidation(checkoutAddress);

    if (!addressValidation.isValid) {
      setFormErrors(addressValidation.errors);
      setIsEditingAddress(true);
      return;
    }

    const result = await performCheckout({
      items: cart,
      shippingAddress: checkoutAddress,
      paymentMethod,
      pricing,
      shippingInfo,
    });

    if (result?.success) {
      redirectTimerRef.current = setTimeout(() => {
        setUiMode("cart");
        onClose();

        window.location.href =
          result.trackingUrl || `/order-tracking/${result.orderId}`;
      }, 1200);
    }
  };

  if (!isOpen) return null;

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

        {checkoutError && (
          <div className="m-4 p-3 bg-red-50 border border-red-200 rounded">
            <AlertCircle size={16} />
            {checkoutError}
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
            onPayNow={handleCheckout}
            onCashOnDelivery={handleCheckout}
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
