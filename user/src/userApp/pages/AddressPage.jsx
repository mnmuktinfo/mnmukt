import { useMemo, useRef, useState } from "react";
import { useAuth } from "../features/auth/context/UserContext";
import { useCart } from "../features/cart/context/CartContext";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import {
  createOrder,
  makeOrderId,
} from "../features/orders/services/orderService";
import { calculatePricing } from "../services/pricingEngine";

import AddressCard from "../components/cards/AddressCard";
import AddressFormPopup from "../components/form/AddressFormPopup";
import CartSummary from "../features/cart/components/CartSummary";
import PaymentSelector from "../components/cards/PaymentComponent";
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
  const { user, address, saveAddress } = useAuth();
  const { clear } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { source, items } = location.state || {};

  // ── Seed saved addresses from context ──
  const [addresses, setAddresses] = useState(() =>
    address
      ? [{ ...address, addressLine1: address.line1 || address.addressLine1 }]
      : [],
  );

  /*
   * ── Normalize cart items ──
   *
   * FIX: Include ALL fields that orderService.createOrder() stores and
   * that OrderCard renders:
   *   - description  → shown under product name in OrderCard
   *   - image        → shown as product thumbnail in OrderCard
   *   - selectedSize → shown as size badge in OrderCard
   *   - productId    → used for "View product" / "Buy again" navigation
   *
   * Source fields vary by where items come from (cart, product page, etc.)
   * so we check multiple fallback keys for each field.
   */
  const normalizedItems = useMemo(() => {
    if (!items?.length) return [];
    return items.map((item) => ({
      // ── Identity ──
      id: item.id || item.productId || "",
      productId: item.id || item.productId || "", // ← needed for navigation in OrderCard

      // ── Display ──
      name: item.name ?? "",
      description: item.description ?? item.shortDescription ?? "", // ← FIX: was missing
      image:
        item.image || item.banner || item.images?.[0] || item.thumbnail || "",

      // ── Pricing & quantity ──
      price: Number(item.price) || 0,
      quantity: item.quantity || item.selectedQuantity || 1,

      // ── Variant ──
      size: item.size || item.selectedSize || "",
      selectedSize: item.size || item.selectedSize || "", // ← FIX: stored as selectedSize in orderService
    }));
  }, [items]);

  const pricing = useMemo(
    () => calculatePricing(normalizedItems),
    [normalizedItems],
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

  if (!normalizedItems.length) return <Navigate to="/" replace />;

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
        // Editing existing — replace in list
        setAddresses((prev) =>
          prev.map((a) => (a.id === form.id ? normalized : a)),
        );
      } else {
        // New — append and auto-select it
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
        items: normalizedItems, // ← now carries description, productId, selectedSize
        pricing,
      });

      if (source === "cart") await clear();

      // Invalidate both the specific user orders key and any generic "orders" key
      await queryClient.invalidateQueries({ queryKey: ["orders", user.uid] });
      await queryClient.invalidateQueries({ queryKey: ["orders"] });

      if (paymentMethod === "whatsapp" && WHATSAPP_NUMBER) {
        const msg = `Hello ${user.name}, your order ${orderIdRef.current} has been placed. Total: ₹${pricing.totalPayable}`;
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

  const btnText = placing ? "Processing..." : "Continue";
  const disabled = placing || !addresses.length || !orderIdRef.current;

  const confirmDescription =
    paymentMethod === "whatsapp"
      ? "Confirm order and pay via WhatsApp?"
      : "Confirm order with Cash on Delivery?";

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* ── LEFT — Address section ── */}
        <div className="flex-1">
          <ErrorBanner message={error} onDismiss={() => setError("")} />

          {/* Section header */}
          <div className="flex justify-between items-center border border-gray-100 px-4 py-3 mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
              Select Delivery Address
            </h2>
            <button
              onClick={handleAddNew}
              className="flex items-center gap-1.5 text-[#f43397] text-sm font-medium hover:underline">
              <Plus size={15} /> Add New
            </button>
          </div>

          {/* Saved address cards */}
          {addresses.length > 0 ? (
            <div className="space-y-3">
              {addresses.map((addr, idx) => {
                const selected = selectedAddressIndex === idx;
                return (
                  <label
                    key={addr.id || idx}
                    className={`block bg-white border cursor-pointer transition-colors ${
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
                      address={addr}
                      onEdit={(e) => handleEdit(e, addr)}
                    />
                  </label>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white border rounded-xl">
              <MapPin size={28} className="mx-auto text-[#f43397]" />
              <p className="mt-4 text-gray-500 text-sm">No saved addresses</p>
              <button
                onClick={handleAddNew}
                className="mt-4 bg-[#f43397] text-white px-6 py-3 rounded-lg text-sm font-medium">
                Add Address
              </button>
            </div>
          )}
        </div>

        {/* ── RIGHT — Summary + payment ── */}
        <div className="w-full lg:w-[380px]">
          <div className="sticky top-24 space-y-4">
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
};

export default AddressPage;
