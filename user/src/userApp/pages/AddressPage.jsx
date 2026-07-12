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

  const [paymentMethod, setPaymentMethod] = useState("cashfree");

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
      unitPrice: Number(item.price ?? 0),
      price: Number(item.price ?? 0),
      originalPrice: Number(item.originalPrice || item.price || 0),
      mrp: Number(item.originalPrice || item.price || 0),

      variant: {
        size: item.selectedSize || item.variant?.size || "",
        color: item.selectedColor || item.variant?.color || "",
      },

      totalPrice: Number(item.quantity || 1) * Number(item.price ?? 0),
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

      // ✅ 3. Call the centralized hook
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
        setLocalError(result.error || "Checkout failed");
      }
    } catch (err) {
      setLocalError(err.message || "Checkout failed");
    } finally {
      placingRef.current = false;
    }
  };

  const displayError = localError || checkoutError;

  return (
    <div className="min-h-screen bg-gray-100 font-sans pb-20 md:pb-10 selection:bg-pink-200">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-700 hover:text-[#f43397] transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-base font-semibold text-gray-900">Checkout</h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 pt-6 flex flex-col md:flex-row gap-6">
        {/* LEFT COLUMN: User Actions */}
        <div className="flex-1 space-y-4">
          {/* Notifications */}
          {displayError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm">
              <span className="font-semibold">Error:</span> {displayError}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-md text-sm">
              <span className="font-semibold">Success:</span> {success}
            </div>
          )}

          {/* 1. SHIPPING ADDRESS CARD */}
          <div className="bg-white p-4 sm:p-5 rounded-md border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
              <h2 className="text-base font-semibold text-gray-900">
                Delivery Address
              </h2>
              <button
                onClick={() => setPopupOpen(true)}
                className="text-sm font-medium text-[#f43397] flex items-center gap-1 hover:text-[#d82a85]">
                <Plus size={16} /> Add New Address
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="py-8 text-center bg-gray-50 rounded border border-dashed border-gray-300">
                <p className="text-gray-600 text-sm mb-3">
                  You haven't saved any addresses yet.
                </p>
                <button
                  onClick={() => setPopupOpen(true)}
                  className="px-5 py-2 bg-[#f43397] text-white text-sm font-medium rounded hover:bg-[#d82a85] transition-colors">
                  Add Address
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((a, i) => (
                  <label
                    key={i}
                    className={`block p-4 border rounded-md cursor-pointer transition-colors ${
                      i === selectedAddressIndex
                        ? "border-[#f43397] bg-pink-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}>
                    <div className="flex items-start gap-3">
                      <div className="pt-0.5">
                        <input
                          type="radio"
                          name="addressSelection"
                          className="w-4 h-4 accent-[#f43397] cursor-pointer"
                          checked={i === selectedAddressIndex}
                          onChange={() => setSelectedAddressIndex(i)}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900 text-sm">
                            {a.fullName}
                          </p>
                          {a.tag && (
                            <span className="text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded font-medium">
                              {a.tag}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 leading-snug">
                          {a.addressLine1}
                          {a.addressLine2 ? `, ${a.addressLine2}` : ""}
                          <br />
                          {a.city}, {a.state} -{" "}
                          <span className="font-medium text-gray-800">
                            {a.postalCode || a.pincode}
                          </span>
                        </p>
                        {a.phone && (
                          <p className="text-sm text-gray-600 mt-1">
                            Phone:{" "}
                            <span className="font-medium text-gray-800">
                              {a.phone}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* 2. PAYMENT METHOD CARD */}
          <div className="bg-white p-4 sm:p-5 rounded-md border border-gray-200 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-4">
              Payment Method
            </h2>
            <PaymentSelector
              availableMethods={["cashfree", "cod", "whatsapp"]}
              defaultMethod={paymentMethod}
              onSelectPayment={setPaymentMethod}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Order Summary */}
        <div className="w-full md:w-[35%] lg:w-[30%] shrink-0">
          <div className="sticky top-20">
            {/* Assuming CartSummary is its own component. 
              Wrap it in a white card context if CartSummary itself isn't a card.
            */}
            <div className="bg-white rounded-md border border-gray-200 shadow-sm p-1">
              <CartSummary
                subtotal={pricing.subtotal}
                originalTotalPrice={pricing.totalMRP}
                gstAmount={pricing.taxAmount}
                platformFee={pricing.deliveryFee}
                selectedItems={normalizedItems}
                onPlaceOrder={placeOrder}
                addressPage={true}
                isLoading={isLoading}
                btnText={isLoading ? "Processing..." : "Place Order"}
              />
            </div>
          </div>
        </div>
      </div>

      {/* LOADING OVERLAY */}
      {loadingMessage && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md shadow-lg border border-gray-200 flex flex-col items-center min-w-[250px]">
            <Loader2 className="animate-spin text-[#f43397] mb-3" size={32} />
            <p className="text-sm font-medium text-gray-900">
              {loadingMessage}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Please do not close this window
            </p>
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
