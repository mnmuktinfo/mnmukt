import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useAuth } from "../features/auth/context/UserContext";
import { useCart } from "../features/cart/context/CartContext";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";

import { createOrder, makeOrderId } from "../services/orderService";
import { calculatePricing } from "../services/pricingEngine";

import AddressCard from "../components/cards/AddressCard";
import AddressFormPopup from "../components/form/AddressFormPopup";
import CartSummary from "../features/cart/components/CartSummary";
import PaymentSelector from "../components/cards/PaymentComponent"; // ✅ one import, correct name
import ConfirmOrderModal from "../components/cards/ConfirmOrderModal";

import { Plus, MapPin, AlertCircle, ShieldCheck } from "lucide-react";

/* ────────────────────────────────
   Constants
──────────────────────────────── */

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

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER ?? "";

/* ────────────────────────────────
   Error Banner
──────────────────────────────── */

const ErrorBanner = ({ message, onDismiss }) => {
  if (!message) return null;
  return (
    <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-6">
      <AlertCircle size={16} className="text-red-400 shrink-0" />
      <p className="text-[13px] text-red-600 flex-1">{message}</p>
      <button
        onClick={onDismiss}
        className="text-red-400 text-[11px] font-semibold uppercase tracking-wide">
        Dismiss
      </button>
    </div>
  );
};

/* ────────────────────────────────
   Address Page
──────────────────────────────── */

const AddressPage = () => {
  const { user } = useAuth();
  const { clear } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { source, items } = location.state || {};

  // ── Normalize cart items into a stable shape ──
  const normalizedItems = useMemo(() => {
    if (!items?.length) return [];
    return items.map((item) => ({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      quantity: item.quantity || item.selectedQuantity || 1,
      size: item.size || item.selectedSize || "",
      image: item.banner || item.images?.[0] || "",
    }));
  }, [items]);

  // ── Pricing ──
  const pricing = useMemo(
    () => calculatePricing(normalizedItems),
    [normalizedItems],
  );

  // ── Order ID — generated once, synchronously ──
  const orderIdRef = useRef(null);
  if (!orderIdRef.current && user?.name) {
    orderIdRef.current = makeOrderId(user.name);
  }

  // ── State ──
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const placingRef = useRef(false);

  // ── Guard: nothing to checkout — placed AFTER all hooks ──
  if (!normalizedItems.length) {
    return <Navigate to="/" replace />;
  }

  // ── Fetch saved addresses ──
  const fetchAddresses = useCallback(async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    try {
      const q = query(
        collection(db, "users", user.uid, "addresses"),
        orderBy("createdAt", "desc"),
        limit(10),
      );
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAddresses(list);
      if (!list.length) setEditing(true);
    } catch (err) {
      console.error("Address load error:", err);
      setError("Failed to load addresses.");
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // ── Save address to local state ──
  const handleSaveAddress = () => {
    const newAddress = {
      id: form.id || `temp-${Date.now()}`,
      name: form.name,
      phone: form.phone,
      line1: form.addressLine1,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
      tag: form.tag,
    };

    setAddresses((prev) =>
      form.id
        ? prev.map((a) => (a.id === form.id ? newAddress : a))
        : [newAddress, ...prev],
    );
    setEditing(false);
    setForm(EMPTY_FORM);
  };

  // ── Place order ──
  const placeOrder = async () => {
    if (placingRef.current) return;

    if (!addresses.length) {
      setError("Please add a delivery address.");
      return;
    }
    if (!orderIdRef.current) {
      setError("Order ID not ready. Please refresh.");
      return;
    }

    placingRef.current = true;
    setPlacing(true);

    try {
      const selectedAddress = addresses[selectedAddressIndex];

      await createOrder({
        orderId: orderIdRef.current,
        user,
        selectedAddress,
        paymentMethod,
        items: normalizedItems,
        pricing,
      });

      if (source === "cart") await clear();
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
    } finally {
      placingRef.current = false;
      setPlacing(false);
    }
  };

  const btnText = placing
    ? "Processing..."
    : editing
      ? "Save address first"
      : "Continue";

  const disabled =
    placing || editing || !addresses.length || !orderIdRef.current;

  const confirmDescription =
    paymentMethod === "whatsapp"
      ? "Confirm order and pay via WhatsApp?"
      : "Confirm order with Cash on Delivery?";

  /* ── Render ── */
  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* ── LEFT — Address selection ── */}
        <div className="flex-1">
          <ErrorBanner message={error} onDismiss={() => setError("")} />

          <div className="flex justify-between items-center border border-gray-100 px-4 py-3 mb-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
              Select Delivery Address
            </h2>

            {!editing && addresses.length > 0 && (
              <button
                onClick={() => {
                  setForm(EMPTY_FORM);
                  setEditing(true);
                }}
                className="flex items-center gap-1.5 text-[#f43397] text-sm font-medium hover:underline">
                <Plus size={15} /> Add New
              </button>
            )}
          </div>

          <AddressFormPopup
            isOpen={editing}
            form={form}
            setForm={setForm}
            onSave={handleSaveAddress}
            onCancel={
              addresses.length
                ? () => {
                    setEditing(false);
                    setForm(EMPTY_FORM);
                  }
                : null
            }
          />

          {!editing &&
            addresses.map((addr, idx) => {
              const selected = selectedAddressIndex === idx;
              return (
                <label
                  key={addr.id}
                  className={`block  bg-white border  mb-3 cursor-pointer transition-colors ${
                    selected
                      ? "border-[#f43397] bg-[#fff0f5]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}>
                  <input
                    type="radio"
                    checked={selected}
                    onChange={() => setSelectedAddressIndex(idx)}
                    className="hidden"
                  />
                  <AddressCard
                    address={{
                      ...addr,
                      addressLine1: addr.line1 || addr.addressLine1,
                    }}
                    onEdit={(e) => {
                      e.preventDefault();
                      setForm({
                        ...addr,
                        addressLine1: addr.line1 || addr.addressLine1,
                        id: addr.id,
                      });
                      setEditing(true);
                    }}
                  />
                </label>
              );
            })}

          {!addresses.length && !editing && (
            <div className="text-center py-16 bg-white border rounded-xl">
              <MapPin size={28} className="mx-auto text-[#f43397]" />
              <p className="mt-4 text-gray-500 text-sm">No saved addresses</p>
              <button
                onClick={() => setEditing(true)}
                className="mt-4 bg-[#f43397] text-white px-6 py-3 rounded-lg text-sm font-medium">
                Add Address
              </button>
            </div>
          )}
        </div>

        {/* ── RIGHT — Order summary + payment + trust ── */}
        <div className="w-full lg:w-[380px]">
          <div className="sticky top-24 space-y-4">
            {/* ✅ Payment selector — right sidebar only, never in header row */}
            <PaymentSelector
              availableMethods={["cod", "whatsapp"]}
              defaultMethod={paymentMethod}
              onSelectPayment={setPaymentMethod}
            />
            <CartSummary
              subtotal={pricing.subtotal}
              originalTotalPrice={pricing.originalTotalPrice}
              deliveryFee={pricing.deliveryFee}
              totalPayable={pricing.totalPayable}
              selectedItems={normalizedItems}
              onPlaceOrder={() => setConfirmModalOpen(true)}
              placing={placing}
              btnText={btnText}
              disabled={disabled}
              addressPage="true"
            />

            <div className="flex items-center justify-center gap-2 bg-white border border-gray-100 p-4 rounded-xl">
              <ShieldCheck size={15} className="text-[#f43397]" />
              <p className="text-xs font-semibold text-gray-500">
                100% Secure Payments
              </p>
            </div>
          </div>
        </div>
      </div>

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
};

export default AddressPage;
