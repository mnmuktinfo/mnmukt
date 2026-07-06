import React from "react";
import {
  MinusIcon,
  PlusIcon,
  TrashIcon,
  TruckIcon,
  ShoppingBagIcon,
  BanknotesIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import { ArrowPathIcon } from "@heroicons/react/20/solid";

// 🏗️ Import defaults from our strict schema
import { PRICING_DEFAULTS } from "../../features/orders/services/schema";

// Helper Functions (Replaces the old checkout.js imports)
const formatPrice = (price) => Number(price || 0).toLocaleString("en-IN");
const getDiscount = (original, current) => {
  const orig = Number(original) || 0;
  const curr = Number(current) || 0;
  if (orig <= curr || orig === 0) return 0;
  return Math.round(((orig - curr) / orig) * 100);
};

const CartView = ({
  cart,
  pricing,
  isLoading,
  onUpdateQuantity,
  onRemove,
  onProceedToAddress,
}) => {
  // Syncing with the exact output from our OrderPricingService
  const {
    itemsTotal = 0,
    shippingFee = 0,
    discount: cartDiscount = 0,
    tax = 0,
    totalAmount = 0,
  } = pricing || {};

  return (
    <div className="flex flex-col h-full bg-white font-sans">
      {/* --- SCROLLABLE CART CONTENT --- */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
        {!cart?.length ? (
          <p className="text-center text-[13px] text-gray-500 mt-10">
            Your cart is empty.
          </p>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => {
              const discountPercentage = getDiscount(
                item.originalPrice || item.price,
                item.price,
              );

              return (
                <div
                  key={item.cartKey}
                  className="flex gap-3 sm:gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  {/* Product Image (Sharp corners) */}
                  <div className="w-20 h-28 sm:w-24 sm:h-32 flex-shrink-0 bg-gray-50 overflow-hidden border border-gray-100">
                    <img
                      src={item.image || "/placeholder-image.jpg"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/placeholder-image.jpg";
                      }}
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex flex-col flex-1 pt-0.5">
                    <h3 className="text-[13px] sm:text-[14px] text-gray-900 leading-snug font-semibold line-clamp-2">
                      {item.name}
                    </h3>

                    <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
                      <span className="text-[14px] sm:text-[15px] text-gray-900 font-bold">
                        ₹{formatPrice(item.price)}
                      </span>
                      {discountPercentage > 0 && (
                        <>
                          <span className="text-[12px] sm:text-[13px] text-gray-400 line-through">
                            ₹{formatPrice(item.originalPrice)}
                          </span>
                          <span className="text-[11px] sm:text-[12px] text-red-500 font-bold bg-red-50 px-1 py-0.5">
                            {discountPercentage}% OFF
                          </span>
                        </>
                      )}
                    </div>

                    {/* Size Display */}
                    {/* 👇 FIXED: variant.size is now {label, value} per
                        VariantSchema/CartContext, not a plain string.
                        Check .value for the "onesize" sentinel and render
                        .label (falling back to .value) instead of the
                        raw object. */}
                    {item.variant?.size?.value &&
                      item.variant.size.value !== "onesize" && (
                        <p className="text-[11px] sm:text-[12px] text-gray-500 mt-1.5 uppercase tracking-wide">
                          Size:{" "}
                          <span className="font-bold text-gray-900">
                            {item.variant.size.label || item.variant.size.value}
                          </span>
                        </p>
                      )}

                    {/* Color Display */}
                    {/* 👇 variant.color is now {name, hex} per VariantSchema —
                        render .name, and show a small swatch if .hex exists. */}
                    {item.variant?.color?.name && (
                      <p className="text-[11px] sm:text-[12px] text-gray-500 mt-1 uppercase tracking-wide flex items-center gap-1.5">
                        Color:{" "}
                        <span className="font-bold text-gray-900 normal-case">
                          {item.variant.color.name}
                        </span>
                        {item.variant.color.hex && (
                          <span
                            className="inline-block w-3 h-3 rounded-full border border-gray-300"
                            style={{ backgroundColor: item.variant.color.hex }}
                          />
                        )}
                      </p>
                    )}

                    {/* Quantity & Actions */}
                    <div className="flex items-center justify-between mt-auto pt-2">
                      {/* Sharp Quantity Box */}
                      <div className="flex items-center border border-gray-200 bg-gray-50">
                        <button
                          onClick={() =>
                            onUpdateQuantity(item.cartKey, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1 || isLoading}
                          className="p-1.5 sm:px-2 sm:py-1.5 text-gray-600 hover:text-black hover:bg-gray-200 disabled:opacity-40 transition-colors"
                          type="button">
                          <MinusIcon
                            className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                            strokeWidth={2.5}
                          />
                        </button>

                        <span className="px-2 py-1 text-[12px] sm:text-[13px] font-bold text-gray-900 min-w-[2rem] text-center bg-white border-x border-gray-200">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            onUpdateQuantity(item.cartKey, item.quantity + 1)
                          }
                          disabled={isLoading}
                          className="p-1.5 sm:px-2 sm:py-1.5 text-gray-600 hover:text-black hover:bg-gray-200 disabled:opacity-40 transition-colors"
                          type="button">
                          <PlusIcon
                            className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                            strokeWidth={2.5}
                          />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemove(item.cartKey)}
                        disabled={isLoading}
                        className="p-1.5 sm:p-2 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 transition-colors disabled:opacity-50"
                        type="button">
                        <TrashIcon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* --- TRUST BADGES (Compact & Sharp) --- */}
        {cart?.length > 0 && (
          <div className="flex items-start justify-between py-4 sm:py-5 mt-2 bg-gray-50/30">
            <div className="flex flex-col items-center flex-1 border-r border-[#e91e63] px-1 text-center">
              <TruckIcon
                className="w-6 h-6 sm:w-7 sm:h-7 text-[#e91e63] mb-1.5"
                strokeWidth={1.2}
              />
              <span className="text-[10px] sm:text-[11px] font-bold text-gray-800 leading-tight">
                Free Delivery Above
                <br />₹{PRICING_DEFAULTS.FREE_SHIPPING_THRESHOLD}
              </span>
            </div>

            <div className="flex flex-col items-center flex-1 border-r border-[#e91e63] px-1 text-center">
              <div className="relative mb-1.5">
                <ShoppingBagIcon
                  className="w-6 h-6 sm:w-7 sm:h-7 text-[#e91e63]"
                  strokeWidth={1.2}
                />
                <ArrowPathIcon
                  className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#e91e63] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  strokeWidth={2.5}
                />
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-gray-800 leading-tight">
                Hassle-Free 7-Day
                <br />
                Returns
              </span>
            </div>

            <div className="flex flex-col items-center flex-1 px-1 text-center">
              <BanknotesIcon
                className="w-6 h-6 sm:w-7 sm:h-7 text-[#e91e63] mb-1.5"
                strokeWidth={1.2}
              />
              <span className="text-[10px] sm:text-[11px] font-bold text-gray-800 leading-tight mt-0.5">
                COD Available
              </span>
            </div>
          </div>
        )}
      </div>

      {/* --- BOTTOM SUMMARY & CTA --- */}
      {cart?.length > 0 && (
        <div className="bg-white border-t border-gray-100 shadow-[0_-8px_15px_rgba(0,0,0,0.04)] z-10 px-3 sm:px-4 pb-3 sm:pb-4">
          {/* Green Free Shipping Banner - Synced with Schema */}
          {itemsTotal >= PRICING_DEFAULTS.FREE_SHIPPING_THRESHOLD && (
            <div className="bg-[#0BA84A] text-white flex items-center justify-center py-2 -mx-3 sm:-mx-4 px-3 sm:px-4 shadow-sm mb-3 sm:mb-4">
              <CheckBadgeIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
              <span className="text-[12px] sm:text-[13px]">
                You are Eligible for{" "}
                <span className="font-bold">Free Shipping</span>!
              </span>
            </div>
          )}

          <div className="space-y-1.5 sm:space-y-2 text-[12px] sm:text-[13px]">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-medium">₹{formatPrice(itemsTotal)}</span>
            </div>

            {cartDiscount > 0 && (
              <div className="flex justify-between text-[#0BA84A]">
                <span>Discount</span>
                <span className="font-medium">
                  -₹{formatPrice(cartDiscount)}
                </span>
              </div>
            )}

            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span className="font-medium">
                {shippingFee > 0 ? `₹${formatPrice(shippingFee)}` : "FREE"}
              </span>
            </div>

            {tax > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span className="font-medium">₹{formatPrice(tax)}</span>
              </div>
            )}

            <div className="flex justify-between font-bold text-gray-900 pt-2.5 sm:pt-3 mt-2 sm:mt-3 border-t border-dashed border-gray-200">
              <span className="text-[13px] sm:text-[14px]">Total Payable</span>
              <span className="text-[15px] sm:text-[16px]">
                ₹{formatPrice(totalAmount)}
              </span>
            </div>
          </div>

          <button
            onClick={onProceedToAddress}
            disabled={isLoading || !cart?.length}
            className="w-full mt-4 sm:mt-5 bg-black hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 sm:py-3.5 px-4 flex items-center justify-center gap-2 sm:gap-3 transition-all duration-300 active:scale-[0.98]"
            type="button">
            <img
              src="https://fastrr-boost-ui.pickrr.com/assets/images/boost_button/upi_options.svg"
              alt="UPI Options"
              className="h-[16px] sm:h-[18px] object-contain opacity-95"
            />
            <span className="font-bold text-[12px] sm:text-[13px] tracking-widest uppercase mt-0.5">
              {isLoading ? "Processing..." : "BUY NOW"}
            </span>
          </button>

          <div className="flex items-center justify-center gap-1 mt-3 sm:mt-4 opacity-80">
            <span className="text-[10px] sm:text-[11px] text-gray-500 font-medium tracking-wide">
              Secured by
            </span>
            <img
              src="https://accounts.razorpay.com/assets/razorpay/logo-light.svg"
              alt="Razorpay"
              className="h-3 sm:h-3.5 object-contain grayscale opacity-70"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CartView;
