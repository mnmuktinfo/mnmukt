import React, { useState, useMemo } from "react";
import {
  ChevronRightIcon,
  XMarkIcon,
  PlusIcon,
  MinusIcon,
} from "@heroicons/react/24/outline";

const toSafeNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

const formatPrice = (amount) => toSafeNumber(amount).toFixed(2);

const OrderSummaryModal = ({
  cart = [],
  pricing = {},
  updateQuantity,
  maxQuantityPerItem = 99,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const safeCart = Array.isArray(cart) ? cart : [];

  const totalItems = useMemo(
    () =>
      safeCart.reduce((acc, item) => acc + toSafeNumber(item?.quantity, 0), 0),
    [safeCart],
  );

  const itemText = `${totalItems} Item${totalItems !== 1 ? "s" : ""}`;
  const productCount = safeCart.length;

  const enrichedCart = useMemo(
    () =>
      safeCart.map((item, index) => {
        const quantity = toSafeNumber(item?.quantity, 1);
        const price = toSafeNumber(item?.price, 0);
        return {
          ...item,
          _key: item?.cartKey ?? item?.id ?? `line-${index}`,
          _quantity: quantity,
          _price: price,
          _lineTotal: quantity * price,
        };
      }),
    [safeCart],
  );

  const computedSubtotal = enrichedCart.reduce(
    (acc, i) => acc + i._lineTotal,
    0,
  );

  const subtotal =
    pricing?.subtotal != null
      ? toSafeNumber(pricing.subtotal)
      : computedSubtotal;

  const hasShippingInfo =
    pricing?.deliveryFee !== undefined && pricing?.deliveryFee !== null;

  const deliveryFee = toSafeNumber(pricing?.deliveryFee, 0);

  const totalPayable =
    pricing?.totalPayable != null
      ? toSafeNumber(pricing.totalPayable)
      : subtotal + (hasShippingInfo ? deliveryFee : 0);

  const handleQuantityChange = (cartKey, nextQty) => {
    if (typeof updateQuantity !== "function") {
      console.warn("updateQuantity prop is missing or not a function");
      return;
    }
    const clamped = Math.min(Math.max(1, nextQty), maxQuantityPerItem);
    updateQuantity(cartKey, clamped);
  };

  if (productCount === 0) {
    return (
      <div className="bg-white shadow-sm p-4 border border-gray-100 text-[14px] text-gray-500">
        Your cart is empty.
      </div>
    );
  }

  return (
    <>
      {/* CLOSED TRIGGER */}
      <div
        onClick={() => setIsOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setIsOpen(true)}
        className="bg-white shadow-sm p-4 border border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
        <div className="text-[15px] font-semibold text-gray-900">
          Order summary{" "}
          <span className="text-[#2563eb] font-normal text-[14px]">
            ({itemText}
            {productCount !== totalItems
              ? ` · ${productCount} product${productCount !== 1 ? "s" : ""}`
              : ""}
            )
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[15px] font-bold text-gray-900">
          ₹{formatPrice(totalPayable)}
          <ChevronRightIcon className="w-4 h-4 text-gray-400" strokeWidth={2} />
        </div>
      </div>

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-[600] flex flex-col justify-end bg-black/60 sm:items-center sm:justify-center p-4">
          {/* Close button */}
          <div className="w-full max-w-md flex justify-center mb-3 sm:hidden">
            <button
              onClick={() => setIsOpen(false)}
              type="button"
              className="bg-[#333] text-white p-2.5 shadow-lg hover:bg-black transition-colors">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Container */}
          <div className="w-full max-w-md bg-white flex flex-col max-h-[80vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-5 flex items-center justify-between border-b border-gray-100 shrink-0">
              <h2 className="text-[16px] font-bold text-gray-900">
                Order Summary{" "}
                <span className="text-[#2563eb] font-normal text-[14px]">
                  ({itemText})
                </span>
              </h2>

              <button
                onClick={() => setIsOpen(false)}
                type="button"
                className="hidden sm:block text-gray-500 hover:bg-gray-100 p-1.5 transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {enrichedCart.map((item) => (
                <div
                  key={item._key}
                  className="flex gap-4 p-3.5 border border-gray-100">
                  <div className="w-16 h-20 bg-gray-50 overflow-hidden shrink-0">
                    <img
                      src={item.image || "/placeholder.jpg"}
                      alt={item.name || "Product"}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <h3 className="text-[13.5px] text-gray-800 font-medium truncate">
                      {item.name || "Unnamed item"}
                    </h3>

                    <p className="text-[14px] font-bold text-gray-900 mt-1">
                      ₹{formatPrice(item._price)}
                    </p>
                  </div>

                  <div className="flex items-start justify-end shrink-0">
                    <div className="flex items-center border border-gray-300 overflow-hidden bg-white shadow-sm">
                      <button
                        type="button"
                        onClick={() =>
                          handleQuantityChange(item._key, item._quantity - 1)
                        }
                        className="p-1.5 text-gray-500 hover:bg-gray-50">
                        <MinusIcon className="w-3.5 h-3.5" />
                      </button>

                      <span className="text-[13px] font-semibold px-2.5 text-gray-900 min-w-[2rem] text-center">
                        {item._quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          handleQuantityChange(item._key, item._quantity + 1)
                        }
                        className="p-1.5 text-[#2563eb] hover:bg-blue-50">
                        <PlusIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-100 shrink-0 bg-white">
              <h3 className="text-[15px] font-bold text-gray-900 mb-3.5">
                Bill summary
              </h3>

              <div className="space-y-3 text-[14px]">
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>
                    Sub total ({totalItems} item{totalItems !== 1 ? "s" : ""})
                  </span>
                  <span>₹{formatPrice(subtotal)}</span>
                </div>

                {hasShippingInfo && (
                  <div className="flex justify-between text-gray-600 font-medium">
                    <span>Shipping</span>
                    <span>
                      {deliveryFee > 0
                        ? `₹${formatPrice(deliveryFee)}`
                        : "Free"}
                    </span>
                  </div>
                )}

                <div className="flex justify-between font-bold text-gray-900 pt-3 border-t border-dashed border-gray-200">
                  <span>Total amount</span>
                  <span>₹{formatPrice(totalPayable)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderSummaryModal;
