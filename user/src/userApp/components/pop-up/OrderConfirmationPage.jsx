import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ChevronRight, CreditCard, MapPin, Package } from "lucide-react";
import { orderService } from "../../features/orders/services/orderService";

const WHATSAPP_NUMBER = "8392856993";
const STATUS_STEPS = ["placed", "confirmed", "packed", "shipped", "delivered"];
const STATUS_LABELS = {
  placed: "Placed",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

// FIX 4: Keys are now lowercase to match what orderService stores (paymentMethod: "cod")
const PAYMENT_METHOD_LABELS = {
  cod: "Cash on Delivery",
  whatsapp: "WhatsApp Payment",
  razorpay: "Online Payment",
  upi: "UPI Payment",
  online: "Online Payment",
};

const PAYMENT_STATUS_STYLE = {
  pending: "text-yellow-600",
  paid: "text-green-600",
  failed: "text-red-600",
};

const SectionDivider = () => <div className="h-[0.5px] w-full bg-gray-200" />;

const OrderConfirmationPage = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const location = useLocation();
  const [orderData, setOrderData] = useState(
    () => location.state?.orderData ?? null,
  );
  const [loading, setLoading] = useState(!location.state?.orderData);
  const fetchedRef = useRef(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (fetchedRef.current || orderData || !orderId) {
      setLoading(false);
      return;
    }
    fetchedRef.current = true;

    const fetchOrder = async () => {
      try {
        const details = await orderService.getOrderDetails(orderId);
        setOrderData(details);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, orderData]);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        Loading...
      </div>
    );
  if (!orderData)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Order not found
      </div>
    );

  const orderStatus = orderData.orderStatus ?? "placed";
  const address = orderData.addressSnapshot ?? {};
  const pricing = orderData.pricing ?? {};

  // FIX 1: Read paymentMethod and paymentStatus as flat root fields —
  // orderService never writes a nested payment:{} object to the root doc.
  const paymentMethod = orderData.paymentMethod ?? "";
  const paymentStatus = orderData.paymentStatus ?? "pending";

  const items = orderData.items ?? [];
  const displayOrderId =
    orderData.orderId ?? orderId?.slice(0, 10).toUpperCase();

  // FIX 3: Match service key priority — service writes pricing.totalPayable first,
  // then falls back to pricing.totalAmount, then root totalAmount.
  const totalAmount = Number(
    pricing?.totalPayable ?? pricing?.totalAmount ?? orderData.totalAmount ?? 0,
  ).toLocaleString("en-IN");

  // FIX 5: Strip any existing country prefix before prepending +91
  const cleanPhone = address.phone?.replace(/^(\+91|91|0)/, "") ?? "";

  const handleConfirmOnWhatsApp = () => {
    const message = encodeURIComponent(
      `Hello, I placed an order.\n\nOrder ID: ${displayOrderId}\nAmount: ₹${totalAmount}\n\nPlease confirm my order.`,
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  const displayedItems = items.slice(0, 2);
  const moreItems = items.length - 2;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center font-sans py-4">
      <div className="w-full max-w-[480px] bg-white rounded-lg overflow-hidden shadow-sm">
        {/* Header */}
        <div className="bg-[#e6f8f3] p-4 flex items-center gap-3 border-b border-[#c2eee2]">
          <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm">
            <img src="/confirm.svg" alt="Success" className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-base font-bold text-[#027a61] uppercase">
              Order Successful
            </h1>
            <p className="text-xs text-[#027a61]">
              Order ID: <span className="font-semibold">{displayOrderId}</span>
            </p>
          </div>
        </div>

        {/* Order Progress — FIX 4 (connector line): use a relative wrapper +
            absolute underlay bar so the fill is pixel-accurate on all screen sizes */}
        {orderStatus !== "cancelled" && (
          <div className="px-4 py-3 bg-white">
            <div className="relative flex justify-between items-start">
              {/* Full background track */}
              <div className="absolute top-[5px] left-0 right-0 h-[2px] bg-gray-200 z-0" />

              {/* Filled progress track */}
              <div
                className="absolute top-[5px] left-0 h-[2px] bg-[#03a685] z-0 transition-all duration-500"
                style={{
                  width: `${
                    (STATUS_STEPS.indexOf(orderStatus) /
                      (STATUS_STEPS.length - 1)) *
                    100
                  }%`,
                }}
              />

              {STATUS_STEPS.map((s, i) => {
                const done = i <= STATUS_STEPS.indexOf(orderStatus);
                return (
                  <div
                    key={s}
                    className="relative z-10 flex flex-col items-center"
                    style={{ width: `${100 / STATUS_STEPS.length}%` }}>
                    <div
                      className={`w-3 h-3 rounded-full border-2 ${
                        done
                          ? "bg-[#03a685] border-[#03a685]"
                          : "bg-white border-gray-300"
                      }`}
                    />
                    <span
                      className={`text-[9px] mt-1 text-center leading-tight ${
                        done ? "text-gray-800 font-medium" : "text-gray-400"
                      }`}>
                      {STATUS_LABELS[s]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <SectionDivider />

        {/* Items List */}
        <div className="p-3 bg-white">
          {displayedItems.map((item, idx) => (
            <div
              key={idx}
              className="flex gap-2 p-2 border border-gray-100 rounded-sm bg-gray-50 mb-2">
              <div className="w-16 h-20 bg-gray-100 rounded-sm flex-shrink-0 overflow-hidden">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package size={20} className="text-gray-300 m-auto mt-6" />
                )}
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <h4 className="text-sm font-semibold text-gray-800 line-clamp-2">
                  {item.name}
                </h4>
                <p className="text-[12px] text-gray-600 mt-1">
                  {item.selectedSize && (
                    <>
                      Size:{" "}
                      <span className="font-medium">{item.selectedSize}</span>
                    </>
                  )}
                  {/* FIX 2: Service normalises quantity to item.quantity, not item.selectedQuantity */}
                  {item.selectedSize &&
                    (item.quantity ?? item.selectedQuantity) && (
                      <span className="mx-1">|</span>
                    )}
                  {(item.quantity ?? item.selectedQuantity) && (
                    <>
                      Qty:{" "}
                      <span className="font-medium">
                        {item.quantity ?? item.selectedQuantity}
                      </span>
                    </>
                  )}
                </p>
                <p className="text-[12px] font-semibold text-gray-800 mt-1">
                  ₹{item.price?.toLocaleString("en-IN") ?? "0"}
                </p>
              </div>
            </div>
          ))}
          {moreItems > 0 && (
            <p className="text-[12px] text-[#f43397] font-semibold">
              +{moreItems} more item(s)
            </p>
          )}
        </div>

        <SectionDivider />

        {/* Address */}
        <div
          className="p-3 bg-white flex items-start justify-between cursor-pointer active:bg-gray-50"
          onClick={() => navigate("/user/orders")}>
          <div className="flex gap-2 pr-2">
            <MapPin size={18} className="text-gray-600 shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                Delivery Address
              </p>
              <p className="text-sm font-semibold text-gray-800">
                {address.name}
              </p>
              <p className="text-[12px] text-gray-600 mt-0.5">
                {[address.line1, address.city, address.state]
                  .filter(Boolean)
                  .join(", ")}{" "}
                {address.pincode && (
                  <>
                    – <span className="font-semibold">{address.pincode}</span>
                  </>
                )}
              </p>
              {/* FIX 5: cleanPhone strips any existing +91/91/0 prefix */}
              {cleanPhone && (
                <p className="text-[12px] text-gray-800 font-medium mt-0.5">
                  +91 {cleanPhone}
                </p>
              )}
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-400 mt-1 shrink-0" />
        </div>

        <SectionDivider />

        {/* Payment Mode + Price Breakdown — single unified section */}
        <div className="p-3 bg-white">
          {/* ── Payment mode row ── */}
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
            Payment Details
          </p>
          <div className="flex items-center gap-2 mb-3">
            <CreditCard size={18} className="text-gray-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {PAYMENT_METHOD_LABELS[paymentMethod?.toLowerCase()] ??
                  paymentMethod ??
                  "—"}
              </p>
              <p
                className={`text-[11px] font-medium ${PAYMENT_STATUS_STYLE[paymentStatus] ?? "text-gray-500"}`}>
                {paymentStatus === "pending" && "Payment Pending"}
                {paymentStatus === "paid" && "Payment Completed"}
                {paymentStatus === "failed" && "Payment Failed"}
              </p>
            </div>
          </div>

          {/* ── Thin divider between mode and breakdown ── */}
          <div className="h-[0.5px] bg-gray-100 mb-3" />

          {/* ── Price rows ── */}
          <div className="flex flex-col gap-2.5">
            {/* Subtotal */}
            {(pricing.subtotal ?? pricing.totalMRP) != null && (
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-gray-500">
                  Subtotal ({items.length} item{items.length !== 1 ? "s" : ""})
                </span>
                <span className="text-[12px] text-gray-700">
                  ₹
                  {Number(pricing.subtotal ?? pricing.totalMRP).toLocaleString(
                    "en-IN",
                  )}
                </span>
              </div>
            )}

            {/* Delivery fee */}
            {(() => {
              const fee =
                pricing.deliveryCharge ??
                pricing.deliveryFee ??
                pricing.shippingFee;
              if (fee == null) return null;
              return (
                <div className="flex justify-between items-center">
                  <span className="text-[12px] text-gray-500">
                    Delivery Fee
                  </span>
                  {Number(fee) === 0 ? (
                    <span className="text-[12px] font-semibold text-green-600">
                      FREE
                    </span>
                  ) : (
                    <span className="text-[12px] text-gray-700">
                      ₹{Number(fee).toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
              );
            })()}

            {/* Discount */}
            {pricing.discount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-gray-500">Discount</span>
                <span className="text-[12px] font-semibold text-green-600">
                  − ₹{Number(pricing.discount).toLocaleString("en-IN")}
                </span>
              </div>
            )}

            {/* Coupon discount */}
            {pricing.couponDiscount > 0 && (
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] text-gray-500">
                    Coupon Discount
                  </span>
                  {pricing.couponCode && (
                    <span className="text-[10px] font-bold text-[#f43397] bg-pink-50 px-1.5 py-0.5 rounded">
                      {pricing.couponCode}
                    </span>
                  )}
                </div>
                <span className="text-[12px] font-semibold text-green-600">
                  − ₹{Number(pricing.couponDiscount).toLocaleString("en-IN")}
                </span>
              </div>
            )}

            {/* Platform fee */}
            {pricing.platformFee > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-gray-500">Platform Fee</span>
                <span className="text-[12px] text-gray-700">
                  ₹{Number(pricing.platformFee).toLocaleString("en-IN")}
                </span>
              </div>
            )}

            {/* GST / Tax */}
            {pricing.gstAmount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-gray-500">
                  GST{pricing.gstPercent ? ` (${pricing.gstPercent}%)` : ""}
                </span>
                <span className="text-[12px] text-gray-700">
                  ₹{Number(pricing.gstAmount).toLocaleString("en-IN")}
                </span>
              </div>
            )}

            {/* Total row */}
            <div className="h-[0.5px] bg-gray-200 mt-0.5" />
            <div className="flex justify-between items-center">
              <span className="text-[13px] font-bold text-gray-900">
                Total Amount
              </span>
              <span className="text-[14px] font-extrabold text-[#f43397]">
                ₹{totalAmount}
              </span>
            </div>

            {/* Savings callout */}
            {(() => {
              const saved =
                (pricing.discount ?? 0) + (pricing.couponDiscount ?? 0);
              if (saved <= 0) return null;
              return (
                <div className="bg-green-50 border border-green-100 rounded px-2.5 py-1.5">
                  <span className="text-[11px] font-semibold text-green-700">
                    🎉 You saved ₹{Number(saved).toLocaleString("en-IN")} on
                    this order!
                  </span>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Buttons */}
        <div className="sticky bottom-0 left-0 w-full bg-white p-3 border-t border-gray-200 flex flex-col gap-2">
          <button
            onClick={handleConfirmOnWhatsApp}
            className="w-full bg-[#f43397] text-white py-2.5 font-bold uppercase text-[13px] rounded-md">
            Confirm on WhatsApp
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full border border-gray-300 text-gray-600 py-2 font-bold uppercase text-[13px] rounded-md">
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
