import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ShieldCheck,
  Check,
  Leaf,
} from "lucide-react";
import { useCart } from "../../../context/TaruvedaCartContext";
import { useAuth } from "../../auth/context/UserContext";
import LoginPopup from "../../../components/pop-up/LoginPoup";

const BASE_URL = "/taruveda-organic-shampoo-oil";

/* ─── Skeleton ──────────────────────────────────────────────────── */
const CartSkeleton = () => (
  <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4 animate-pulse">
      <Leaf className="w-8 h-8 text-[#2C3E30]" />
      <span className="tracking-widest uppercase text-xs font-bold text-[#2C3E30]">
        Loading...
      </span>
    </div>
  </div>
);

/* ─── Empty Cart ────────────────────────────────────────────────── */
const EmptyCart = ({ onBack }) => (
  <div className="min-h-screen bg-[#FAF9F6] text-gray-800 flex flex-col items-center justify-center font-sans">
    <ShoppingBag className="w-16 h-16 text-gray-200 mb-6 stroke-[1]" />
    <h2
      className="text-3xl sm:text-4xl text-gray-900 font-light mb-4"
      style={{ fontFamily: "'Playfair Display', serif" }}>
      Your Bag is Empty
    </h2>
    <p className="text-gray-500 mb-8 text-sm">
      Looks like you haven't added anything yet.
    </p>
    <button
      onClick={onBack}
      className="bg-[#2C3E30] text-white px-10 py-4 text-sm font-semibold tracking-widest uppercase hover:bg-[#1a251d] transition-colors rounded-none">
      Start Shopping
    </button>
  </div>
);

/* ─── Checkbox ──────────────────────────────────────────────────── */
const Checkbox = ({ checked, onChange, className = "" }) => (
  <label
    className={`flex items-center cursor-pointer shrink-0 ${className}`}
    onClick={onChange}>
    <div
      className={`w-5 h-5 border flex items-center justify-center transition-colors rounded-none ${
        checked
          ? "bg-[#2C3E30] border-[#2C3E30]"
          : "border-gray-300 bg-white hover:border-[#2C3E30]"
      }`}>
      {checked && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
    </div>
  </label>
);

/* ─── Cart Item Card ────────────────────────────────────────────── */
const CartItemCard = ({
  item,
  isSelected,
  onSelect,
  onRemove,
  onQtyChange,
}) => (
  <div
    className={`p-5 transition-colors flex gap-5 md:gap-6 ${
      isSelected ? "bg-white" : "bg-gray-50/30"
    }`}>
    {/* Checkbox */}
    <Checkbox checked={isSelected} onChange={onSelect} className="mt-6 h-fit" />

    {/* Image */}
    <div className="w-24 h-32 md:w-32 md:h-40 shrink-0 bg-gray-50 border border-gray-100 flex items-center justify-center">
      <img
        src={item.image}
        alt={item.name}
        className="w-[85%] h-[85%] object-contain mix-blend-multiply"
      />
    </div>

    {/* Details */}
    <div className="flex-1 flex flex-col justify-between py-1">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="text-base md:text-lg font-medium text-gray-900 leading-snug">
            {item.name}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5 lowercase">
            {item.category || "general wellness"}
          </p>
          <p className="text-sm text-[#8CC63F] font-semibold mt-1">
            ₹{item.price}{" "}
            <span className="text-gray-400 text-xs font-normal">/ each</span>
          </p>
        </div>
        <button
          onClick={onRemove}
          className="text-gray-300 hover:text-red-500 transition-colors p-1 shrink-0"
          aria-label="Remove item">
          <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>

      <div className="flex items-end justify-between mt-4">
        {/* Qty Controls */}
        <div className="flex items-center border border-gray-200 h-9 w-fit rounded-none">
          <button
            onClick={() => onQtyChange(-1)}
            className="w-9 h-full flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600">
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-9 text-center text-sm font-semibold text-gray-900 border-x border-gray-200 h-full flex items-center justify-center">
            {item.quantity}
          </span>
          <button
            onClick={() => onQtyChange(1)}
            className="w-9 h-full flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="font-semibold text-gray-900 text-lg">
          ₹{item.price * item.quantity}
        </p>
      </div>
    </div>
  </div>
);

/* ─── Cart Control Header ───────────────────────────────────────── */
const CartControlHeader = ({
  allSelected,
  onSelectAll,
  onClearCart,
  selectedCount,
  totalCount,
}) => (
  <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
    <label
      className="flex items-center gap-3 cursor-pointer group"
      onClick={onSelectAll}>
      <div
        className={`w-5 h-5 border flex items-center justify-center transition-colors rounded-none ${
          allSelected
            ? "bg-[#2C3E30] border-[#2C3E30]"
            : "border-gray-300 bg-white group-hover:border-[#2C3E30]"
        }`}>
        {allSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
      </div>
      <span className="text-sm font-semibold text-gray-900 select-none tracking-wide uppercase">
        {allSelected ? "Deselect All" : "Select All"}
      </span>
    </label>

    <div className="flex items-center gap-4">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">
        {selectedCount} / {totalCount} Selected
      </span>
      {totalCount > 0 && (
        <button
          onClick={onClearCart}
          className="text-xs text-gray-400 hover:text-red-500 uppercase tracking-wider transition-colors font-medium">
          Clear
        </button>
      )}
    </div>
  </div>
);

/* ─── Order Summary ─────────────────────────────────────────────── */
const OrderSummary = ({ pricing, selectedItems, onCheckout }) => (
  <div className="bg-white p-8 border border-gray-200 rounded-none">
    <h2
      className="text-2xl text-gray-900 font-light mb-6 border-b border-gray-100 pb-4"
      style={{ fontFamily: "'Playfair Display', serif" }}>
      Order Summary
    </h2>

    <div className="space-y-4 mb-8 text-sm text-gray-500">
      <div className="flex justify-between items-center">
        <span>Subtotal ({selectedItems.length} items)</span>
        <span className="text-gray-900 font-medium">₹{pricing.subtotal}</span>
      </div>
      {pricing.originalTotalPrice > pricing.subtotal && (
        <div className="flex justify-between items-center text-[#8CC63F]">
          <span>You Save</span>
          <span className="font-medium">
            ₹{pricing.originalTotalPrice - pricing.subtotal}
          </span>
        </div>
      )}
      <div className="flex justify-between items-center">
        <span>Shipping Fee</span>
        <span className="text-gray-900 font-medium">
          {pricing.platformFee === 0 ? (
            <span className="text-[#8CC63F]">Free</span>
          ) : (
            `₹${pricing.platformFee}`
          )}
        </span>
      </div>
      {pricing.platformFee === 0 && pricing.subtotal > 0 && (
        <p className="text-[10px] text-[#8CC63F] uppercase tracking-wider">
          🎉 You unlocked free shipping!
        </p>
      )}
    </div>

    <div className="flex justify-between items-end border-t border-gray-100 pt-6 mb-8">
      <span className="font-medium text-gray-900 text-sm uppercase tracking-wider">
        Total Payable
      </span>
      <span
        className="text-3xl text-gray-900 font-light"
        style={{ fontFamily: "'Playfair Display', serif" }}>
        ₹{pricing.totalPayable}
      </span>
    </div>

    <button
      onClick={onCheckout}
      disabled={selectedItems.length === 0}
      className="w-full bg-[#2C3E30] text-white py-4 text-sm font-semibold tracking-widest uppercase hover:bg-[#1a251d] transition-colors rounded-none disabled:opacity-40 disabled:cursor-not-allowed">
      Proceed to Checkout
    </button>
    <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5 mt-5 uppercase tracking-wider">
      <ShieldCheck className="w-4 h-4 stroke-[1.5]" /> Secure Checkout
    </p>
  </div>
);

/* ─── Main Page ─────────────────────────────────────────────────── */
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

  /* ── Auto-select (runs once when items first appear) ── */
  const hasAutoSelected = useRef(false);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (cartItems.length > 0 && !hasAutoSelected.current) {
      setSelected(cartItems.map((item) => item.id));
      hasAutoSelected.current = true;
    }
  }, [cartItems.length]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Selection Handlers ── */
  const allSelected =
    selected.length === cartItems.length && cartItems.length > 0;

  const handleSelectItem = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const handleSelectAll = () =>
    setSelected(allSelected ? [] : cartItems.map((item) => item.id));

  const selectedItems = useMemo(
    () => cartItems.filter((item) => selected.includes(item.id)),
    [cartItems, selected],
  );

  /* ── Pricing ── */
  const pricing = useMemo(() => {
    let subtotal = 0;
    let originalTotalPrice = 0;

    selectedItems.forEach((item) => {
      const qty = item.quantity || 1;
      const price = item.price || 0;
      const mrp = item.mrp || item.originalPrice || price;

      subtotal += price * qty;
      originalTotalPrice += mrp * qty;
    });

    const platformFee = subtotal > 0 && subtotal < 999 ? 50 : 0;
    const totalPayable = subtotal + platformFee;

    return { subtotal, originalTotalPrice, platformFee, totalPayable };
  }, [selectedItems]);

  /* ── Handlers ── */
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
    if (selectedItems.length === 0) {
      alert("Please select at least one item to checkout.");
      return;
    }

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

  /* ── Guards ── */
  if (!cartItems.length) return <EmptyCart onBack={() => navigate(BASE_URL)} />;

  /* ── UI ── */
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-gray-800 font-sans mt-5 pb-32 lg:pb-16 pt-6">
      {/* Breadcrumbs */}
      <div className="hidden md:flex text-gray-500 text-sm gap-2 mb-8 px-4 md:px-8 max-w-7xl mx-auto">
        <button
          onClick={() => navigate(BASE_URL)}
          className="hover:text-gray-900 transition-colors">
          TaruVeda
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900">Your Bag</span>
      </div>

      {/* Header */}
      <header className="hidden md:flex flex-col items-center text-center mb-12 px-4">
        <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] font-semibold mb-3 text-green-700">
          Organic Edit
        </span>
        <h1
          className="text-3xl sm:text-4xl md:text-5xl text-gray-900 font-light mb-3"
          style={{ fontFamily: "'Playfair Display', serif" }}>
          Your Bag
        </h1>
        <p className="text-sm text-gray-400 tracking-wide">
          {totalItems} {totalItems > 1 ? "items" : "item"} saved
        </p>
      </header>

      <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row gap-10">
        {/* ─── LEFT: ITEMS ───────────────────────────────── */}
        <div className="flex-1">
          <div className="bg-white border border-gray-200 shadow-sm rounded-none">
            <CartControlHeader
              allSelected={allSelected}
              onSelectAll={handleSelectAll}
              onClearCart={handleClearCart}
              selectedCount={selected.length}
              totalCount={cartItems.length}
            />

            <div className="divide-y divide-gray-100">
              {cartItems.map((item) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  isSelected={selected.includes(item.id)}
                  onSelect={() => handleSelectItem(item.id)}
                  onRemove={() => handleRemove(item)}
                  onQtyChange={(delta) => updateCartQty(item.id, delta)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ─── RIGHT: SUMMARY (Desktop) ──────────────────── */}
        <div className="hidden lg:block w-[400px] shrink-0">
          <div className="sticky top-24">
            <OrderSummary
              pricing={pricing}
              selectedItems={selectedItems}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      </div>

      {/* ─── MOBILE BOTTOM BAR ─────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-30">
        <div className="max-w-2xl mx-auto flex justify-between items-center gap-4">
          <div className="flex flex-col">
            <span className="text-gray-400 text-[10px] uppercase tracking-widest">
              Total
            </span>
            <span
              className="text-2xl text-gray-900 font-light"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              ₹{pricing.totalPayable}
            </span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={selectedItems.length === 0}
            className="flex-1 max-w-[200px] bg-[#2C3E30] text-white py-3.5 text-sm font-semibold tracking-widest uppercase hover:bg-[#1a251d] transition-colors rounded-none disabled:opacity-40 disabled:cursor-not-allowed">
            Checkout
          </button>
        </div>
      </div>

      {/* Login Popup */}
      <LoginPopup isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}
