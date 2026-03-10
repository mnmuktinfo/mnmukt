import React, { useEffect, useState } from "react";
import { useAuth } from "../features/auth/context/UserContext";
import { useCart } from "../features/cart/context/CartContext";
import { useLocation, Navigate } from "react-router-dom";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../config/firebase";

import AddressForm from "../components/form/AddressForm";
import AddressCard from "../components/cards/AddressCard";
import CartSummary from "../features/cart/components/CartSummary";
import PaymentConfirmationPopup from "../components/pop-up/PaymentConfirmationPopup";
import { Loader2, Plus, ArrowLeft } from "lucide-react";

const AddressPage = () => {
  const { user, isLoggedIn, saveAddress, address: cachedAddress } = useAuth();
  const { clear } = useCart();
  const location = useLocation();
  const { items, totalAmount } = location.state || {};

  if (!items || items.length === 0) return <Navigate to="/cart" replace />;

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
    id: null,
  });

  const sanitize = (obj) => {
    const sanitized = {};
    Object.entries(obj).forEach(([key, value]) => {
      sanitized[key] = value ?? "";
    });
    return sanitized;
  };

  useEffect(() => {
    if (!user?.uid) return;
    const loadAddresses = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "users", user.uid, "addresses"),
          orderBy("createdAt", "desc"),
        );
        const snapshot = await getDocs(q);
        const loadedAddresses = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAddresses(loadedAddresses);
        const activeId = cachedAddress?.id || user.defaultAddressId;
        if (activeId) {
          const index = loadedAddresses.findIndex((a) => a.id === activeId);
          if (index !== -1) setSelectedAddressIndex(index);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadAddresses();
  }, [user, cachedAddress]);

  const handleSaveAddress = async () => {
    const addressPayload = {
      id: form.id,
      line1: form.addressLine1,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
      name: form.name,
      phone: form.phone,
    };
    try {
      const savedAddr = await saveAddress(addressPayload);
      if (form.id) {
        setAddresses((prev) =>
          prev.map((a) => (a.id === savedAddr.id ? savedAddr : a)),
        );
      } else {
        setAddresses((prev) => [savedAddr, ...prev]);
        setSelectedAddressIndex(0);
      }
      setEditing(false);
    } catch (error) {
      alert("Failed to save address.");
    }
  };

  // Generate 6-character order ID
  const userIdentifier = (user.name || "user")
    .replace(/\s+/g, "")
    .toLowerCase()
    .slice(0, 4); // first 4 letters of name

  const randomDigits = Math.floor(Math.random() * 90 + 10); // 2-digit number (10–99)

  const orderId = `${userIdentifier}${randomDigits}`;
  console.log(orderId); // e.g., "mukt42"

  const placeOrder = async () => {
    if (addresses.length === 0) return alert("Add an address.");
    const selectedAddress = addresses[selectedAddressIndex];

    try {
      const orderPayload = {
        orderId,
        userId: user.uid,
        userSnapshot: { name: user.name || "", email: user.email || "" },
        deliveryAddress: sanitize({
          line1: selectedAddress.line1 || selectedAddress.addressLine1 || "",
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode,
          name: selectedAddress.name || user.name,
          phone: selectedAddress.phone || user.phone,
        }),
        items: items.map((item) => ({
          productId: item.id,
          name: item.name,
          image: Array.isArray(item.images) ? item.images[0] : item.image || "",
          price: Number(item.price),
          quantity: Number(item.selectedQuantity || 1),
          selectedSize: item.selectedSize || "N/A",
          lineTotal: Number(item.price) * Number(item.selectedQuantity || 1),
        })),
        totalAmount: Number(totalAmount),
        status: "PLACED",
        paymentMethod: "COD",
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "orders"), orderPayload);
      await clear();
      setPopupVisible(true);
    } catch (err) {
      alert("Checkout failed.");
    }
  };

  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#ff356c] mb-4" size={32} />
        <span className="text-[10px] uppercase tracking-[0.4em] text-slate-400">
          Verifying Protocol
        </span>
      </div>
    );

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 pb-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 py-12 border-b border-slate-50">
        <h1 className="text-4xl md:text-6xl font-light tracking-tighter">
          Shipping{" "}
          <span className="italic font-serif text-[#ff356c]">Manifest.</span>
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-20">
        {/* LEFT: Management */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">
              Delivery Directory
            </h3>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-[10px] font-black text-[#ff356c] uppercase tracking-widest flex items-center gap-2">
                <Plus size={14} /> Add New
              </button>
            )}
          </div>

          {editing ? (
            <div className="bg-slate-50/50 p-8 rounded-sm animate-in fade-in slide-in-from-bottom-4">
              <AddressForm
                form={form}
                setForm={setForm}
                onSave={handleSaveAddress}
                onCancel={() => setEditing(false)}
              />
            </div>
          ) : (
            <div className="space-y-6">
              {addresses.map((addr, idx) => (
                <div
                  key={addr.id}
                  onClick={() => setSelectedAddressIndex(idx)}
                  className={`group relative border-b py-8 transition-all cursor-pointer ${
                    selectedAddressIndex === idx
                      ? "border-[#ff356c]"
                      : "border-slate-100"
                  }`}>
                  <div className="flex items-start gap-8">
                    {/* Minimalist Radio */}
                    <div
                      className={`mt-1.5 w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                        selectedAddressIndex === idx
                          ? "border-[#ff356c]"
                          : "border-slate-200"
                      }`}>
                      {selectedAddressIndex === idx && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#ff356c]" />
                      )}
                    </div>

                    <div className="flex-1">
                      <AddressCard
                        address={{
                          ...addr,
                          addressLine1: addr.line1 || addr.addressLine1,
                        }}
                        onEdit={(e) => {
                          e.stopPropagation();
                          setEditing(true);
                          setForm({
                            ...addr,
                            addressLine1: addr.line1 || addr.addressLine1,
                            id: addr.id,
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Order Summary */}
        <div className="lg:w-[400px]">
          <div className="sticky top-32">
            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300 mb-10">
              Checkout Summary
            </h3>
            <div className="bg-slate-50/50 p-8 rounded-sm">
              <CartSummary
                subtotal={totalAmount}
                originalTotalPrice={totalAmount}
                platformFee={0}
                selectedItems={items}
                onPlaceOrder={placeOrder}
                btnText="Authorize Purchase"
              />
            </div>

            {/* Guarantee */}
            <p className="mt-8 text-[9px] uppercase tracking-[0.2em] text-slate-400 leading-loose text-center">
              Secure Checkout // Encryption Active <br />
              Orders are processed within 24 business hours.
            </p>
          </div>
        </div>
      </div>

      <PaymentConfirmationPopup
        visible={popupVisible}
        onClose={() => setPopupVisible(false)}
        whatsappNumber="919999999999"
        userId={user.uid}
        orderId={orderId}
      />
    </div>
  );
};

export default AddressPage;
