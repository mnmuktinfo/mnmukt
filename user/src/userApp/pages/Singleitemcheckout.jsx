import React, { useMemo, useState, useEffect } from "react";
import { useAuth } from "../features/auth/context/UserContext";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useCheckout } from "../features/orders/hooks/useCheckout";
import { validateCartItems } from "../features/orders/services/checkoutService";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShoppingBag,
  ShieldCheck,
} from "lucide-react";
import {
  EMPTY_ADDRESS_FORM,
  PAYMENT_GATEWAY,
} from "../features/orders/constants/appConstants";

const STORE_NAME = import.meta.env.VITE_STORE_NAME || "bAbli";

/* ─── Reusable input ──────────────────────────────────────── */
const InputField = ({
  name,
  type = "text",
  placeholder,
  maxLength,
  value,
  onChange,
  error,
  disabled = false,
  className = "",
}) => (
  <div className={`w-full ${className}`}>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      disabled={disabled}
      className={`w-full px-3 py-3 rounded-md border text-sm transition-all focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed placeholder-gray-500 ${
        error
          ? "border-red-500 focus:ring-red-500 focus:border-red-500"
          : "border-gray-300 bg-white"
      }`}
    />
    {error && <span className="text-red-500 text-xs mt-1 block">{error}</span>}
  </div>
);

const SingleItemCheckout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    isLoading,
    error: checkoutError,
    loadingMessage,
    performCheckout,
    performAddressValidation,
  } = useCheckout();

  const {
    items: stateItems,
    item: legacyItem,
    source = "web",
  } = location.state || {};
  const rawItem = stateItems?.[0] || legacyItem || null;

  const selectedSize =
    searchParams.get("variant") || rawItem?.selectedSize || "";
  const selectedQuantity = Number(searchParams.get("qty")) || 1;

  // Split name for UI mapping to match the image, merged for backend
  const initialFirstName = user?.firstName || "";
  const initialLastName = user?.lastName || "";

  const [shippingAddress, setShippingAddress] = useState({
    ...EMPTY_ADDRESS_FORM,
    email: user?.email || "",
    firstName: initialFirstName,
    lastName: initialLastName,
    fullName: `${initialFirstName} ${initialLastName}`.trim(),
  });

  const [formErrors, setFormErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_GATEWAY.RAZORPAY);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const normalizedItem = useMemo(() => {
    if (!rawItem) return null;
    return {
      productId: rawItem.productId || rawItem._id || rawItem.id,
      sku: rawItem.sku || "",
      name: rawItem.name || "",
      image: rawItem.image || rawItem.banner || rawItem.thumbnail || "",
      quantity: selectedQuantity,
      unitPrice: Number(rawItem.price ?? 0),
      mrp: Number(rawItem.originalPrice || rawItem.price || 0),
      totalPrice: Number(rawItem.price ?? 0) * selectedQuantity,
      variant: {
        size: selectedSize,
        color: rawItem.selectedColor || rawItem.variant?.color || "",
      },
      category: rawItem.category || "",
      brand: rawItem.brand || "",
      selectedSize,
    };
  }, [rawItem, selectedSize, selectedQuantity]);

  const pricing = useMemo(() => {
    if (!normalizedItem) return null;
    const subtotal = normalizedItem.unitPrice * normalizedItem.quantity;
    const totalMRP = normalizedItem.mrp * normalizedItem.quantity;
    const itemDiscount = totalMRP - subtotal;
    const deliveryFee = subtotal >= 500 ? 0 : subtotal >= 999 ? 25 : 50;
    const totalPayable = subtotal + deliveryFee;

    return {
      subtotal,
      totalMRP,
      itemDiscount,
      deliveryFee,
      couponDiscount,
      totalPayable: totalPayable - couponDiscount,
    };
  }, [normalizedItem, couponDiscount]);

  if (!rawItem || !selectedSize) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Nothing to checkout
          </h2>
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 bg-[#0058a3] text-white rounded-md font-medium text-sm hover:bg-blue-700 transition-colors">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const fetchPinForSingleCheckout = async (pin) => {
    if (!/^[1-9][0-9]{5}$/.test(pin)) return;
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      const result = data?.[0];
      if (result?.Status === "Success") {
        const office = result.PostOffice?.[0];
        setShippingAddress((prev) => ({
          ...prev,
          city: office?.District || prev.city,
          state: office?.State || prev.state,
        }));
      }
    } catch (err) {}
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;

    if (name === "postalCode") {
      if (!/^\d*$/.test(value) || value.length > 6) return;
      if (value.length === 6) fetchPinForSingleCheckout(value);
    }

    setShippingAddress((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "firstName" || name === "lastName") {
        updated.fullName =
          `${updated.firstName || ""} ${updated.lastName || ""}`.trim();
      }
      return updated;
    });

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const applyCoupon = () => {
    if (!couponCode.trim()) return;
    const couponMap = { VIBE5ONLY: 0.05, SAVE10: 0.1 };
    const pct = couponMap[couponCode.toUpperCase()];
    if (pct) {
      setCouponDiscount(pricing.totalPayable * pct);
      setCouponApplied(true);
    } else {
      alert("Invalid coupon code");
      setCouponApplied(false);
      setCouponDiscount(0);
    }
  };

  const handleCheckout = async () => {
    const addressValidation = performAddressValidation(shippingAddress);
    if (!addressValidation.isValid) {
      setFormErrors(addressValidation.errors);

      // Scroll to top to show errors if needed
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setFormErrors({});

    const result = await performCheckout({
      items: [normalizedItem],
      shippingAddress,
      paymentMethod,
      source,
    });

    if (result?.success) {
      setTimeout(() => {
        navigate(`/order-tracking/${result.orderId}`);
      }, 1200);
    }
  };

  // ── Redirect user to login and return back here
  const handleSignIn = () => {
    const currentUrl = location.pathname + location.search;
    navigate("/login", { state: { returnUrl: currentUrl } });
  };

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col lg:flex-row">
      {/* ── LEFT COLUMN: Forms ── */}
      <div className="w-full lg:w-[55%] xl:w-[60%] pt-8 pb-16 px-4 sm:px-8 lg:pl-20 xl:pl-32 lg:pr-12">
        {/* Header / Logo */}
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-light text-pink-500 tracking-wide">
            {STORE_NAME}
          </h1>
          <ShoppingBag className="text-blue-600 lg:hidden" size={24} />
        </header>

        {checkoutError && (
          <div className="mb-6 flex gap-3 p-4 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle
              size={20}
              className="text-red-600 flex-shrink-0 mt-0.5"
            />
            <div>
              <p className="text-red-800 text-sm font-medium">
                Error processing order
              </p>
              <p className="text-red-700 text-sm mt-1">{checkoutError}</p>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* Contact Section */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium text-gray-900">Contact</h2>
              {!user && (
                <button
                  onClick={handleSignIn}
                  className="text-blue-600 hover:underline text-sm font-medium">
                  Sign in
                </button>
              )}
            </div>
            <div className="relative">
              <InputField
                name="email"
                type="email"
                placeholder="Email"
                value={shippingAddress.email}
                onChange={handleAddressChange}
                error={formErrors.email}
                disabled={isLoading}
              />
              <HelpCircle
                size={18}
                className="absolute right-3 top-3.5 text-gray-400"
              />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input
                type="checkbox"
                id="news"
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
              />
              <label
                htmlFor="news"
                className="text-sm text-gray-600 cursor-pointer">
                Email me with news and offers
              </label>
            </div>
          </section>

          {/* Delivery Section */}
          <section>
            <h2 className="text-xl font-medium text-gray-900 mb-4">Delivery</h2>
            <div className="space-y-3">
              <div className="w-full relative">
                <select className="w-full px-3 py-3 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 appearance-none">
                  <option>India</option>
                </select>
                <span className="absolute right-3 top-3.5 text-gray-400 text-xs">
                  ▼
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <InputField
                  name="firstName"
                  placeholder="First name"
                  value={shippingAddress.firstName}
                  onChange={handleAddressChange}
                  error={formErrors.fullName} // Mapping full name error here temporarily
                  disabled={isLoading}
                />
                <InputField
                  name="lastName"
                  placeholder="Last name"
                  value={shippingAddress.lastName}
                  onChange={handleAddressChange}
                  disabled={isLoading}
                />
              </div>

              <InputField
                name="addressLine1"
                placeholder="Address"
                value={shippingAddress.addressLine1}
                onChange={handleAddressChange}
                error={formErrors.addressLine1}
                disabled={isLoading}
              />

              <InputField
                name="addressLine2"
                placeholder="Apartment, suite, etc. (optional)"
                value={shippingAddress.addressLine2}
                onChange={handleAddressChange}
                disabled={isLoading}
              />

              <div className="grid grid-cols-3 gap-3">
                <InputField
                  name="city"
                  placeholder="City"
                  value={shippingAddress.city}
                  onChange={handleAddressChange}
                  error={formErrors.city}
                  disabled={isLoading}
                />
                <div className="w-full relative">
                  <select
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleAddressChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 appearance-none">
                    <option value="" disabled>
                      State
                    </option>
                    <option value="Uttarakhand">Uttarakhand</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Delhi">Delhi</option>
                    {/* Add other states as needed */}
                  </select>
                  <span className="absolute right-3 top-3.5 text-gray-400 text-xs">
                    ▼
                  </span>
                </div>
                <InputField
                  name="postalCode"
                  placeholder="PIN code"
                  maxLength="6"
                  value={shippingAddress.postalCode}
                  onChange={handleAddressChange}
                  error={formErrors.postalCode}
                  disabled={isLoading}
                />
              </div>

              <div className="relative">
                <InputField
                  name="phone"
                  type="tel"
                  placeholder="Phone"
                  maxLength="10"
                  value={shippingAddress.phone}
                  onChange={handleAddressChange}
                  error={formErrors.phone}
                  disabled={isLoading}
                />
                <HelpCircle
                  size={18}
                  className="absolute right-3 top-3.5 text-gray-400"
                />
              </div>

              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="save-info"
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                  />
                  <label
                    htmlFor="save-info"
                    className="text-sm text-gray-600 cursor-pointer">
                    Save this information for next time
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="text-offers"
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                  />
                  <label
                    htmlFor="text-offers"
                    className="text-sm text-gray-600 cursor-pointer">
                    Text me with news and offers
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Shipping Method Section */}
          <section>
            <h2 className="text-xl font-medium text-gray-900 mb-4">
              Shipping method
            </h2>
            <div className="border border-blue-600 rounded-md bg-blue-50/30 p-4 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-900">
                Standard
              </span>
              <span className="text-sm font-bold text-gray-900">FREE</span>
            </div>
          </section>

          {/* Payment Section */}
          <section>
            <h2 className="text-xl font-medium text-gray-900 mb-1">Payment</h2>
            <p className="text-sm text-gray-500 mb-4">
              All transactions are secure and encrypted.
            </p>

            <div className="border border-gray-300 rounded-md overflow-hidden bg-white">
              <div className="p-4 border-b border-gray-200 bg-blue-50/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    checked
                    readOnly
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    Razorpay Secure (UPI, Cards, Int'l Cards, Wallets)
                  </span>
                </div>
                <div className="flex gap-1">
                  {/* Placeholder for payment icons mapping to screenshot */}
                  <div className="h-6 w-8 bg-gray-200 rounded text-[9px] flex items-center justify-center font-bold">
                    UPI
                  </div>
                  <div className="h-6 w-8 bg-blue-800 text-white rounded text-[9px] flex items-center justify-center font-bold">
                    VISA
                  </div>
                </div>
              </div>
              <div className="p-6 bg-gray-50 flex flex-col items-center text-center justify-center text-sm text-gray-500">
                <ShieldCheck
                  size={48}
                  className="text-gray-300 mb-4"
                  strokeWidth={1}
                />
                <p>
                  You'll be redirected to Razorpay Secure (UPI, Cards, Int'l
                  Cards, Wallets) to complete your purchase.
                </p>
              </div>
            </div>

            <h3 className="text-lg font-medium text-gray-900 mt-8 mb-4">
              Billing address
            </h3>
            <div className="border border-gray-300 rounded-md bg-white overflow-hidden">
              <label className="flex items-center p-4 border-b border-gray-200 cursor-pointer bg-blue-50/20">
                <input
                  type="radio"
                  name="billing"
                  defaultChecked
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-600"
                />
                <span className="ml-3 text-sm font-medium text-gray-900">
                  Same as shipping address
                </span>
              </label>
              <label className="flex items-center p-4 cursor-pointer">
                <input
                  type="radio"
                  name="billing"
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-600"
                />
                <span className="ml-3 text-sm font-medium text-gray-900">
                  Use a different billing address
                </span>
              </label>
            </div>
          </section>

          {/* CTA */}
          <button
            onClick={handleCheckout}
            disabled={isLoading}
            className="w-full bg-[#0058a3] text-white py-4 rounded-md font-medium text-lg hover:bg-blue-800 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-4 shadow-sm">
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" /> Processing…
              </>
            ) : (
              "Pay now"
            )}
          </button>

          {/* Footer links */}
          <div className="border-t border-gray-200 pt-4 mt-8 flex gap-4 text-xs text-blue-600">
            <a href="#" className="hover:underline">
              Refund policy
            </a>
            <a href="#" className="hover:underline">
              Shipping
            </a>
            <a href="#" className="hover:underline">
              Privacy policy
            </a>
            <a href="#" className="hover:underline">
              Terms of service
            </a>
            <a href="#" className="hover:underline">
              Contact
            </a>
          </div>
        </div>
      </div>

      {/* ── RIGHT COLUMN: Order Summary (Sticky Desktop) ── */}
      <div className="hidden lg:block lg:w-[45%] xl:w-[40%] bg-[#f5f5f5] pt-8 pb-16 px-8 lg:pr-20 xl:pr-32 border-l border-gray-200">
        <div className="sticky top-8">
          {/* Item Row */}
          <div className="flex gap-4 mb-6 items-center">
            <div className="relative w-16 h-16 rounded-lg overflow-visible bg-white border border-gray-200 flex-shrink-0">
              <img
                src={normalizedItem.image}
                alt={normalizedItem.name}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = "/placeholder-image.jpg";
                }}
              />
              <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-[11px] w-5 h-5 rounded-full flex items-center justify-center font-medium shadow-sm ring-1 ring-white">
                {selectedQuantity}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm leading-snug truncate">
                {normalizedItem.name}
              </p>
              <p className="text-xs text-gray-500 mt-1">{selectedSize}</p>
            </div>
            <p className="text-sm font-medium text-gray-900">
              ₹
              {normalizedItem.totalPrice.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>

          {/* Discount Code */}
          <div className="flex gap-3 mb-6 pt-6 border-t border-gray-200">
            <input
              type="text"
              placeholder="Discount code or gift card"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              disabled={couponApplied || isLoading}
              className="flex-1 px-3 py-3 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 disabled:opacity-60"
            />
            <button
              onClick={couponApplied ? removeCoupon : applyCoupon}
              disabled={isLoading || (!couponCode && !couponApplied)}
              className={`px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                couponApplied
                  ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  : "bg-gray-200 text-gray-500 hover:bg-gray-300"
              }`}>
              {couponApplied ? "Remove" : "Apply"}
            </button>
          </div>

          {/* Totals */}
          <div className="space-y-3 pt-6 border-t border-gray-200 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-medium text-gray-900">
                ₹
                {pricing.subtotal.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="flex justify-between text-gray-600 items-center">
              <span className="flex items-center gap-1">
                Shipping <HelpCircle size={14} className="text-gray-400" />
              </span>
              <span className="text-gray-500">
                {pricing.deliveryFee === 0
                  ? "FREE"
                  : `₹${pricing.deliveryFee.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
              </span>
            </div>

            {couponDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>
                  −₹
                  {couponDiscount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-200">
              <span className="font-medium text-gray-900 text-base">Total</span>
              <div className="flex items-end gap-2">
                <span className="text-xs text-gray-500 mb-1">INR</span>
                <span className="text-xl font-semibold text-gray-900">
                  ₹
                  {pricing.totalPayable.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loadingMessage && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center border border-gray-100">
            <Loader2 size={32} className="animate-spin text-blue-600 mb-3" />
            <p className="font-medium text-gray-900">{loadingMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleItemCheckout;
