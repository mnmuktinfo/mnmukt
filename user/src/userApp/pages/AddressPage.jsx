import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "../features/auth/context/UserContext";
import { useCart } from "../features/cart/context/CartContext";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../config/firebase";
import { createOrder, makeOrderId } from "../services/orderService";

import AddressCard from "../components/cards/AddressCard";
import CartSummary from "../features/cart/components/CartSummary";
import PaymentConfirmationPopup from "../components/pop-up/PaymentConfirmationPopup";
import AddressFormPopup from "../components/form/AddressFormPopup";
import { Loader2, Plus, MapPin, AlertCircle, ShieldCheck } from "lucide-react";

const EMPTY_FORM = {
  name: "",
  phone: "",
  addressLine1: "",
  city: "",
  state: "",
  pincode: "",
  id: null,
};

const ErrorBanner = ({ message, onDismiss }) => {
  if (!message) return null;
  return (
    <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-sm px-4 py-3 mb-6 animate-in fade-in">
      <AlertCircle size={18} className="text-[#f15757] shrink-0" />
      <p className="text-[13px] text-red-700 font-medium flex-1">{message}</p>
      <button
        onClick={onDismiss}
        className="text-red-400 hover:text-red-600 text-[11px] font-bold uppercase tracking-widest transition-colors">
        Dismiss
      </button>
    </div>
  );
};

const AddressPage = () => {
  // Removed saveAddress from useAuth since we are handling it locally now
  const { user, address: cachedAddress } = useAuth();
  const { clear } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const { items, totalAmount } = location.state || {};

  const orderIdRef = useRef(makeOrderId(user?.name));

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);

  if (!items || items.length === 0)
    return <Navigate to="/checkout/cart" replace />;

  /* ── Fetch Saved Addresses on Mount ── */
  const fetchAddresses = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const q = query(
        collection(db, "users", user.uid, "addresses"),
        orderBy("createdAt", "desc"),
      );
      const snapshot = await getDocs(q);
      const loaded = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

      setAddresses(loaded);

      if (loaded.length > 0 && selectedAddressIndex >= loaded.length) {
        setSelectedAddressIndex(0);
      }

      if (loaded.length === 0) {
        setEditing(true);
      }
    } catch (err) {
      console.error("[AddressPage] Load:", err);
      setError("Failed to load addresses. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, [user?.uid, selectedAddressIndex]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  /* ── Save Address LOCALLY (For this order only) ── */
  const handleSaveAddress = () => {
    setError("");

    // Create a temporary address object
    const newAddress = {
      // If it's a new address, generate a temp ID so React can track it in the list
      id: form.id || `temp-${Date.now()}`,
      line1: form.addressLine1,
      addressLine1: form.addressLine1,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
      name: form.name,
      phone: form.phone,
    };

    // Update the UI list immediately without writing to Firebase
    setAddresses((prev) => {
      if (form.id) {
        // If editing an existing card, update it locally
        return prev.map((a) => (a.id === form.id ? newAddress : a));
      } else {
        // If adding a new card, put it at the top of the list
        return [newAddress, ...prev];
      }
    });

    // Auto-select the newly added address
    if (!form.id) {
      setSelectedAddressIndex(0);
    }

    setEditing(false);
    setForm(EMPTY_FORM);
  };

  /* ── Place order using Service ── */
  const placeOrder = async () => {
    if (addresses.length === 0) {
      setError("Please add a delivery address first.");
      return;
    }
    if (placing) return;

    setPlacing(true);
    setError("");

    try {
      // This sends the locally selected address directly to the order document
      await createOrder({
        orderId: orderIdRef.current,
        user,
        selectedAddress: addresses[selectedAddressIndex],
        items,
        totalAmount,
      });

      await clear();
      setPopupVisible(true);
    } catch (err) {
      console.error("[AddressPage] Order failed:", err);
      setError("Checkout failed. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f9f9f9] gap-4">
        <Loader2 className="animate-spin text-[#007673]" size={32} />
        <span className="text-[12px] uppercase tracking-widest text-gray-500 font-bold">
          Loading Addresses...
        </span>
      </div>
    );

  return (
    <div className="min-h-screen  font-sans text-gray-800 pb-24">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* ── LEFT: Address Selection ── */}
        <div className="flex-1 min-w-0">
          <ErrorBanner message={error} onDismiss={() => setError("")} />

          {/* Header & Add Button */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[16px] font-bold text-gray-900 uppercase tracking-wide">
              Select Delivery Address
            </h2>
            {addresses.length > 0 && (
              <button
                onClick={() => {
                  setForm(EMPTY_FORM);
                  setEditing(true);
                }}
                className="flex items-center gap-1.5 text-[12px] font-bold text-[#007673] uppercase tracking-wide hover:underline transition-all">
                <Plus size={16} strokeWidth={2.5} /> Add New
              </button>
            )}
          </div>

          {/* Form Popup */}
          <AddressFormPopup
            isOpen={editing}
            form={form}
            setForm={setForm}
            onSave={handleSaveAddress}
            onCancel={
              addresses.length > 0
                ? () => {
                    setEditing(false);
                    setForm(EMPTY_FORM);
                  }
                : null
            }
          />

          {/* Address List Radio Cards */}
          {addresses.length > 0 && (
            <div className="space-y-4">
              {addresses.map((addr, idx) => {
                const isSelected = selectedAddressIndex === idx;
                return (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressIndex(idx)}
                    className={`relative p-5 bg-white border rounded-sm cursor-pointer transition-all duration-200 flex items-start gap-4 ${
                      isSelected
                        ? "border-[#007673] shadow-[0_0_0_1px_#007673]"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                    }`}>
                    {/* Radio Button */}
                    <div className="pt-1 shrink-0">
                      <div
                        className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected ? "border-[#007673]" : "border-gray-300"
                        }`}>
                        {isSelected && (
                          <div className="w-[8px] h-[8px] rounded-full bg-[#007673]" />
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <AddressCard
                        address={{
                          ...addr,
                          addressLine1: addr.line1 || addr.addressLine1,
                        }}
                        onEdit={(e) => {
                          e.stopPropagation();
                          setForm({
                            ...addr,
                            addressLine1: addr.line1 || addr.addressLine1,
                            id: addr.id,
                          });
                          setEditing(true);
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {addresses.length === 0 && !editing && (
            <div className="flex flex-col items-center justify-center gap-4 py-16 bg-white border border-gray-200 rounded-sm">
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                <MapPin size={24} strokeWidth={1.5} className="text-gray-400" />
              </div>
              <p className="text-[13px] text-gray-500 font-medium">
                You haven't saved any addresses yet.
              </p>
              <button
                onClick={() => {
                  setForm(EMPTY_FORM);
                  setEditing(true);
                }}
                className="mt-2 bg-[#007673] text-white px-6 py-2.5 rounded-sm text-[12px] font-bold uppercase tracking-widest hover:bg-[#005f5c] transition-colors">
                Add Address
              </button>
            </div>
          )}
        </div>

        {/* ── RIGHT: Summary Sidebar ── */}
        <div className="w-full lg:w-[400px] shrink-0">
          <div className="sticky top-24">
            <div className=" p-1 ">
              <CartSummary
                subtotal={totalAmount}
                originalTotalPrice={totalAmount}
                platformFee={0}
                selectedItems={items}
                onPlaceOrder={placeOrder}
                placing={placing}
                btnText={placing ? "Processing..." : "Confirm Order"}
              />
            </div>

            <div className="mt-6 flex flex-col gap-2 items-center text-center">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[#007673]" />
                100% Secure Checkout
              </p>
            </div>
          </div>
        </div>
      </div>

      <PaymentConfirmationPopup
        visible={popupVisible}
        onClose={() => {
          setPopupVisible(false);
          navigate("/");
        }}
        whatsappNumber="919999999999"
        userId={user?.uid}
        orderId={orderIdRef.current}
      />
    </div>
  );
};

export default AddressPage;
