import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrashIcon,
  MinusIcon,
  PlusIcon,
  ShoppingBagIcon,
  ShieldCheckIcon,
  CheckIcon,
  TruckIcon,
  TagIcon,
  ArrowLeftIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { CheckIcon as CheckSolid } from "@heroicons/react/24/solid";
import { useCart } from "../../../context/TaruvedaCartContext";
import { useAuth } from "../../auth/context/UserContext";
import LoginPopup from "../../../components/pop-up/LoginPoup";

const BASE_URL = "/taruveda-organic-shampoo-oil";

/* ─────────────────────────────────────────────────────────
   DESIGN TOKENS — white + deep botanical green
───────────────────────────────────────────────────────── */
const G = {
  deep: "#1a3a2a", // dominant — headings, CTAs
  mid: "#2d6648", // hover state
  sage: "#4a8c6a", // accents, icons
  light: "#e8f3ec", // tinted backgrounds
  pale: "#f2f8f4", // subtle tint on cards
  white: "#ffffff",
  gray50: "#f9fafb",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray400: "#9ca3af",
  gray600: "#4b5563",
  gray800: "#1f2937",
  border: "#d1e8da", // green-tinted border
};

/* ─────────────────────────────────────────────────────────
   LEAF ICON
───────────────────────────────────────────────────────── */
const LeafIcon = ({ size = 16, color = G.sage, style = {} }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    style={style}
    aria-hidden>
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 1.25-8 1.25S16 7 17 8z" />
  </svg>
);

/* ─────────────────────────────────────────────────────────
   EMPTY CART
───────────────────────────────────────────────────────── */
const EmptyCart = ({ onBack }) => (
  <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=DM+Sans:wght@400;500;700&display=swap');`}</style>

    {/* Icon ring */}
    <div className="relative w-28 h-28 mb-8">
      <div
        className="absolute inset-0 rounded-full border-2 border-dashed"
        style={{ borderColor: G.border }}
      />
      <div
        className="absolute inset-3 rounded-full flex items-center justify-center"
        style={{ background: G.light }}>
        <ShoppingBagIcon
          className="w-10 h-10"
          style={{ color: G.sage }}
          strokeWidth={1.2}
        />
      </div>
      <div className="absolute -top-1 -right-1">
        <LeafIcon size={20} />
      </div>
    </div>

    <p
      className="text-[10px] font-bold uppercase tracking-[0.3em] mb-3"
      style={{ color: G.sage }}>
      Your bag is empty
    </p>
    <h2
      className="text-[36px] font-light leading-none mb-3"
      style={{
        fontFamily: "'Cormorant Garamond', serif",
        color: G.deep,
      }}>
      Nothing here yet
    </h2>
    <p
      className="text-[13px] leading-relaxed mb-10 max-w-xs"
      style={{ color: G.gray400 }}>
      Discover our pure organic essentials — crafted with nature's finest
      ingredients.
    </p>
    <button
      onClick={onBack}
      className="inline-flex items-center gap-2.5 px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-all duration-200 hover:opacity-90"
      style={{ background: G.deep }}>
      <ArrowLeftIcon className="w-4 h-4" />
      Explore Products
    </button>
  </div>
);

/* ─────────────────────────────────────────────────────────
   CHECKBOX
───────────────────────────────────────────────────────── */
const Checkbox = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={onChange}
    aria-checked={checked}
    role="checkbox"
    className="w-5 h-5 border-2 flex items-center justify-center shrink-0 transition-all duration-150 focus:outline-none"
    style={{
      background: checked ? G.deep : G.white,
      borderColor: checked ? G.deep : G.gray200,
    }}>
    {checked && <CheckSolid className="w-3 h-3 text-white" />}
  </button>
);

/* ─────────────────────────────────────────────────────────
   CART ITEM CARD
───────────────────────────────────────────────────────── */
const CartItemCard = ({
  item,
  isSelected,
  onSelect,
  onRemove,
  onQtyChange,
}) => {
  const savings =
    item.mrp && item.mrp > item.price
      ? (item.mrp - item.price) * item.quantity
      : 0;

  return (
    <div
      className="flex gap-4 sm:gap-5 px-5 py-5 sm:px-6 transition-colors duration-200"
      style={{ background: isSelected ? G.white : G.gray50 }}>
      {/* Checkbox */}
      <div className="mt-1 shrink-0">
        <Checkbox checked={isSelected} onChange={onSelect} />
      </div>

      {/* Product image */}
      <div
        className="w-[88px] h-[112px] sm:w-[100px] sm:h-[128px] shrink-0 overflow-hidden flex items-center justify-center"
        style={{ background: G.light, border: `1px solid ${G.border}` }}>
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-[85%] h-[85%] object-contain mix-blend-multiply"
            loading="lazy"
          />
        ) : (
          <SparklesIcon
            className="w-8 h-8"
            style={{ color: G.sage }}
            strokeWidth={1.2}
          />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
        {/* Top */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {item.category && (
              <p
                className="text-[9px] font-bold uppercase tracking-[0.22em] mb-1"
                style={{ color: G.sage }}>
                {item.category}
              </p>
            )}
            <h3
              className="text-[14px] font-medium leading-snug"
              style={{ color: G.deep, fontFamily: "'DM Sans', sans-serif" }}>
              {item.name}
            </h3>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-[15px] font-bold" style={{ color: G.deep }}>
                ₹{item.price}
              </span>
              {item.mrp && item.mrp > item.price && (
                <span
                  className="text-[12px] line-through"
                  style={{ color: G.gray400 }}>
                  ₹{item.mrp}
                </span>
              )}
            </div>
            {savings > 0 && (
              <span
                className="inline-flex items-center gap-1 mt-1.5 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5"
                style={{
                  background: G.light,
                  color: G.sage,
                  border: `1px solid ${G.border}`,
                }}>
                <TagIcon className="w-2.5 h-2.5" />
                Save ₹{savings}
              </span>
            )}
          </div>

          {/* Remove */}
          <button
            onClick={onRemove}
            aria-label="Remove item"
            className="p-1 shrink-0 transition-colors duration-150 hover:text-red-400"
            style={{ color: G.gray400 }}>
            <TrashIcon className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Bottom: qty + line total */}
        <div className="flex items-center justify-between mt-4">
          {/* Qty stepper */}
          <div
            className="flex items-center h-8"
            style={{ border: `1px solid ${G.border}` }}>
            <button
              onClick={() => onQtyChange(-1)}
              disabled={item.quantity <= 1}
              className="w-8 h-full flex items-center justify-center transition-colors duration-150 disabled:opacity-30"
              style={{ color: G.deep }}
              onMouseEnter={(e) => (e.currentTarget.style.background = G.light)}
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }>
              <MinusIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
            </button>
            <span
              className="w-9 text-center text-[13px] font-bold h-full flex items-center justify-center"
              style={{
                color: G.deep,
                borderLeft: `1px solid ${G.border}`,
                borderRight: `1px solid ${G.border}`,
              }}>
              {item.quantity}
            </span>
            <button
              onClick={() => onQtyChange(1)}
              className="w-8 h-full flex items-center justify-center transition-colors duration-150"
              style={{ color: G.deep }}
              onMouseEnter={(e) => (e.currentTarget.style.background = G.light)}
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }>
              <PlusIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
            </button>
          </div>

          <span
            className="text-[18px] font-light"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: G.deep,
            }}>
            ₹{item.price * item.quantity}
          </span>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   CART CONTROL HEADER
───────────────────────────────────────────────────────── */
const CartControlHeader = ({
  allSelected,
  onSelectAll,
  onClearCart,
  selectedCount,
  totalCount,
}) => (
  <div
    className="flex items-center justify-between px-5 sm:px-6 py-3.5"
    style={{ borderBottom: `1px solid ${G.border}`, background: G.pale }}>
    <button
      type="button"
      onClick={onSelectAll}
      className="flex items-center gap-2.5 focus:outline-none">
      <Checkbox checked={allSelected} onChange={onSelectAll} />
      <span
        className="text-[10px] font-bold uppercase tracking-[0.18em]"
        style={{ color: G.gray600 }}>
        {allSelected ? "Deselect all" : "Select all"}
      </span>
    </button>
    <div className="flex items-center gap-4">
      <span
        className="text-[10px] font-medium hidden sm:block"
        style={{ color: G.gray400 }}>
        {selectedCount} / {totalCount} selected
      </span>
      {totalCount > 0 && (
        <button
          onClick={onClearCart}
          className="text-[10px] font-bold uppercase tracking-widest transition-colors duration-150 hover:text-red-400"
          style={{ color: G.gray400 }}>
          Clear all
        </button>
      )}
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────
   ORDER SUMMARY
───────────────────────────────────────────────────────── */
const OrderSummary = ({ pricing, selectedItems, onCheckout }) => (
  <div
    className="overflow-hidden"
    style={{ border: `1px solid ${G.border}`, background: G.white }}>
    {/* Green header */}
    <div
      className="px-6 py-5 flex items-center gap-2.5"
      style={{ background: G.deep }}>
      <LeafIcon size={16} color="rgba(255,255,255,0.7)" />
      <h2
        className="text-[16px] font-light text-white"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          letterSpacing: "0.02em",
        }}>
        Order Summary
      </h2>
    </div>

    {/* Line items */}
    <div
      className="px-6 py-5 space-y-3.5 text-[13px]"
      style={{ borderBottom: `1px solid ${G.border}` }}>
      <div className="flex justify-between">
        <span style={{ color: G.gray600 }}>
          Subtotal ({selectedItems.length}{" "}
          {selectedItems.length === 1 ? "item" : "items"})
        </span>
        <span className="font-bold" style={{ color: G.deep }}>
          ₹{pricing.subtotal}
        </span>
      </div>

      {pricing.originalTotalPrice > pricing.subtotal && (
        <div className="flex justify-between">
          <span className="flex items-center gap-1.5" style={{ color: G.sage }}>
            <TagIcon className="w-3.5 h-3.5" /> Discount
          </span>
          <span className="font-bold" style={{ color: G.sage }}>
            −₹{pricing.originalTotalPrice - pricing.subtotal}
          </span>
        </div>
      )}

      <div className="flex justify-between">
        <span
          className="flex items-center gap-1.5"
          style={{ color: G.gray600 }}>
          <TruckIcon className="w-3.5 h-3.5" strokeWidth={1.5} /> Shipping
        </span>
        {pricing.platformFee === 0 && pricing.subtotal > 0 ? (
          <span className="font-bold" style={{ color: G.sage }}>
            Free
          </span>
        ) : (
          <span className="font-bold" style={{ color: G.deep }}>
            ₹{pricing.platformFee}
          </span>
        )}
      </div>

      {/* Free shipping unlocked */}
      {pricing.platformFee === 0 && pricing.subtotal > 0 && (
        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded-sm"
          style={{ background: G.light, border: `1px solid ${G.border}` }}>
          <CheckIcon
            className="w-3.5 h-3.5 shrink-0"
            style={{ color: G.sage }}
            strokeWidth={2.5}
          />
          <p
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: G.sage }}>
            Free shipping unlocked!
          </p>
        </div>
      )}

      {pricing.platformFee > 0 && pricing.subtotal > 0 && (
        <p className="text-[11px] leading-relaxed" style={{ color: G.gray400 }}>
          Add ₹{999 - pricing.subtotal} more to unlock free shipping.
        </p>
      )}
    </div>

    {/* Total */}
    <div
      className="px-6 py-4 flex items-center justify-between"
      style={{ borderBottom: `1px solid ${G.border}` }}>
      <span
        className="text-[11px] font-bold uppercase tracking-[0.16em]"
        style={{ color: G.gray400 }}>
        Total Payable
      </span>
      <span
        className="text-[32px] font-light leading-none"
        style={{ fontFamily: "'Cormorant Garamond', serif", color: G.deep }}>
        ₹{pricing.totalPayable}
      </span>
    </div>

    {/* CTA */}
    <div className="px-6 py-5 space-y-3">
      <button
        onClick={onCheckout}
        disabled={selectedItems.length === 0}
        className="w-full py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: selectedItems.length > 0 ? G.deep : G.gray400 }}
        onMouseEnter={(e) => {
          if (selectedItems.length > 0)
            e.currentTarget.style.background = G.mid;
        }}
        onMouseLeave={(e) => {
          if (selectedItems.length > 0)
            e.currentTarget.style.background = G.deep;
        }}>
        Proceed to Checkout
      </button>
      <p
        className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider"
        style={{ color: G.gray400 }}>
        <ShieldCheckIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
        100% Secure &amp; Encrypted
      </p>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────
   TRUST BADGES
───────────────────────────────────────────────────────── */
const TrustRow = () => (
  <div className="mt-4 grid grid-cols-3 gap-3">
    {[
      { icon: ShieldCheckIcon, label: "Secure Pay" },
      { icon: TruckIcon, label: "Free ₹999+" },
      { icon: SparklesIcon, label: "100% Organic" },
    ].map(({ icon: Icon, label }) => (
      <div
        key={label}
        className="flex flex-col items-center gap-2 py-3.5"
        style={{ background: G.pale, border: `1px solid ${G.border}` }}>
        <Icon className="w-4 h-4" style={{ color: G.sage }} strokeWidth={1.5} />
        <span
          className="text-[9px] font-bold uppercase tracking-widest text-center"
          style={{ color: G.gray600 }}>
          {label}
        </span>
      </div>
    ))}
  </div>
);

/* ─────────────────────────────────────────────────────────
   SECTION DIVIDER
───────────────────────────────────────────────────────── */
const Divider = () => (
  <div className="flex items-center gap-3 mx-6">
    <div className="flex-1 h-px" style={{ background: G.border }} />
    <LeafIcon size={12} color={G.border} />
    <div className="flex-1 h-px" style={{ background: G.border }} />
  </div>
);

/* ─────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────── */
export default function TaruVedaCartPage() {
  const navigate = useNavigate();
  const {
    cart,
    updateCartQty,
    removeFromCart,
    clearCart,
    getCartItems,
    totalItems,
  } = useCart();
  const { isLoggedIn } = useAuth();

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const cartItems = getCartItems();
  const hasAutoSelected = useRef(false);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (cartItems.length > 0 && !hasAutoSelected.current) {
      setSelected(cartItems.map((i) => i.id));
      hasAutoSelected.current = true;
    }
  }, [cartItems.length]);

  const allSelected =
    selected.length === cartItems.length && cartItems.length > 0;

  const handleSelectItem = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const handleSelectAll = () =>
    setSelected(allSelected ? [] : cartItems.map((i) => i.id));

  const selectedItems = useMemo(
    () => cartItems.filter((item) => selected.includes(item.id)),
    [cartItems, selected],
  );

  const pricing = useMemo(() => {
    let subtotal = 0,
      originalTotalPrice = 0;
    selectedItems.forEach((item) => {
      const qty = item.quantity || 1;
      subtotal += (item.price || 0) * qty;
      originalTotalPrice +=
        (item.mrp || item.originalPrice || item.price || 0) * qty;
    });
    const platformFee = subtotal > 0 && subtotal < 999 ? 50 : 0;
    return {
      subtotal,
      originalTotalPrice,
      platformFee,
      totalPayable: subtotal + platformFee,
    };
  }, [selectedItems]);

  const handleRemove = (item) => {
    removeFromCart(item.id);
    setSelected((prev) => prev.filter((id) => id !== item.id));
  };

  const handleClearCart = () => {
    clearCart();
    setSelected([]);
    hasAutoSelected.current = false;
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) return;
    if (!isLoggedIn) {
      setIsLoginOpen(true);
      return;
    }
    navigate(`${BASE_URL}/checkout`, {
      state: {
        items: selectedItems,
        pricing,
        totalAmount: pricing.totalPayable,
        totalItems: selectedItems.length,
      },
    });
  };

  if (!cartItems.length) return <EmptyCart onBack={() => navigate(BASE_URL)} />;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div
        className="min-h-screen pb-28 lg:pb-12"
        style={{ background: G.gray50 }}>
        {/* ── Top bar ── */}
        <div
          className="sticky top-0 z-20 border-b"
          style={{ background: G.white, borderColor: G.border }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <button
              onClick={() => navigate(BASE_URL)}
              className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest transition-colors duration-150"
              style={{ color: G.gray400 }}
              onMouseEnter={(e) => (e.currentTarget.style.color = G.deep)}
              onMouseLeave={(e) => (e.currentTarget.style.color = G.gray400)}>
              <ArrowLeftIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Continue Shopping</span>
            </button>

            <div className="flex items-center gap-2">
              <LeafIcon size={15} color={G.sage} />
              <span
                className="text-[13px] font-bold tracking-wide"
                style={{ color: G.deep }}>
                TaruVeda
              </span>
            </div>

            <div
              className="flex items-center gap-1.5 text-[11px] font-medium"
              style={{ color: G.gray400 }}>
              <ShoppingBagIcon className="w-4 h-4" strokeWidth={1.5} />
              <span>{totalItems}</span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 lg:pt-10">
          {/* ── Page title ── */}
          <div className="mb-8" style={{ animation: "fadeUp 0.4s ease both" }}>
            <p
              className="text-[10px] font-bold uppercase tracking-[0.3em] mb-1.5"
              style={{ color: G.sage }}>
              Your Bag
            </p>
            <h1
              className="text-[36px] sm:text-[44px] font-light leading-none"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                color: G.deep,
              }}>
              {totalItems} {totalItems === 1 ? "Item" : "Items"}
            </h1>
          </div>

          {/* ── Two-column layout ── */}
          <div className="flex flex-col lg:flex-row gap-6 xl:gap-8 items-start">
            {/* LEFT — Items list */}
            <div
              className="flex-1 min-w-0"
              style={{ animation: "fadeUp 0.45s ease 0.05s both" }}>
              <div
                className="overflow-hidden"
                style={{
                  background: G.white,
                  border: `1px solid ${G.border}`,
                }}>
                <CartControlHeader
                  allSelected={allSelected}
                  onSelectAll={handleSelectAll}
                  onClearCart={handleClearCart}
                  selectedCount={selected.length}
                  totalCount={cartItems.length}
                />

                {cartItems.map((item, i) => (
                  <React.Fragment key={item.id}>
                    <CartItemCard
                      item={item}
                      isSelected={selected.includes(item.id)}
                      onSelect={() => handleSelectItem(item.id)}
                      onRemove={() => handleRemove(item)}
                      onQtyChange={(delta) => updateCartQty(item.id, delta)}
                    />
                    {i < cartItems.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </div>

              {/* Organic promise strip */}
              <div
                className="mt-4 px-5 py-4 flex items-center gap-3"
                style={{
                  background: G.light,
                  border: `1px solid ${G.border}`,
                }}>
                <LeafIcon size={16} color={G.sage} />
                <p
                  className="text-[11px] leading-relaxed"
                  style={{ color: G.mid }}>
                  <strong>100% natural & cruelty-free.</strong> Every TaruVeda
                  product is free from sulfates, parabens, and artificial
                  fragrances.
                </p>
              </div>
            </div>

            {/* RIGHT — Summary sticky */}
            <div
              className="hidden lg:block w-[360px] xl:w-[400px] shrink-0"
              style={{ animation: "fadeUp 0.45s ease 0.1s both" }}>
              <div className="sticky top-20">
                <OrderSummary
                  pricing={pricing}
                  selectedItems={selectedItems}
                  onCheckout={handleCheckout}
                />
                <TrustRow />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile sticky checkout bar ── */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 px-4 py-3"
        style={{
          background: G.white,
          borderTop: `1px solid ${G.border}`,
          boxShadow: "0 -4px 24px rgba(26,58,42,0.08)",
          paddingBottom: "calc(12px + env(safe-area-inset-bottom))",
        }}>
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <div className="flex flex-col min-w-0">
            <span
              className="text-[9px] font-bold uppercase tracking-[0.2em]"
              style={{ color: G.gray400 }}>
              {selectedItems.length} item{selectedItems.length !== 1 ? "s" : ""}
            </span>
            <span
              className="text-[26px] font-light leading-tight"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                color: G.deep,
              }}>
              ₹{pricing.totalPayable}
            </span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={selectedItems.length === 0}
            className="flex-1 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: G.deep }}>
            Checkout →
          </button>
        </div>
      </div>

      <LoginPopup isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}
