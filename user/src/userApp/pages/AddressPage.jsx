import { useMemo, useRef, useState } from "react";
import { useAuth } from "../features/auth/context/UserContext";
import { useCart } from "../features/cart/context/CartContext";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

// ✅ 1. Import your centralized hook instead of direct API calls
import { useCheckout } from "../features/orders/hooks/useCheckout";
import { calculatePricing } from "../services/pricingEngine";

import AddressFormPopup from "../components/form/AddressFormPopup";
import CartSummary from "../features/cart/components/CartSummary";
import PaymentSelector from "../components/cards/PaymentComponent";

import { Plus, ArrowLeft, Loader2 } from "lucide-react";

const EMPTY_FORM = {
  id: null,
  fullName: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  landmark: "",
  tag: "HOME",
};

const AddressPage = () => {
  const { user, address, saveAddress } = useAuth();
  const { clear } = useCart();

  // ✅ 2. Initialize your checkout hook
  const {
    performCheckout,
    isLoading,
    error: checkoutError,
    loadingMessage,
  } = useCheckout();

  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { source, items } = location.state || {};

  const [addresses, setAddresses] = useState(address ? [address] : []);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);

  const [popupOpen, setPopupOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const [paymentMethod, setPaymentMethod] = useState("razorpay");

  // Local state for UI feedback
  const [localError, setLocalError] = useState("");
  const [success, setSuccess] = useState("");

  const placingRef = useRef(false);

  /* ---------------- NORMALIZE ITEMS ---------------- */
  const normalizedItems = useMemo(() => {
    if (!items?.length) return [];

    return items.map((item) => ({
      productId: item.productId || item._id || item.id,
      sku: item.sku || "",
      name: item.name || "",
      image: item.image || item.thumbnail || "",

      quantity: Number(item.quantity || 1),
      unitPrice: Number(item.unitPrice ?? item.price ?? 0),
      mrp: Number(
        item.originalPrice || item.mrp || item.unitPrice || item.price || 0,
      ),

      variant: {
        size: item.selectedSize || item.variant?.size || "",
        color: item.selectedColor || item.variant?.color || "",
      },

      totalPrice:
        Number(item.quantity || 1) * Number(item.unitPrice ?? item.price ?? 0),
    }));
  }, [items]);

  const pricing = useMemo(
    () => ({
      ...calculatePricing(normalizedItems),
    }),
    [normalizedItems],
  );

  if (!normalizedItems.length) return <Navigate to="/" />;

  /* ---------------- SAVE ADDRESS ---------------- */
  const handleSaveAddress = async (data) => {
    try {
      const saved = await saveAddress(data);
      setAddresses((prev) => [...prev, saved]);
      setSelectedAddressIndex(addresses.length);
      setPopupOpen(false);
      setForm(EMPTY_FORM);
    } catch (err) {
      setLocalError(err.message);
    }
  };

  /* ---------------- PLACE ORDER (CENTRALIZED) ---------------- */
  const placeOrder = async () => {
    if (placingRef.current) return;
    placingRef.current = true;
    setLocalError("");

    try {
      const addr = addresses[selectedAddressIndex];

      if (!addr) throw new Error("Please select a delivery address first.");

      // ✅ 3. Call the centralized hook! It handles order creation AND Razorpay
      const result = await performCheckout({
        items: normalizedItems,
        shippingAddress: addr,
        paymentMethod,
        source: "web",
      });

      if (result.success) {
        if (source === "cart") {
          await clear();
        }

        await queryClient.invalidateQueries({ queryKey: ["orders"] });
        setSuccess("Order placed successfully!");

        setTimeout(() => {
          navigate(`/order-success/${result.orderId}`, { replace: true });
        }, 1200);
      } else {
        // If the hook failed, show the error
        setLocalError(result.error || "Checkout failed");
      }
    } catch (err) {
      setLocalError(err.message || "Checkout failed");
    } finally {
      placingRef.current = false;
    }
  };

  // Combine hook errors and local errors for display
  const displayError = localError || checkoutError;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <button onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft />
      </button>

      {displayError && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {displayError}
        </div>
      )}
      {success && (
        <div className="bg-green-100 text-green-700 p-3 rounded-md mb-4">
          {success}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ADDRESS */}
        <div className="lg:col-span-2 bg-white p-4 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg">Delivery Address</h2>
            <button
              onClick={() => setPopupOpen(true)}
              className="text-pink-500 p-1 hover:bg-pink-50 rounded">
              <Plus size={20} />
            </button>
          </div>

          {addresses.length === 0 && (
            <p className="text-gray-500 text-sm py-4">
              No addresses saved yet. Please add one.
            </p>
          )}

          {addresses.map((a, i) => (
            <div
              key={i}
              onClick={() => setSelectedAddressIndex(i)}
              className={`p-3 border rounded-lg mt-2 cursor-pointer transition-colors ${
                i === selectedAddressIndex
                  ? "border-pink-500 bg-pink-50"
                  : "hover:border-gray-300"
              }`}>
              <p className="font-medium text-sm">{a.fullName}</p>
              <p className="text-xs text-gray-600 mt-1">
                {a.addressLine1}, {a.city}
              </p>
            </div>
          ))}
        </div>

        {/* PAYMENT & SUMMARY */}
        <div className="space-y-6">
          <PaymentSelector
            availableMethods={["razorpay", "cod", "whatsapp"]}
            defaultMethod={paymentMethod}
            onSelectPayment={setPaymentMethod}
          />

          <CartSummary
            subtotal={pricing.subtotal}
            totalPayable={pricing.totalPayable}
            selectedItems={normalizedItems}
            onPlaceOrder={placeOrder}
            placing={isLoading} // ✅ Use isLoading from the hook
            btnText="Place Order"
          />
        </div>
      </div>

      {/* LOADING OVERLAY */}
      {loadingMessage && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl flex flex-col items-center shadow-xl">
            <Loader2 className="animate-spin mb-3 text-pink-500" size={32} />
            <p className="font-medium text-gray-800">{loadingMessage}</p>
          </div>
        </div>
      )}

      {/* POPUP */}
      <AddressFormPopup
        isOpen={popupOpen}
        form={form}
        setForm={setForm}
        onCancel={() => setPopupOpen(false)}
        onSave={handleSaveAddress}
      />
    </div>
  );
};

export default AddressPage;
