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
  <p className="text-center text-sm text-pink-400 mt-10 font-medium">
    Your cart is empty.
  </p>
);

const QuantitySelector = ({ item, onUpdateQuantity, isLoading }) => (
  <div className="flex items-center border border-pink-100 rounded-md overflow-hidden w-fit">
    <button
      onClick={() => onUpdateQuantity(item.cartKey, item.quantity - 1)}
      disabled={item.quantity <= 1 || isLoading}
      className="px-2.5 py-1 text-pink-600 hover:bg-pink-50 disabled:opacity-40"
      type="button"
      aria-label={`Decrease quantity of ${item.name}`}>
      <MinusIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
    </button>
    <span className="px-3 py-1 text-[14px] font-semibold text-gray-800 min-w-[2rem] text-center bg-white">
      {item.quantity}
    </span>
    <button
      onClick={() => onUpdateQuantity(item.cartKey, item.quantity + 1)}
      disabled={isLoading}
      className="px-2.5 py-1 text-pink-600 hover:bg-pink-50 disabled:opacity-40"
      type="button"
      aria-label={`Increase quantity of ${item.name}`}>
      <PlusIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
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
    <div className="flex gap-4 p-3 rounded-lg hover:bg-pink-50/30 transition-colors">
      {/* Product Image */}
      <div className="w-24 h-32 flex-shrink-0 bg-pink-50 rounded-md overflow-hidden border border-pink-100">
        <img
          src={item.image || "/placeholder-image.jpg"}
          alt={item.name}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      </div>

      {/* Product Details */}
      <div className="flex flex-col flex-1">
        <h3 className="text-[15px] text-gray-800 leading-snug font-medium">
          {item.name}
        </h3>

        <div className="flex items-center gap-2 mt-1.5">
          {discountPercentage > 0 && (
            <span className="text-[13px] text-gray-400 line-through">
              ₹{formatPrice(item.originalPrice)}
            </span>
          )}
          <span className="text-[15px] text-pink-600 font-semibold">
            ₹{formatPrice(item.price)}
          </span>
          {discountPercentage > 0 && (
            <span className="text-[13px] font-medium text-[#E01A6A]">
              ({discountPercentage}% Off)
            </span>
          )}
        </div>

        {/* Size & Color */}
        <div className="flex items-center gap-3 mt-2 text-[13px]">
          {item.variant?.size && (
            <div className="text-gray-600">
              <span className="font-normal text-gray-400">Size: </span>
              <span className="font-medium text-gray-700">
                {typeof item.variant.size === "string"
                  ? item.variant.size
                  : item.variant.size.label || item.variant.size.value}
              </span>
            </div>
          )}

          {item.variant?.color && (
            <div className="flex items-center gap-1.5">
              <span className="font-normal text-gray-400">Color: </span>
              <span
                className="w-3.5 h-3.5 rounded-full border border-gray-300 shadow-sm"
                style={{ backgroundColor: item.variant.color.hex }}
              />
            </div>
          )}
        </div>

        {/* Quantity & Remove */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <QuantitySelector
            item={item}
            onUpdateQuantity={onUpdateQuantity}
            isLoading={isLoading}
          />
          <button
            onClick={() => onRemove(item.cartKey)}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-[#E01A6A] transition-colors disabled:opacity-50"
            type="button"
            aria-label={`Remove ${item.name} from cart`}>
            <TrashIcon className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {pointsEarned > 0 && (
          <p className="text-[12px] text-[#E01A6A] bg-pink-50 px-2 py-0.5 rounded-md mt-2 w-fit font-medium">
            Earn <span className="font-bold">₹{pointsEarned} points</span> on
            this item
          </p>
        )}
      </div>
    </div>
  );
};

const DeliveryInfo = () => (
  <div className="mt-8 bg-[#FFF0F5] border border-[#FFE4E1] p-4 rounded-lg space-y-2 text-[12px] text-gray-700 leading-relaxed">
    <p className="font-bold text-[#E01A6A] uppercase tracking-wider text-[11px]">
      Delivery Information
    </p>
    <ul className="list-disc pl-4 space-y-1 text-gray-600">
      <li>
        <strong className="text-gray-800">FREE PAN India shipping</strong> on
        all orders above ₹1000.
      </li>
      <li>Nominal charge of ₹150 for orders below ₹1000.</li>
      <li>₹50 additional charge for Cash on Delivery (COD) orders.</li>
      <li>
        Orders dispatch within 3-4 working days (Delivery within 7-10 days).
      </li>
    </ul>
    <p className="text-[11px] text-pink-400 mt-2 italic">
      *Need priority shipping? Contact support@babli.in. Note: We partner with
      trusted 3rd party couriers; we are not liable for courier delays.
    </p>
  </div>
);

const PaymentBadges = () => (
  <div className="flex items-center gap-1.5 ml-2">
    <div className="bg-white rounded-full w-6 h-6 flex items-center justify-center text-[8px] font-extrabold text-[#E01A6A] shadow-sm">
      Pay
    </div>
    <div className="bg-white rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-extrabold text-pink-500 shadow-sm">
      Pe
    </div>
    <div className="bg-white rounded-full w-6 h-6 flex items-center justify-center text-[12px] font-extrabold text-gray-700 shadow-sm">
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
  <div className="bg-white px-5 py-4 border-t border-pink-100 shadow-[0_-4px_12px_rgba(224,26,106,0.05)]">
    <div className="space-y-2.5 mb-4 text-[13px]">
      <div className="flex justify-between text-gray-500 tracking-wider">
        <span className="font-medium">Total MRP</span>
        <span className="line-through">₹{formatPrice(totalMrp)}</span>
      </div>
      <div className="flex justify-between text-gray-900 tracking-wider pt-1 border-t border-dashed border-pink-100">
        <span className="font-bold text-gray-700">Subtotal</span>
        <span className="font-bold text-lg text-[#E01A6A]">
          ₹{formatPrice(totalAmount)}
        </span>
      </div>
    </div>

    <button
      onClick={onProceedToAddress}
      disabled={isLoading || !cartLength}
      className="w-full bg-[#E01A6A] hover:bg-[#c41258] disabled:bg-pink-200 disabled:cursor-not-allowed text-white py-3.5 px-5 flex items-center justify-between transition-colors duration-200 rounded-lg shadow-md shadow-pink-200"
      type="button">
      <div className="flex items-center gap-3 w-full justify-center">
        <span className="font-bold text-[14px] tracking-[0.15em] uppercase">
          {isLoading ? "Processing..." : "Place Order"}
        </span>
        {!isLoading && <PaymentBadges />}
      </div>
      <ChevronRightIcon
        className="w-5 h-5 text-white ml-auto"
        strokeWidth={3}
      />
    </button>
  </div>
);

// ---------- Main component ----------

const CartView = ({
  cart,
  pricing,
  isLoading,
  onUpdateQuantity,
  onRemove,
  onProceedToAddress,
  onClose,
}) => {
  // Only `totalAmount` is used for display — subtotal after any discounts.
  const { totalAmount = 0 } = pricing || {};
  const totalMrp = calculateTotalMrp(cart);

  return (
    <div className="flex flex-col h-full bg-white font-sans max-w-md w-full mx-auto shadow-2xl border-x border-pink-50">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-pink-50 bg-pink-50/20">
        <h2 className="text-xl font-bold text-gray-800 tracking-wide">
          My Cart{" "}
          <span className="text-sm font-normal text-pink-500">
            ({cart?.length || 0} items)
          </span>
        </h2>
        <button
          onClick={onClose}
          className="p-1.5 text-gray-500 hover:text-[#E01A6A] hover:bg-pink-50 rounded-full transition-all"
          aria-label="Close cart">
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {!cart?.length ? (
          <EmptyCartMessage />
        ) : (
          <div className="space-y-5 divide-y divide-pink-50">
            {cart.map((item, index) => (
              <div
                key={item.cartKey ?? item.id ?? index}
                className={index > 0 ? "pt-5" : ""}>
                <CartItemRow
                  item={item}
                  onUpdateQuantity={onUpdateQuantity}
                  onRemove={onRemove}
                  isLoading={isLoading}
                />
              </div>
            ))}
          </div>
        )}

        {cart?.length > 0 && <DeliveryInfo />}
      </div>

      {cart?.length > 0 && (
        <CartSummaryFooter
          totalMrp={totalMrp}
          totalAmount={totalAmount}
          isLoading={isLoading}
          cartLength={cart?.length}
          onProceedToAddress={onProceedToAddress}
        />
      )}
    </div>
  );
};

export default CartView;
