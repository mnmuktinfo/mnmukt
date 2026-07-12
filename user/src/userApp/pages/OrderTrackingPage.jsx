import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/context/UserContext";
import { auth } from "../../config/firebaseConfig";
import { OrderService } from "../features/orders/services/api/orderService";
import {
  ArchiveBoxIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowLeftIcon,
  XCircleIcon,
  ArrowPathIcon,
  ShareIcon,
  ChatBubbleBottomCenterTextIcon,
} from "@heroicons/react/24/outline";
import LoadingScreen from "../components/loading/LoadingScreen";

const STATUS_ICONS = {
  pending: <ClockIcon className="w-[18px] h-[18px]" />,
  confirmed: <CheckCircleIcon className="w-[18px] h-[18px]" />,
  processing: <ArrowPathIcon className="w-[18px] h-[18px]" />,
  packed: <ArchiveBoxIcon className="w-[18px] h-[18px]" />,
  shipped: <TruckIcon className="w-[18px] h-[18px]" />,
  out_for_delivery: <TruckIcon className="w-[18px] h-[18px]" />,
  delivered: <CheckCircleIcon className="w-[18px] h-[18px]" />,
  cancelled: <XCircleIcon className="w-[18px] h-[18px]" />,
};

const STATUS_COLORS = {
  pending: "text-amber-600",
  confirmed: "text-blue-600",
  processing: "text-indigo-600",
  packed: "text-teal-600",
  shipped: "text-purple-600",
  out_for_delivery: "text-pink-600",
  delivered: "text-green-600",
  cancelled: "text-red-600",
};

const formatPaymentMethod = (method) => {
  if (!method) return "Online";
  const m = method.toLowerCase();
  if (m === "cod") return "Cash on Delivery";
  if (m === "razorpay") return "Razorpay (Online)";
  if (m === "whatsapp") return "WhatsApp Payment";
  if (m === "upi") return "UPI (GPay/PhonePe)";
  if (m === "stripe") return "Stripe (Card)";
  return m.replace(/_/g, " ");
};

const PaymentStatusBadge = ({ status }) => {
  if (!status) return null;
  const s = status.toLowerCase();
  if (s === "paid" || s === "success") {
    return (
      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
        Paid
      </span>
    );
  }
  if (s === "failed") {
    return (
      <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
        Failed
      </span>
    );
  }
  return (
    <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
      Pending
    </span>
  );
};

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user, authLoading } = useAuth();

  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    fetchOrderDetails();
  }, [authLoading, orderId, user]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      let token = null;
      if (user && auth.currentUser) {
        token = await auth.currentUser.getIdToken();
      }

      const data = await OrderService.getOrderById(orderId, token);
      setOrderData(data);
    } catch (err) {
      setError(err.message || "Failed to fetch order details.");
    } finally {
      setLoading(false);
    }
  };

  const handleShareTracking = async () => {
    if (!orderData?.shareToken) {
      alert("Sharing is not available for this order.");
      return;
    }

    const shareUrl = `${window.location.origin}/track-shared/${orderData.shareToken}`;
    const shareData = {
      title: "Track my order!",
      text: `Track my incoming order (#${orderData._id.slice(-6)}) here:`,
      url: shareUrl,
    };

    try {
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare(shareData)
      ) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert("Tracking link copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingScreen text="Locating your order..." />
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center font-sans">
        <XCircleIcon className="w-10 h-10 text-red-400 mb-3" />
        <h2 className="text-lg font-medium text-gray-900 mb-2">
          Order Not Found
        </h2>
        <p className="text-sm text-gray-600 mb-5 max-w-sm">
          {error || "We couldn't find an order with that ID."}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/")}
            className="px-5 py-2 border border-gray-300 bg-white text-gray-800 rounded-md text-sm font-medium hover:bg-gray-50">
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  const currentStatus = orderData.orderStatus?.toLowerCase() || "pending";
  const statusIcon = STATUS_ICONS[currentStatus] || (
    <ClockIcon className="w-[18px] h-[18px]" />
  );
  const statusColor = STATUS_COLORS[currentStatus] || "text-gray-600";

  const orderDate = new Date(orderData.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const statuses = [
    "pending",
    "confirmed",
    "processing",
    "packed",
    "shipped",
    "out_for_delivery",
    "delivered",
  ];

  const currentIndex = statuses.indexOf(currentStatus);
  const progressPercent =
    currentIndex === -1
      ? currentStatus === "cancelled"
        ? 100
        : 0
      : Math.max(
          0,
          Math.min(100, (currentIndex / (statuses.length - 1)) * 100),
        );

  return (
    <div className="min-h-screen bg-gray-100 font-sans pb-16 selection:bg-pink-200">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-700 hover:text-gray-900 bg-gray-50 p-1.5 rounded-full transition-colors">
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <span className="text-base font-bold text-gray-900 block leading-tight">
                Order Details
              </span>
              <span className="text-[11px] text-gray-500 font-medium">
                #{orderData._id}
              </span>
            </div>
          </div>

          {orderData.shareToken && (
            <button
              onClick={handleShareTracking}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-50 text-pink-600 rounded-md hover:bg-pink-100 transition text-sm font-medium border border-pink-100">
              <ShareIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-0 sm:px-4 pt-4 sm:pt-6 space-y-4">
        {/* TOP ORDER INFO CARD */}
        <div className="bg-white p-5 sm:rounded-xl border-y sm:border border-gray-200 flex justify-between items-center shadow-sm">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Placed on {orderDate.split(",")[0]}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Time: {orderDate.split(",")[1]?.trim() || orderDate}
            </p>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-gray-900 tracking-tight">
              ₹{orderData.pricing?.totalAmount || 0}
            </span>
            <div
              className={`flex items-center gap-1 mt-1 justify-end ${statusColor}`}>
              {statusIcon}
              <span className="text-xs font-bold uppercase tracking-wide">
                {currentStatus.replace(/_/g, " ")}
              </span>
            </div>
          </div>
        </div>

        {/* TIMELINE CARD */}
        {currentStatus !== "cancelled" ? (
          <div className="bg-white p-5 sm:rounded-xl border-y sm:border border-gray-200 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 mb-5 uppercase tracking-wide">
              Tracking Info
            </h2>
            <div className="mb-6 px-1">
              <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden inset-ring-1 inset-ring-gray-200">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="relative pl-2.5 mt-2">
              <div className="absolute top-3 bottom-3 left-[15px] w-0.5 bg-gray-100" />
              <div className="space-y-6">
                {orderData.statusHistory &&
                orderData.statusHistory.length > 0 ? (
                  [...orderData.statusHistory].reverse().map((entry, idx) => (
                    <div key={idx} className="relative flex gap-5 items-start">
                      <div
                        className={`w-3 h-3 rounded-full mt-1 z-10 ring-4 ring-white shadow-sm ${
                          idx === 0 ? "bg-green-500" : "bg-gray-300"
                        }`}
                      />
                      <div className="flex-1">
                        <p
                          className={`text-sm font-bold capitalize ${idx === 0 ? "text-gray-900" : "text-gray-500"}`}>
                          {entry.status.replace(/_/g, " ")}
                        </p>
                        {entry.note && (
                          <p className="text-xs text-gray-600 mt-1 bg-gray-50 p-2 rounded-md border border-gray-100 inline-block">
                            {entry.note}
                          </p>
                        )}
                        <p className="text-[11px] font-medium text-gray-400 mt-1.5 uppercase tracking-wider">
                          {new Date(entry.changedAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 py-2">
                    Tracking updates will appear here soon.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 p-5 sm:rounded-xl border-y sm:border border-red-200 flex gap-4 items-start shadow-sm">
            <XCircleIcon className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-bold text-red-800 uppercase tracking-wide">
                Order Cancelled
              </h2>
              <p className="text-xs text-red-600 mt-1.5 leading-relaxed">
                This order has been cancelled. If you already paid online, your
                refund will be initiated according to our refund policy.
              </p>
            </div>
          </div>
        )}

        {/* ITEMS CARD */}
        {orderData.items && orderData.items.length > 0 && (
          <div className="bg-white p-5 sm:rounded-xl border-y sm:border border-gray-200 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4 uppercase tracking-wide">
              Item Details
            </h2>
            <div className="space-y-4">
              {orderData.items.map((item, idx) => {
                const size =
                  typeof item.variant?.size === "object"
                    ? item.variant.size.label || item.variant.size.name
                    : item.variant?.size;
                const color = item.variant?.color;

                return (
                  <div key={idx} className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-50 rounded-lg border border-gray-200 shrink-0 flex items-center justify-center overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ArchiveBoxIcon className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <p className="text-sm text-gray-900 font-semibold leading-snug line-clamp-2">
                        {item.name}
                      </p>

                      {/* Attributes (Size & Color) */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-gray-600">
                        <span className="font-medium bg-gray-100 px-1.5 py-0.5 rounded">
                          Qty: {item.quantity}
                        </span>
                        {size && size !== "onesize" && (
                          <span className="text-gray-500">
                            Size:{" "}
                            <span className="font-medium text-gray-800">
                              {size}
                            </span>
                          </span>
                        )}
                        {color && (
                          <span className="text-gray-500 flex items-center gap-1">
                            Color:{" "}
                            <span className="font-medium text-gray-800">
                              {typeof color === "object" ? color.name : color}
                            </span>
                            {typeof color === "object" && color.hex && (
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-gray-300 shadow-sm"
                                style={{ backgroundColor: color.hex }}
                              />
                            )}
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-bold text-gray-900 mt-2">
                        ₹{item.price * item.quantity}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CUSTOMER NOTES (If present) */}
        {orderData.notes && (
          <div className="bg-yellow-50 p-4 sm:rounded-xl border-y sm:border border-yellow-200 flex gap-3 shadow-sm">
            <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-yellow-600 shrink-0" />
            <div>
              <h3 className="text-xs font-bold text-yellow-800 uppercase tracking-wide">
                Customer Note
              </h3>
              <p className="text-sm text-yellow-900 mt-1 italic">
                "{orderData.notes}"
              </p>
            </div>
          </div>
        )}

        {/* ADDRESS & PAYMENT INFO (Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
          {orderData.shippingAddress && (
            <div className="bg-white p-5 sm:rounded-xl border-y sm:border border-gray-200 shadow-sm">
              <h2 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide border-b border-gray-100 pb-2">
                Delivery Address
              </h2>
              <div className="text-sm text-gray-600 space-y-1.5">
                <p className="font-bold text-gray-900">
                  {orderData.shippingAddress.fullName}
                </p>
                {orderData.shippingAddress.addressLine1 && (
                  <p>{orderData.shippingAddress.addressLine1}</p>
                )}
                {orderData.shippingAddress.addressLine2 && (
                  <p>{orderData.shippingAddress.addressLine2}</p>
                )}
                <p>
                  {[
                    orderData.shippingAddress.city,
                    orderData.shippingAddress.state,
                    orderData.shippingAddress.postalCode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>

                {/* Contact Info */}
                <div className="pt-2 mt-2 border-t border-gray-50 space-y-1">
                  {orderData.shippingAddress.phone && (
                    <p className="text-xs text-gray-500">
                      Phone:{" "}
                      <span className="font-medium text-gray-800">
                        {orderData.shippingAddress.phone}
                      </span>
                    </p>
                  )}
                  {orderData.guestInfo?.email && (
                    <p className="text-xs text-gray-500">
                      Email:{" "}
                      <span className="font-medium text-gray-800">
                        {orderData.guestInfo.email}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="bg-white p-5 sm:rounded-xl border-y sm:border border-gray-200 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide border-b border-gray-100 pb-2">
              Order Summary
            </h2>
            <div className="space-y-2.5 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Items Total</span>
                <span className="font-medium">
                  ₹{orderData.pricing?.itemsTotal || 0}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span>
                  {orderData.pricing?.shippingFee === 0 ? (
                    <span className="text-green-600 font-bold uppercase text-xs tracking-wider bg-green-50 px-2 py-0.5 rounded">
                      Free
                    </span>
                  ) : (
                    <span className="font-medium">
                      ₹{orderData.pricing?.shippingFee || 0}
                    </span>
                  )}
                </span>
              </div>

              {orderData.pricing?.tax > 0 && (
                <div className="flex justify-between">
                  <span>Estimated Tax</span>
                  <span className="font-medium">₹{orderData.pricing.tax}</span>
                </div>
              )}

              {orderData.pricing?.codFee > 0 && (
                <div className="flex justify-between">
                  <span>COD Charges</span>
                  <span className="font-medium">
                    ₹{orderData.pricing.codFee}
                  </span>
                </div>
              )}

              {orderData.pricing?.discount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Discount</span>
                  <span>-₹{orderData.pricing.discount}</span>
                </div>
              )}

              <div className="flex justify-between pt-3 mt-3 border-t border-gray-100 text-base font-bold text-gray-900">
                <span>Total Amount</span>
                <span>₹{orderData.pricing?.totalAmount || 0}</span>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    Payment Mode
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {formatPaymentMethod(orderData.payment?.method)}
                  </span>
                </div>
                <PaymentStatusBadge status={orderData.payment?.status} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
