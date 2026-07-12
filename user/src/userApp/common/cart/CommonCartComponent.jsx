import React from "react";
import {
  MinusIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

// ---------- Helpers ----------

// Formats a number as an Indian-locale price string (caller prefixes the ₹ symbol)
const formatPrice = (price) => Number(price || 0).toLocaleString("en-IN");

// % discount between an original price and the current price. 0 if no discount.
const getDiscount = (original, current) => {
  const orig = Number(original) || 0;
  const curr = Number(current) || 0;
  if (orig <= curr || orig === 0) return 0;
  return Math.round(((orig - curr) / orig) * 100);
};

// Sum of (original price * quantity) across the cart — used for the
// strikethrough "Total MRP" row.
const calculateTotalMrp = (cart = []) =>
  cart.reduce((acc, item) => {
    const unitPrice = Number(item.originalPrice || item.price);
    return acc + unitPrice * item.quantity;
  }, 0);

// ⚠️ PLACEHOLDER ONLY — not a real rewards calculation (~2% of price).
// Replace with the actual points/rewards logic before this ships:
// showing a made-up "points earned" figure to customers is misleading.
const getPointsEarned = (price) => Math.floor(Number(price || 0) * 0.02);

// Falls back to a placeholder image on load failure. Guards against an
// infinite error loop if the placeholder itself fails to load.
const handleImageError = (e) => {
  if (!e.target.dataset.fallback) {
    e.target.dataset.fallback = "true";
    e.target.src = "/placeholder-image.jpg";
  }
};

// ---------- Small presentational pieces ----------

const EmptyCartMessage = () => (
  <p className="text-center text-sm text-gray-500 mt-10">Your cart is empty.</p>
);

const QuantitySelector = ({ item, onUpdateQuantity, isLoading }) => (
  <div className="flex items-center border border-gray-200 w-fit">
    <button
      onClick={() => onUpdateQuantity(item.cartKey, item.quantity - 1)}
      disabled={item.quantity <= 1 || isLoading}
      className="px-2.5 py-1 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
      type="button"
      aria-label={`Decrease quantity of ${item.name}`}>
      <MinusIcon className="w-3.5 h-3.5" strokeWidth={2} />
    </button>
    <span className="px-3 py-1 text-[14px] text-gray-900 min-w-[2rem] text-center">
      {item.quantity}
    </span>
    <button
      onClick={() => onUpdateQuantity(item.cartKey, item.quantity + 1)}
      disabled={isLoading}
      className="px-2.5 py-1 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
      type="button"
      aria-label={`Increase quantity of ${item.name}`}>
      <PlusIcon className="w-3.5 h-3.5" strokeWidth={2} />
    </button>
  </div>
);

// One product row: image, name, price/discount, size/color, quantity + remove, points.
const CartItemRow = ({ item, onUpdateQuantity, onRemove, isLoading }) => {
  const discountPercentage = getDiscount(
    item.originalPrice || item.price,
    item.price,
  );
  const pointsEarned = getPointsEarned(item.price);

  return (
    <div className="flex gap-4">
      {/* Product Image */}
      <div className="w-24 h-32 flex-shrink-0 bg-gray-50">
        <img
          src={item.image || "/placeholder-image.jpg"}
          alt={item.name}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      </div>

      {/* Product Details */}
      <div className="flex flex-col flex-1">
        <h3 className="text-[15px] text-gray-800 leading-snug font-light">
          {item.name}
        </h3>

        <div className="flex items-center gap-2 mt-2">
          {discountPercentage > 0 && (
            <span className="text-[14px] text-gray-400 line-through">
              ₹{formatPrice(item.originalPrice)}
            </span>
          )}
          <span className="text-[15px] text-gray-900">
            ₹{formatPrice(item.price)}
          </span>
          {discountPercentage > 0 && (
            <span className="text-[14px] text-red-500">
              {discountPercentage}% off
            </span>
          )}
        </div>

        {/* Size & Color */}
        <div className="flex items-center gap-3 mt-2 text-[14px]">
          {item.variant?.size && (
            <div className="text-gray-800">
              <span className="font-medium">Size: </span>
              <span>
                {typeof item.variant.size === "string"
                  ? item.variant.size
                  : item.variant.size.label || item.variant.size.value}
              </span>
            </div>
          )}

          {item.variant?.color && (
            <div className="flex items-center gap-1">
              <span className="font-medium">Color: </span>
              <span
                className="w-3 h-3 rounded-full border border-gray-300"
                style={{ backgroundColor: item.variant.color.hex }}
              />
            </div>
          )}
        </div>

        {/* Quantity & Remove */}
        <div className="flex items-center justify-between mt-4">
          <QuantitySelector
            item={item}
            onUpdateQuantity={onUpdateQuantity}
            isLoading={isLoading}
          />
          <button
            onClick={() => onRemove(item.cartKey)}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-red-500 transition-colors disabled:opacity-50"
            type="button"
            aria-label={`Remove ${item.name} from cart`}>
            <TrashIcon className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {pointsEarned > 0 && (
          <p className="text-[12px] text-[#781765] mt-3">
            Earn <span className="font-bold">₹{pointsEarned} points</span> on
            this product
          </p>
        )}
      </div>
    </div>
  );
};

const DeliveryInfo = () => (
  <div className="mt-8 bg-[#fdfbfd] border border-[#f0e6ef] p-4 rounded-sm space-y-2 text-[12px] text-gray-700 leading-relaxed">
    <p className="font-semibold text-[#781765]">Delivery Information</p>
    <ul className="list-disc pl-4 space-y-1 text-gray-600">
      <li>
        <strong>FREE PAN India shipping</strong> on all orders above ₹1000.
      </li>
      <li>Nominal charge of ₹150 for orders below ₹1000.</li>
      <li>₹50 additional charge for Cash on Delivery (COD) orders.</li>
      <li>
        Orders dispatch within 3-4 working days (Delivery within 7-10 days).
      </li>
    </ul>
    <p className="text-[11px] text-gray-500 mt-2 italic">
      *Need priority shipping? Contact support@babli.in. Note: We partner with
      trusted 3rd party couriers; we are not liable for courier delays.
    </p>
  </div>
);

const PaymentBadges = () => (
  <div className="flex items-center gap-1.5 ml-2">
    <div className="bg-white rounded-full w-6 h-6 flex items-center justify-center text-[8px] font-bold text-blue-900">
      Pay
    </div>
    <div className="bg-white rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-bold text-purple-700">
      Pe
    </div>
    <div className="bg-white rounded-full w-6 h-6 flex items-center justify-center text-[12px] font-bold text-gray-800">
      G
    </div>
  </div>
);

const CartSummaryFooter = ({
  totalMrp,
  totalAmount,
  isLoading,
  cartLength,
  onProceedToAddress,
}) => (
  <div className="bg-white px-5 py-4 border-t border-gray-100">
    <div className="space-y-3 mb-4 text-[13px]">
      <div className="flex justify-between text-gray-700 tracking-widest">
        <span className="uppercase font-medium">Total MRP</span>
        <span className="line-through text-gray-500">
          ₹{formatPrice(totalMrp)}
        </span>
      </div>
      <div className="flex justify-between text-gray-900 tracking-widest">
        <span className="uppercase font-medium">Subtotal</span>
        <span className="font-medium">₹{formatPrice(totalAmount)}</span>
      </div>
    </div>

    <button
      onClick={onProceedToAddress}
      disabled={isLoading || !cartLength}
      className="w-full bg-[#781765] hover:bg-[#5e104e] disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3.5 px-4 flex items-center justify-between transition-colors duration-200"
      type="button">
      <div className="flex items-center gap-3 w-full justify-center">
        <span className="font-semibold text-[13px] tracking-[0.2em] uppercase">
          {isLoading ? "Processing..." : "Place Order"}
        </span>
        {!isLoading && <PaymentBadges />}
      </div>
      <ChevronRightIcon className="w-5 h-5 text-white" strokeWidth={2.5} />
    </button>
  </div>
);
