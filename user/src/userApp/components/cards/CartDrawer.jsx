// src/components/CartDrawer.jsx
import React, { useMemo, useState } from "react";
import { X, Minus, Plus, Trash2, AlertCircle } from "lucide-react";
import { useCart } from "../../features/cart/context/CartContext";
import { useAuth } from "../../features/auth/context/UserContext";
import { useCheckout } from "../../features/orders/hooks/useCheckout";
import {
  EMPTY_ADDRESS_FORM,
  PAYMENT_GATEWAY,
  ERROR_MESSAGES,
} from "../../features/orders/constants/appConstants";
import {
  formatPrice,
  calculatePoints,
  getDiscount,
  validateCartItems,
} from "../../features/orders/services/checkoutService";
import AddressForm from "../form/AddressForm";

const CartDrawer = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { cart, updateQuantity, remove, loading: cartLoading } = useCart();
  const {
    isLoading,
    error: checkoutError,
    loadingMessage,
    performCheckout,
    performAddressValidation,
  } = useCheckout();

  // ================= STATE =================
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    ...EMPTY_ADDRESS_FORM,
    email: user?.email || "",
    fullName: user?.name || "",
  });
  const [formErrors, setFormErrors] = useState({});

  // ================= CALCULATIONS =================
  const { totalMRP, subtotal, savingsAmount } = useMemo(() => {
    if (!cart?.length) {
      return { totalMRP: 0, subtotal: 0, savingsAmount: 0 };
    }

    const result = cart.reduce(
      (acc, item) => {
        const qty = item.quantity || 1;
        const original = item.originalPrice || item.price || 0;
        const current = item.price || 0;

        acc.totalMRP += original * qty;
        acc.subtotal += current * qty;

        return acc;
      },
      { totalMRP: 0, subtotal: 0 },
    );

    return {
      ...result,
      savingsAmount: result.totalMRP - result.subtotal,
    };
  }, [cart]);

  // ================= HANDLERS =================
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleCheckout = async () => {
    // ✅ NEW: Validate cart items first
    const cartValidation = validateCartItems(cart);
    if (!cartValidation.isValid) {
      alert(
        `❌ ${cartValidation.error}\n\n${cartValidation.errors.join("\n")}`,
      );
      return;
    }

    // ✅ Validate address
    const addressValidation = performAddressValidation(shippingAddress);
    if (!addressValidation.isValid) {
      setFormErrors(addressValidation.errors);
      return;
    }

    setFormErrors({});

    const result = await performCheckout({
      items: cart,
      shippingAddress,
      paymentMethod: PAYMENT_GATEWAY.RAZORPAY,
      source: "web",
    });

    if (result?.success) {
      setTimeout(() => {
        setShippingAddress({ ...EMPTY_ADDRESS_FORM });
        setShowAddressForm(false);
        onClose();
        window.location.href = `/order-tracking/${result.orderId}`;
      }, 1200);
    }
  };

  // ================= RENDER =================
  if (!isOpen) return null;

  if (cartLoading) {
    return (
      <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
        <div className="w-full max-w-md bg-white h-full shadow-xl flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Loading cart...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-500 flex justify-end bg-black/50 transition-opacity">
      <div className="w-full max-w-md bg-white h-full shadow-xl flex flex-col font-sans">
        {/* ============ HEADER ============ */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-[17px] font-semibold text-gray-900">
            {showAddressForm ? "Shipping Details" : "Your Cart"}
          </h2>

          <p className="text-[12px] text-gray-500 mt-0.5">
            {showAddressForm
              ? "Enter your delivery address"
              : "Review your selected items"}
          </p>
          <button
            onClick={() => {
              if (showAddressForm) {
                setShowAddressForm(false);
                setFormErrors({});
              } else {
                onClose();
              }
            }}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isLoading}
            type="button"
            aria-label="Close cart">
            <X size={24} className="text-gray-900" />
          </button>
        </div>

        {/* ============ ERROR ALERT ============ */}
        {checkoutError && (
          <div className="mx-4 mt-4 flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle
              size={20}
              className="text-red-600 flex-shrink-0 mt-0.5"
            />
            <div>
              <p className="text-red-800 text-sm font-medium">Error</p>
              <p className="text-red-700 text-sm mt-1">{checkoutError}</p>
            </div>
          </div>
        )}

        {/* ============ ADDRESS FORM ============ */}
        {showAddressForm ? (
          <div className="flex-1 overflow-y-auto p-5">
            <AddressForm
              form={shippingAddress}
              errors={formErrors}
              onChange={handleAddressChange}
              disabled={isLoading}
            />
          </div>
        ) : (
          <>
            {/* ============ CART ITEMS ============ */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {!cart?.length ? (
                <p className="text-center text-gray-500 mt-10">
                  Your cart is empty.
                </p>
              ) : (
                cart.map((item) => {
                  const discount = getDiscount(
                    item.originalPrice || item.price,
                    item.price,
                  );

                  return (
                    <div key={item.cartKey} className="flex gap-4">
                      <div className="w-24 h-32 flex-shrink-0 bg-gray-50 overflow-hidden rounded">
                        <img
                          src={item.image || "/placeholder-image.jpg"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "/placeholder-image.jpg";
                          }}
                        />
                      </div>

                      <div className="flex flex-col flex-1">
                        <h3 className="text-[14px] text-gray-800 leading-snug font-medium">
                          {item.name}
                        </h3>

                        <div className="flex items-center gap-2 mt-1.5">
                          {discount > 0 && (
                            <span className="text-[14px] text-gray-400 line-through">
                              ₹{formatPrice(item.originalPrice || 0)}
                            </span>
                          )}
                          <span className="text-[14px] text-gray-900 font-medium">
                            ₹{formatPrice(item.price || 0)}
                          </span>
                          {discount > 0 && (
                            <span className="text-[14px] text-red-500 font-medium">
                              {discount}% off
                            </span>
                          )}
                        </div>

                        {item.selectedSize && (
                          <p className="text-[13px] text-gray-600 mt-1">
                            Size:{" "}
                            <span className="font-semibold">
                              {item.selectedSize}
                            </span>
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-gray-200 rounded">
                            <button
                              onClick={() =>
                                updateQuantity(item.cartKey, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1 || isLoading}
                              className="px-3 py-1 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                              type="button"
                              aria-label="Decrease quantity">
                              <Minus size={14} />
                            </button>
                            <span className="px-3 py-1 text-[14px] text-gray-900 min-w-[2.5rem] text-center border-x border-gray-200">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.cartKey, item.quantity + 1)
                              }
                              disabled={isLoading}
                              className="px-3 py-1 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                              type="button"
                              aria-label="Increase quantity">
                              <Plus size={14} />
                            </button>
                          </div>

                          <button
                            onClick={() => remove(item.cartKey)}
                            disabled={isLoading}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                            type="button"
                            aria-label="Remove item">
                            <Trash2 size={18} />
                          </button>
                        </div>

                        <p className="text-[12px] text-purple-600 mt-2.5">
                          Earn{" "}
                          <span className="font-semibold">
                            ₹{calculatePoints(item.price * item.quantity)}
                          </span>{" "}
                          points
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* ============ FOOTER & CHECKOUT ============ */}
        {cart?.length > 0 && (
          <div className="bg-white border-t border-gray-200 p-5 shadow-[0_-4px_15px_rgba(0,0,0,0.03)]">
            {!showAddressForm && (
              <>
                {savingsAmount > 0 && (
                  <div className="mb-4 flex items-center justify-center gap-2 rounded-md bg-[#0BA84A] px-4 py-2.5 text-white shadow-sm">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="flex-shrink-0">
                      <path
                        d="M12 1L14.6 3.6H18.4V7.4L21 10L18.4 12.6V16.4H14.6L12 19L9.4 16.4H5.6V12.6L3 10L5.6 7.4V3.6H9.4L12 1Z"
                        fill="white"
                      />
                      <path
                        d="M8 14L16 6"
                        stroke="#0BA84A"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>

                    <span className="text-[15px] font-medium tracking-wide">
                      You are saving{" "}
                      <span className="font-bold">
                        ₹{formatPrice(savingsAmount)}
                      </span>
                      !
                    </span>
                  </div>
                )}

                <div className="mb-4 space-y-2 text-[13px]">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal (MRP)</span>
                    <span>₹{formatPrice(totalMRP)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{formatPrice(savingsAmount)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>FREE</span>
                  </div>
                  <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>₹{formatPrice(subtotal)}</span>
                  </div>
                </div>
              </>
            )}

            <button
              onClick={() => {
                if (!showAddressForm) {
                  setShowAddressForm(true);
                  return;
                }
                handleCheckout();
              }}
              disabled={isLoading || !cart?.length}
              className="w-full py-3.5 px-4 bg-black hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-[4px] text-white font-semibold text-[13px] tracking-widest uppercase transition-all duration-300 shadow-sm flex items-center justify-center gap-3"
              type="button">
              <span>
                {isLoading
                  ? "Processing..."
                  : showAddressForm
                    ? "PAY NOW"
                    : "BUY NOW"}
              </span>
              {!showAddressForm && !isLoading && (
                <img
                  src="https://cdn.gokwik.co/v4/images/upi-icons.svg"
                  alt="Payment Options"
                  className="w-[66px] h-[26px]"
                />
              )}
            </button>

            <p className="text-center text-xs text-gray-500 mt-3">
              💳 Secured by Razorpay
            </p>
          </div>
        )}

        {/* ============ LOADING OVERLAY ============ */}
        {loadingMessage && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]">
            <div className="bg-white p-7 rounded-2xl shadow-2xl flex flex-col items-center max-w-xs text-center border border-gray-100">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mb-4"></div>
              <p className="font-semibold text-gray-900">{loadingMessage}</p>
              <p className="text-xs text-gray-500 mt-2">
                Please don't refresh or close this page.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
