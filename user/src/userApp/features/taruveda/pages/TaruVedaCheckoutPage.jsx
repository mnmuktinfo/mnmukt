import React, { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  MapPin,
  AlertCircle,
  ShieldCheck,
  Check,
  Loader2,
} from "lucide-react";

import { useAuth } from "../../auth/context/UserContext";
import { useCart } from "../../../context/TaruvedaCartContext";
import { createOrder, makeOrderId } from "../../orders/services/orderService";

import AddressCard from "../../../components/cards/AddressCard";
import AddressFormPopup from "../../../components/form/AddressFormPopup";
import PaymentSelector from "../../../components/cards/PaymentComponent";
import ConfirmOrderModal from "../../../components/cards/ConfirmOrderModal";

const BASE_URL = "/taruveda-organic-shampoo-oil";
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER ?? "";

const EMPTY_FORM = {
  id: null,
  name: "",
  phone: "",
  addressLine1: "",
  city: "",
  state: "",
  pincode: "",
  tag: "HOME",
};

/* ─── Error Banner ──────────────────────────────────────── */
const ErrorBanner = ({ message, onDismiss }) => {
  if (!message) return null;
  return (
    <div className="flex items-center gap-4 bg-red-50/80 border-l-4 border-red-500 p-4 mb-8 rounded-r-md shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
      <AlertCircle size={20} className="text-red-500 shrink-0" />
      <p className="text-sm text-red-700 flex-1 font-medium">{message}</p>
      <button
        onClick={onDismiss}
        className="text-red-500 text-xs font-bold uppercase tracking-widest hover:text-red-800 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded px-2 py-1">
        Dismiss
      </button>
    </div>
  );
};

/* ─── Checkout Page ──────────────────────────────────────── */
export default function TaruVedaCheckoutPage() {
  const { user, address, saveAddress } = useAuth();
  const { clearCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { items, pricing } = location.state || {};

  // ── Seed saved addresses from context ──
  const [addresses, setAddresses] = useState(() =>
    address
      ? [{ ...address, addressLine1: address.line1 || address.addressLine1 }]
      : [],
  );

  const orderIdRef = useRef(null);
  if (!orderIdRef.current && user?.name) {
    orderIdRef.current = makeOrderId(user.name);
  }

  // ── UI state ──
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [popupOpen, setPopupOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [error, setError] = useState("");
  const placingRef = useRef(false);

  if (!items || !items.length) return <Navigate to={BASE_URL} replace />;

  /* ── Open popup for new address ── */
  const handleAddNew = () => {
    setForm(EMPTY_FORM);
    setPopupOpen(true);
  };

  /* ── Open popup for editing ── */
  const handleEdit = (e, addr) => {
    e.preventDefault();
    setForm({
      ...addr,
      addressLine1: addr.line1 || addr.addressLine1,
      id: addr.id,
    });
    setPopupOpen(true);
  };

  /* ── Save address from popup ── */
  const handleSaveAddress = async () => {
    try {
      const saved = await saveAddress({
        ...form,
        line1: form.addressLine1,
      });

      const normalized = {
        ...saved,
        addressLine1: saved.line1 || saved.addressLine1,
      };

      if (form.id) {
        setAddresses((prev) =>
          prev.map((a) => (a.id === form.id ? normalized : a)),
        );
      } else {
        setAddresses((prev) => {
          const updated = [...prev, normalized];
          setSelectedAddressIndex(updated.length - 1);
          return updated;
        });
      }

      setForm(EMPTY_FORM);
      setPopupOpen(false);
    } catch (err) {
      console.error("Failed to save address:", err);
      setError("Failed to save address. Please try again.");
    }
  };

  /* ── Place order ── */
  const placeOrder = async () => {
    if (placingRef.current) return;
    if (!addresses.length) {
      setError("Please add a delivery address.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!orderIdRef.current) {
      setError("Order ID not ready. Please refresh the page.");
      return;
    }

    placingRef.current = true;
    setPlacing(true);

    try {
      const selectedAddress = addresses[selectedAddressIndex];
      const orderPricing = {
        ...pricing,
        deliveryFee: pricing.platformFee || 0,
      };

      await createOrder({
        orderId: orderIdRef.current,
        user,
        selectedAddress,
        paymentMethod,
        items,
        pricing: orderPricing,
      });

      await clearCart();
      await queryClient.invalidateQueries(["orders"]);

      if (paymentMethod === "whatsapp" && WHATSAPP_NUMBER) {
        const msg = `Hello ${user.name}, your order ${orderIdRef.current} has been placed. Please complete payment.`;
        window.open(
          `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`,
          "_blank",
        );
      }

      navigate(`/order-success/${orderIdRef.current}`, { replace: true });
    } catch (err) {
      console.error("Order placement error:", err);
      setError("Checkout failed. Please try again.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      placingRef.current = false;
      setPlacing(false);
    }
  };

  const isBtnDisabled = placing || !addresses.length || !orderIdRef.current;
  const confirmDescription =
    paymentMethod === "whatsapp"
      ? "Confirm order and proceed to pay via WhatsApp?"
      : "Confirm your order with Cash on Delivery?";

  return (
    <div className="min-h-screen bg-[#faf9f8] text-gray-800 font-sans pb-32 pt-8 selection:bg-[#2C3E30] selection:text-white antialiased">
      {/* Breadcrumbs */}
      <div className="hidden md:flex items-center text-gray-500 text-sm gap-2 mb-10 px-4 md:px-8 max-w-7xl mx-auto uppercase tracking-wider text-[11px] font-medium">
        <button
          onClick={() => navigate(BASE_URL)}
          className="hover:text-[#2C3E30] transition-colors focus:outline-none">
          TaruVeda
        </button>
        <span className="text-gray-300">/</span>
        <button
          onClick={() => navigate(`${BASE_URL}/cart`)}
          className="hover:text-[#2C3E30] transition-colors focus:outline-none">
          Your Bag
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-[#2C3E30] font-bold">Checkout</span>
      </div>

      <header className="flex flex-col items-center text-center mb-12 px-4">
        <h1
          className="text-4xl sm:text-5xl md:text-6xl text-gray-900 mb-4 tracking-tight"
          style={{ fontFamily: "'Playfair Display', serif" }}>
          Checkout
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 tracking-[0.2em] uppercase font-medium">
          Complete your organic purchase
        </p>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* ─── LEFT COLUMN ─────────────────────────── */}
        <div className="flex-1 space-y-8">
          <ErrorBanner message={error} onDismiss={() => setError("")} />

          {/* Section: Delivery Address */}
          <section className="bg-white p-6 sm:p-8 border border-gray-100 shadow-sm rounded-xl">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
              <h2
                className="text-2xl text-gray-900"
                style={{ fontFamily: "'Playfair Display', serif" }}>
                1. Delivery Address
              </h2>
              <button
                onClick={handleAddNew}
                className="flex items-center gap-1.5 text-[#2C3E30] text-xs font-bold uppercase tracking-widest hover:text-[#1a251d] transition-colors group focus:outline-none">
                <Plus
                  size={16}
                  strokeWidth={2.5}
                  className="group-hover:scale-110 transition-transform"
                />
                <span className="hidden sm:inline">Add New</span>
              </button>
            </div>

            {/* Saved address cards */}
            {addresses.length > 0 ? (
              <div className="space-y-4">
                {addresses.map((addr, idx) => {
                  const selected = selectedAddressIndex === idx;
                  return (
                    <label
                      key={addr.id || idx}
                      className={`block bg-white border p-1 cursor-pointer transition-all duration-200 rounded-lg group ${
                        selected
                          ? "border-[#2C3E30] shadow-[0_0_0_1px_#2C3E30] bg-green-50/10"
                          : "border-gray-200 hover:border-[#2C3E30]/40 hover:shadow-md"
                      }`}>
                      <div className="flex items-start gap-4 p-5">
                        {/* Custom checkbox */}
                        <div className="mt-1 shrink-0">
                          <div
                            className={`w-5 h-5 border flex items-center justify-center rounded-full transition-colors ${
                              selected
                                ? "bg-[#2C3E30] border-[#2C3E30]"
                                : "bg-white border-gray-300 group-hover:border-[#2C3E30]/50"
                            }`}>
                            {selected && (
                              <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                            )}
                          </div>
                          <input
                            type="radio"
                            checked={selected}
                            onChange={() => setSelectedAddressIndex(idx)}
                            className="hidden"
                          />
                        </div>
                        <div className="flex-1">
                          <AddressCard
                            address={addr}
                            onEdit={(e) => handleEdit(e, addr)}
                          />
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            ) : (
              /* Empty state */
              <div className="text-center py-12 px-4 bg-gray-50/50 border border-dashed border-gray-200 rounded-lg">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-gray-100 mb-4">
                  <MapPin size={24} className="text-gray-400 stroke-[1.5]" />
                </div>
                <h3 className="text-gray-900 font-medium mb-1">
                  No saved addresses
                </h3>
                <p className="text-gray-500 text-sm mb-6">
                  Add a delivery address to proceed with your order.
                </p>
                <button
                  onClick={handleAddNew}
                  className="bg-[#2C3E30] text-white px-8 py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-[#1a251d] active:scale-[0.98] transition-all rounded-md shadow-sm hover:shadow-md">
                  Add New Address
                </button>
              </div>
            )}
          </section>

          {/* Section: Payment Method */}
          <section className="bg-white p-6 sm:p-8 border border-gray-100 shadow-sm rounded-xl">
            <div className="border-b border-gray-100 pb-4 mb-6">
              <h2
                className="text-2xl text-gray-900"
                style={{ fontFamily: "'Playfair Display', serif" }}>
                2. Payment Method
              </h2>
            </div>
            <div className="p-1">
              <PaymentSelector
                availableMethods={["cod", "whatsapp"]}
                defaultMethod={paymentMethod}
                onSelectPayment={setPaymentMethod}
              />
            </div>
          </section>
        </div>

        {/* ─── RIGHT COLUMN: ORDER SUMMARY ─────────────────────────── */}
        <div className="w-full lg:w-[400px] xl:w-[440px] shrink-0">
          <div className="sticky top-8 bg-white p-6 sm:p-8 border border-gray-100 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
            <h2
              className="text-2xl text-gray-900 mb-6 border-b border-gray-100 pb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              Order Summary
            </h2>

            {/* Item Preview */}
            <div className="space-y-5 mb-6 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 group">
                  <div className="relative shrink-0 overflow-hidden rounded-md border border-gray-100 bg-gray-50">
                    <img
                      src={item.image || item.banner || item.images?.[0]}
                      alt={item.name}
                      className="w-20 h-24 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-0 right-0 bg-gray-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-bl-md">
                      x{item.quantity}
                    </span>
                  </div>
                  <div className="flex flex-col justify-center text-sm py-1">
                    <p className="font-medium text-gray-900 line-clamp-2 leading-snug mb-2">
                      {item.name}
                    </p>
                    <p className="font-semibold text-gray-900 mt-auto text-base">
                      ₹{item.price * item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 mb-8 text-sm text-gray-500 border-t border-gray-100 pt-6">
              <div className="flex justify-between items-center">
                <span>Subtotal ({items.length} items)</span>
                <span className="text-gray-900 font-medium">
                  ₹{pricing.subtotal}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Shipping Fee</span>
                <span className="text-gray-900 font-medium">
                  {pricing.platformFee === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    `₹${pricing.platformFee}`
                  )}
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-end border-t border-gray-900 pt-6 mb-8">
              <span className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-1">
                Total
              </span>
              <span
                className="text-4xl text-gray-900 tracking-tight"
                style={{ fontFamily: "'Playfair Display', serif" }}>
                ₹{pricing.totalPayable}
              </span>
            </div>

            {/* Action Button */}
            <button
              onClick={() => setConfirmModalOpen(true)}
              disabled={isBtnDisabled}
              className="relative w-full bg-[#2C3E30] text-white py-4.5 px-4 text-sm font-bold tracking-[0.15em] uppercase hover:bg-[#1a251d] hover:shadow-lg active:scale-[0.98] transition-all duration-200 rounded-md overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex justify-center items-center min-h-[56px]">
              {placing ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                </span>
              ) : (
                "Place Order"
              )}
            </button>
            <p className="text-center text-[11px] text-gray-400 flex items-center justify-center gap-1.5 mt-6 uppercase tracking-widest font-medium">
              <ShieldCheck className="w-4 h-4 stroke-[2] text-green-600" />
              100% Secure Encrypted Payments
            </p>
          </div>
        </div>
      </div>

      {/* ── Address Form Popup ── */}
      <AddressFormPopup
        isOpen={popupOpen}
        form={form}
        setForm={setForm}
        onSave={handleSaveAddress}
        onCancel={() => {
          setPopupOpen(false);
          setForm(EMPTY_FORM);
        }}
      />

      {/* ── Confirm Order Modal ── */}
      <ConfirmOrderModal
        isOpen={confirmModalOpen}
        onCancel={() => setConfirmModalOpen(false)}
        onConfirm={() => {
          setConfirmModalOpen(false);
          placeOrder();
        }}
        title="Confirm Your Order"
        description={confirmDescription}
        confirmText="Place Order"
        cancelText="Go Back"
        placing={placing}
      />
    </div>
  );
}
