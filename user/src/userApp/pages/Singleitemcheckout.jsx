import { useMemo, useState, useEffect } from "react";
import { useAuth } from "../features/auth/context/UserContext";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useCheckout } from "../features/orders/hooks/useCheckout";

import { validateCartItems } from "../features/orders/services/checkoutService";
import {
  Loader2,
  ArrowLeft,
  ShieldCheck,
  Truck,
  Lock,
  Tag,
  CheckCircle2,
  MapPin,
  CreditCard,
  ChevronRight,
  ChevronDown,
  Edit2,
  AlertCircle,
} from "lucide-react";
import {
  EMPTY_ADDRESS_FORM,
  PAYMENT_GATEWAY,
} from "../features/orders/constants/appConstants";
const STORE_NAME = import.meta.env.VITE_STORE_NAME || "Premium Store";

/* ─── Step indicator ─────────────────────────────────────── */
const steps = ["Address", "Payment", "Review"];

const StepBar = ({ current }) => (
  <div className="flex items-center justify-center gap-0 mb-8">
    {steps.map((label, i) => {
      const done = i < current;
      const active = i === current;
      return (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                done
                  ? "bg-green-500 text-white"
                  : active
                    ? "bg-black text-white ring-4 ring-black/10"
                    : "bg-gray-100 text-gray-400"
              }`}>
              {done ? <CheckCircle2 size={16} /> : i + 1}
            </div>
            <span
              className={`mt-1 text-[10px] font-medium uppercase tracking-wider ${
                active
                  ? "text-black"
                  : done
                    ? "text-green-500"
                    : "text-gray-400"
              }`}>
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-16 sm:w-24 h-px mx-1 mb-5 transition-all duration-500 ${
                done ? "bg-green-400" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      );
    })}
  </div>
);

/* ─── Reusable input ──────────────────────────────────────── */
const InputField = ({
  label,
  name,
  type = "text",
  placeholder,
  maxLength,
  value,
  onChange,
  error,
  disabled = false,
}) => (
  <div className="w-full">
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder || label}
      maxLength={maxLength}
      disabled={disabled}
      className={`w-full px-4 py-3 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-black/10 disabled:opacity-50 disabled:cursor-not-allowed ${
        error
          ? "border-red-400 bg-red-50/40"
          : "border-gray-200 focus:border-black bg-white"
      }`}
    />
    {error && (
      <span className="text-red-500 text-[11px] mt-1 block font-medium">
        {error}
      </span>
    )}
  </div>
);

/* ─── Main Component ──────────────────────────────────────── */
const SingleItemCheckout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ── Checkout hook with all logic
  const {
    isLoading,
    error: checkoutError,
    loadingMessage,
    performCheckout,
    performAddressValidation,
  } = useCheckout();

  // ── Derive item from state
  const {
    items: stateItems,
    item: legacyItem,
    source = "web",
  } = location.state || {};
  const rawItem = stateItems?.[0] || legacyItem || null;

  // ── Variant & qty from URL
  const selectedSize =
    searchParams.get("variant") || rawItem?.selectedSize || "";
  const selectedQuantity = Number(searchParams.get("qty")) || 1;

  // ── Steps: 0 = Address, 1 = Payment, 2 = Review
  const [step, setStep] = useState(0);

  // ── Address form
  const [shippingAddress, setShippingAddress] = useState({
    ...EMPTY_ADDRESS_FORM,
    email: user?.email || "",
    fullName: user
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
      : "",
  });
  const [formErrors, setFormErrors] = useState({});

  // ── Payment
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_GATEWAY.RAZORPAY);

  // ── Coupon (for UI, not integrated with backend yet)
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  // ── Normalize item (matches ProductCard shapes)
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

  // ── Pricing (for display)
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
      discountPercent: totalMRP > 0 ? Math.round((itemDiscount / totalMRP) * 100) : 0,
    };
  }, [normalizedItem, couponDiscount]);

  // ── Guard: no item
  if (!rawItem || !selectedSize) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Nothing to checkout
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            Please select a product and size first.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 bg-black text-white rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors">
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

  // ── Address handlers
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "postalCode") {
      if (!/^\d*$/.test(value) || value.length > 6) return;
      if (value.length === 6) fetchPinForSingleCheckout(value);
    }

    setShippingAddress((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // ── Coupon handlers
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

  const removeCoupon = () => {
    setCouponCode("");
    setCouponApplied(false);
    setCouponDiscount(0);
  };

  // ── Place order (main handler)
  const handleCheckout = async () => {
    // ✅ Validate address
    const addressValidation = performAddressValidation(shippingAddress);
    if (!addressValidation.isValid) {
      setFormErrors(addressValidation.errors);
      return;
    }

    setFormErrors({});

    // ✅ Call useCheckout's performCheckout
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

  // ─── Mini order summary ───────
  const OrderSummaryCard = ({ compact = false }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {!compact && (
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/60">
          <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wider">
            Order Summary
          </h3>
        </div>
      )}
      <div className="p-5">
        {/* Item */}
        <div className="flex gap-3 mb-5">
          <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-[#F9F5F6] border border-gray-100 flex-shrink-0">
            <img
              src={normalizedItem.image}
              alt={normalizedItem.name}
              className="w-full h-full object-cover object-top"
              onError={(e) => {
                e.target.src = "/placeholder-image.jpg";
              }}
            />
            <span className="absolute -top-1.5 -right-1.5 bg-gray-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {selectedQuantity}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-xs leading-snug line-clamp-2">
              {normalizedItem.name}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              Size: {selectedSize}
            </p>
            <p className="text-sm font-bold text-gray-900 mt-1.5">
              ₹{normalizedItem.totalPrice.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Coupon */}
        <div className="mb-4 pt-4 border-t border-gray-100">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                disabled={couponApplied || isLoading}
                className="w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-black focus:border-black disabled:opacity-60"
              />
            </div>
            {!couponApplied ? (
              <button
                onClick={applyCoupon}
                disabled={isLoading}
                className="px-4 py-2.5 bg-black text-white text-xs font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors">
                Apply
              </button>
            ) : (
              <button
                onClick={removeCoupon}
                disabled={isLoading}
                className="px-4 py-2.5 bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors">
                Remove
              </button>
            )}
          </div>
          {couponApplied && (
            <p className="text-green-600 text-[11px] mt-1.5 font-medium flex items-center gap-1">
              <CheckCircle2 size={12} /> Coupon applied!
            </p>
          )}
        </div>

        {/* Breakdown */}
        <div className="space-y-2.5 text-xs pt-3 border-t border-gray-100">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span>₹{pricing.subtotal.toLocaleString("en-IN")}</span>
          </div>
          {pricing.itemDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>−₹{pricing.itemDiscount.toLocaleString("en-IN")}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-500">
            <span>Shipping</span>
            {pricing.deliveryFee === 0 ? (
              <span className="text-green-600 font-semibold">FREE</span>
            ) : (
              <span>₹{pricing.deliveryFee.toLocaleString("en-IN")}</span>
            )}
          </div>
          {couponDiscount > 0 && (
            <div className="flex justify-between text-green-600 bg-green-50 px-2 py-1.5 rounded-md -mx-1">
              <span>Coupon savings</span>
              <span>−₹{couponDiscount.toLocaleString("en-IN")}</span>
            </div>
          )}
          <div className="flex justify-between items-baseline pt-3 border-t border-gray-200">
            <div>
              <p className="font-bold text-gray-900 text-sm">Total</p>
              <p className="text-[10px] text-gray-400">Incl. all taxes</p>
            </div>
            <span className="text-lg font-bold text-gray-900">
              ₹{pricing.totalPayable.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── Address review chip ────────────
  const AddressChip = () => (
    <button
      onClick={() => setStep(0)}
      className="w-full flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-left hover:bg-green-100/60 transition-colors group mb-6">
      <MapPin size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-green-700 uppercase tracking-wider">
          Delivering to
        </p>
        <p className="text-sm font-medium text-gray-900 mt-0.5 truncate">
          {shippingAddress.fullName}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {shippingAddress.addressLine1}, {shippingAddress.city} –{" "}
          {shippingAddress.postalCode}
        </p>
      </div>
      <Edit2
        size={14}
        className="text-green-500 flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </button>
  );

  // ─── STEP 0: Address ──────────────────────────────────────
  const AddressStep = () => (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">
          Where should we deliver?
        </h2>
        <p className="text-sm text-gray-400">
          {user
            ? `Signed in as ${user.email}`
            : "No account needed — guest checkout"}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-4">
        {/* Contact */}
        <div className="pb-4 border-b border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Contact
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <InputField
              label="Email"
              name="email"
              type="email"
              placeholder="for order updates"
              value={shippingAddress.email}
              onChange={handleAddressChange}
              error={formErrors.email}
              disabled={isLoading}
            />
            <InputField
              label="Phone"
              name="phone"
              type="tel"
              maxLength="10"
              placeholder="10-digit number"
              value={shippingAddress.phone}
              onChange={handleAddressChange}
              error={formErrors.phone}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Name & address */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Delivery address
          </p>
          <div className="space-y-4">
            <InputField
              label="Full Name"
              name="fullName"
              placeholder="As on ID"
              value={shippingAddress.fullName}
              onChange={handleAddressChange}
              error={formErrors.fullName}
              disabled={isLoading}
            />

            <InputField
              label="Pincode"
              name="postalCode"
              maxLength="6"
              placeholder="6-digit pincode"
              value={shippingAddress.postalCode}
              onChange={handleAddressChange}
              error={formErrors.postalCode}
              disabled={isLoading}
            />

            <InputField
              label="Flat / House / Building"
              name="addressLine1"
              value={shippingAddress.addressLine1}
              onChange={handleAddressChange}
              error={formErrors.addressLine1}
              disabled={isLoading}
            />

            <InputField
              label="Area / Street / Sector"
              name="addressLine2"
              value={shippingAddress.addressLine2}
              onChange={handleAddressChange}
              error={formErrors.addressLine2}
              disabled={isLoading}
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <InputField
                label="City"
                name="city"
                value={shippingAddress.city}
                onChange={handleAddressChange}
                error={formErrors.city}
                disabled={isLoading}
              />
              <InputField
                label="State"
                name="state"
                value={shippingAddress.state}
                onChange={handleAddressChange}
                error={formErrors.state}
                disabled={isLoading}
              />
            </div>

            <InputField
              label="Landmark (optional)"
              name="landmark"
              placeholder="Near Apollo Hospital"
              value={shippingAddress.landmark}
              onChange={handleAddressChange}
              error={formErrors.landmark}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          if (performAddressValidation(shippingAddress).isValid) {
            setFormErrors({});
            setStep(1);
          } else {
            setFormErrors(
              performAddressValidation(shippingAddress).errors || {},
            );
          }
        }}
        disabled={isLoading}
        className="w-full bg-black text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-lg shadow-black/10">
        Continue to Payment <ChevronRight size={16} />
      </button>
    </div>
  );

  // ─── STEP 1: Payment ──────────────────────────────────────
  const PaymentStep = () => (
    <div className="space-y-5">
      <AddressChip />

      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Choose payment</h2>
        <p className="text-sm text-gray-400">
          All transactions are 256-bit SSL encrypted
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
        {[
          {
            value: PAYMENT_GATEWAY.RAZORPAY,
            title: "UPI / Cards / Netbanking",
            subtitle: "Pay securely via Razorpay",
            icon: <ShieldCheck size={18} />,
          },
          {
            value: PAYMENT_GATEWAY.COD,
            title: "Cash on Delivery",
            subtitle: "Pay when your order arrives",
            icon: <Truck size={18} />,
          },
        ].map((method) => (
          <label
            key={method.value}
            className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
              paymentMethod === method.value
                ? "border-black bg-black/[0.02] shadow-sm"
                : "border-gray-200 hover:border-gray-300"
            }`}>
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                paymentMethod === method.value
                  ? "border-black"
                  : "border-gray-300"
              }`}>
              {paymentMethod === method.value && (
                <div className="w-2.5 h-2.5 rounded-full bg-black" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                {method.title}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{method.subtitle}</p>
            </div>
            <span
              className={
                paymentMethod === method.value ? "text-black" : "text-gray-300"
              }>
              {method.icon}
            </span>
            <input
              type="radio"
              name="paymentMethod"
              value={method.value}
              checked={paymentMethod === method.value}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="sr-only"
              disabled={isLoading}
            />
          </label>
        ))}
      </div>

      <button
        onClick={() => setStep(2)}
        disabled={isLoading}
        className="w-full bg-black text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-lg shadow-black/10">
        Review Order <ChevronRight size={16} />
      </button>
    </div>
  );

  // ─── STEP 2: Review & place ────────────────────────────────
  const ReviewStep = () => (
    <div className="space-y-5">
      <AddressChip />

      {/* Payment summary chip */}
      <button
        onClick={() => setStep(1)}
        className="w-full flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl text-left hover:bg-blue-100/60 transition-colors group mb-1">
        <CreditCard size={16} className="text-blue-500 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
            Payment
          </p>
          <p className="text-sm font-medium text-gray-900">
            {paymentMethod === PAYMENT_GATEWAY.RAZORPAY
              ? "UPI / Card / Netbanking"
              : "Cash on Delivery"}
          </p>
        </div>
        <Edit2
          size={14}
          className="text-blue-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </button>

      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">
          Confirm your order
        </h2>
        <p className="text-sm text-gray-400">
          Please review everything before placing
        </p>
      </div>

      {/* Error Alert */}
      {checkoutError && (
        <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle
            size={20}
            className="text-red-600 flex-shrink-0 mt-0.5"
          />
          <div>
            <p className="text-red-800 text-sm font-medium">Error</p>
            <p className="text-red-700 text-sm mt-1">{checkoutError}</p>
          </div>
        </div>
      )}

      {/* Item review */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex gap-4">
          <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-[#F9F5F6] border border-gray-100 flex-shrink-0">
            <img
              src={normalizedItem.image}
              alt={normalizedItem.name}
              className="w-full h-full object-cover object-top"
              onError={(e) => {
                e.target.src = "/placeholder-image.jpg";
              }}
            />
            <span className="absolute -top-1.5 -right-1.5 bg-gray-600 text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow">
              {selectedQuantity}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 text-sm leading-snug">
              {normalizedItem.name}
            </h4>
            <p className="text-xs text-gray-400 mt-1">
              Size: {selectedSize} · Qty: {selectedQuantity}
            </p>
            {normalizedItem.mrp > normalizedItem.price && (
              <p className="text-xs text-gray-400 mt-0.5 line-through">
                MRP ₹{normalizedItem.mrp.toLocaleString("en-IN")}
              </p>
            )}
            <p className="text-sm font-bold text-gray-900 mt-1">
              ₹{normalizedItem.totalPrice.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Price breakdown */}
        <div className="mt-5 pt-4 border-t border-gray-100 space-y-2 text-xs">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span>₹{pricing.subtotal.toLocaleString("en-IN")}</span>
          </div>
          {pricing.itemDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Item discount</span>
              <span>−₹{pricing.itemDiscount.toLocaleString("en-IN")}</span>
            </div>
          )}
          {pricing.deliveryFee > 0 && (
            <div className="flex justify-between text-gray-500">
              <span>Shipping</span>
              <span>₹{pricing.deliveryFee.toLocaleString("en-IN")}</span>
            </div>
          )}
          {couponDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Coupon</span>
              <span>−₹{couponDiscount.toLocaleString("en-IN")}</span>
            </div>
          )}
          <div className="flex justify-between items-baseline pt-3 border-t border-gray-100">
            <span className="font-bold text-gray-900 text-sm">
              Total Payable
            </span>
            <span className="font-bold text-gray-900 text-base">
              ₹{pricing.totalPayable.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* Place order CTA */}
      <button
        onClick={handleCheckout}
        disabled={isLoading}
        className="w-full bg-black text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-gray-800 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/10">
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Processing…
          </>
        ) : (
          `Pay ₹${pricing.totalPayable.toLocaleString("en-IN")}`
        )}
      </button>

      {/* Trust strip */}
      <div className="flex items-center justify-center gap-8 py-2">
        <div className="flex flex-col items-center gap-1">
          <ShieldCheck size={20} className="text-gray-300" strokeWidth={1.5} />
          <span className="text-[10px] text-gray-400 uppercase font-medium">
            Secure
          </span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Lock size={20} className="text-gray-300" strokeWidth={1.5} />
          <span className="text-[10px] text-gray-400 uppercase font-medium">
            256-bit SSL
          </span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Truck size={20} className="text-gray-300" strokeWidth={1.5} />
          <span className="text-[10px] text-gray-400 uppercase font-medium">
            Fast Delivery
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F8F8] font-sans pb-10">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => (step === 0 ? navigate(-1) : setStep(step - 1))}
              disabled={isLoading}
              className="p-2 -ml-2 text-gray-500 hover:text-black hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-base font-bold tracking-tight text-gray-900">
              Checkout
            </h1>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400 text-xs font-medium">
            <Lock size={14} />
            <span className="hidden sm:inline">Secure Checkout</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Step bar */}
        <StepBar current={step} />

        <div className="grid lg:grid-cols-12 gap-8">
          {/* ── LEFT: Step content ── */}
          <div className="lg:col-span-7">
            {step === 0 && <AddressStep />}
            {step === 1 && <PaymentStep />}
            {step === 2 && <ReviewStep />}
          </div>

          {/* ── RIGHT: sticky order summary (desktop) ── */}
          <div className="hidden lg:block lg:col-span-5">
            <div className="sticky top-24">
              <OrderSummaryCard />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile order summary (collapsible) — shown on step 0 & 1 */}
      {step < 2 && (
        <div className="lg:hidden mx-4 mb-6 mt-2">
          <details className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <summary className="flex items-center justify-between px-5 py-3 cursor-pointer text-sm font-semibold text-gray-700 select-none">
              <span>
                Order summary · ₹{pricing.totalPayable.toLocaleString("en-IN")}
              </span>
              <ChevronDown size={16} className="text-gray-400" />
            </summary>
            <div className="border-t border-gray-100">
              <OrderSummaryCard compact />
            </div>
          </details>
        </div>
      )}

      {/* Full-screen loading overlay */}
      {loadingMessage && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-7 rounded-2xl shadow-2xl flex flex-col items-center max-w-xs text-center border border-gray-100">
            <Loader2 size={36} className="animate-spin text-black mb-4" />
            <p className="font-semibold text-gray-900">{loadingMessage}</p>
            <p className="text-xs text-gray-400 mt-2">
              Please don't refresh or close this page.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleItemCheckout;
