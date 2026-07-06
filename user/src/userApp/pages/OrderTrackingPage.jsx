import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/context/UserContext";
import { auth } from "../../config/firebaseAuth";
import { OrderService } from "../features/orders/services/api/orderService";
import {
  ArchiveBoxIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowLeftIcon,
  XCircleIcon,
  ArrowPathIcon,
  ShareIcon, // 👈 IMPORTED SHARE ICON
} from "@heroicons/react/24/outline";
import LoadingScreen from "../components/loading/LoadingScreen";

const STATUS_ICONS = {
  pending: <ClockIcon className="w-[18px] h-[18px]" />,
  confirmed: <CheckCircleIcon className="w-[18px] h-[18px]" />,
  processing: <ArrowPathIcon className="w-[18px] h-[18px]" />,
  shipped: <TruckIcon className="w-[18px] h-[18px]" />,
  out_for_delivery: <TruckIcon className="w-[18px] h-[18px]" />,
  delivered: <ArchiveBoxIcon className="w-[18px] h-[18px]" />,
  cancelled: <XCircleIcon className="w-[18px] h-[18px]" />,
};

const STATUS_COLORS = {
  pending: "text-amber-600",
  confirmed: "text-blue-600",
  processing: "text-indigo-600",
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

  // 👇 ADDED: Share Logic utilizing Web Share API
  const handleShareTracking = async () => {
    if (!orderData?.shareToken) {
      alert("Sharing is not available for this order.");
      return;
    }

    const shareUrl = `${window.location.origin}/track-shared/${orderData.shareToken}`;
    const shareData = {
      title: "Track my order!",
      text: "Hey, track my incoming order here:",
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

  // ── ERROR VIEW ──
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

  // ── TRACKING VIEW ──
  const currentStatus = orderData.orderStatus?.toLowerCase() || "pending";
  const statusIcon = STATUS_ICONS[currentStatus] || (
    <ClockIcon className="w-[18px] h-[18px]" />
  );
  const statusColor = STATUS_COLORS[currentStatus] || "text-gray-600";

  const orderDate = new Date(orderData.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
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
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-700 hover:text-gray-900">
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <span className="text-base font-semibold text-gray-900">
              Order Details
            </span>
          </div>

          {/* 👇 ADDED: Share Button UI */}
          {orderData.shareToken && (
            <button
              onClick={handleShareTracking}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-50 text-[#f43397] rounded-md hover:bg-pink-100 transition text-sm font-medium">
              <ShareIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-0 sm:px-4 pt-4 sm:pt-6 space-y-4">
        {/* TOP ORDER INFO CARD */}
        <div className="bg-white p-4 sm:rounded-md border-y sm:border border-gray-200 flex justify-between items-start">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">
              Order ID - {orderData._id}
            </p>
            <p className="text-sm font-medium text-gray-900">
              Placed on {orderDate}
            </p>
          </div>
          <div className="text-right">
            <span className="text-sm font-semibold text-gray-900">
              ₹{orderData.pricing?.totalAmount || 0}
            </span>
            <div
              className={`flex items-center gap-1 mt-1 justify-end ${statusColor}`}>
              {statusIcon}
              <span className="text-xs font-semibold capitalize">
                {currentStatus.replace(/_/g, " ")}
              </span>
            </div>
          </div>
        </div>

        {/* TIMELINE CARD */}
        {currentStatus !== "cancelled" ? (
          <div className="bg-white p-4 sm:rounded-md border-y sm:border border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2 mb-4">
              Tracking Info
            </h2>
            <div className="mb-6 px-1">
              <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-green-500 transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="relative pl-2">
              <div className="absolute top-2 bottom-2 left-[13px] w-0.5 bg-gray-200" />
              <div className="space-y-6">
                {orderData.statusHistory &&
                orderData.statusHistory.length > 0 ? (
                  [...orderData.statusHistory].reverse().map((entry, idx) => (
                    <div key={idx} className="relative flex gap-4">
                      <div
                        className={`w-2.5 h-2.5 rounded-full mt-1.5 z-10 ring-4 ring-white ${idx === 0 ? "bg-green-500" : "bg-gray-300"}`}
                      />
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium capitalize ${idx === 0 ? "text-gray-900" : "text-gray-600"}`}>
                          {entry.status.replace(/_/g, " ")}
                        </p>
                        {entry.note && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {entry.note}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
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
                    Tracking updates will appear here.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 p-4 sm:rounded-md border-y sm:border border-red-200 flex gap-3 items-start">
            <XCircleIcon className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-semibold text-red-800">
                Order Cancelled
              </h2>
              <p className="text-xs text-red-600 mt-1">
                This order has been cancelled. If you already paid, your refund
                will be initiated according to our policy.
              </p>
            </div>
          </div>
        )}

        {/* ITEMS CARD */}
        {orderData.items && orderData.items.length > 0 && (
          <div className="bg-white p-4 sm:rounded-md border-y sm:border border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2 mb-4">
              Item Details
            </h2>
            <div className="space-y-4">
              {orderData.items.map((item, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="w-16 h-16 bg-gray-100 rounded border border-gray-200 shrink-0 flex items-center justify-center overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ArchiveBoxIcon className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <p className="text-sm text-gray-900 font-medium line-clamp-1">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Qty: {item.quantity}{" "}
                      {item.variant?.size?.label
                        ? `| Size: ${item.variant.size.label}`
                        : ""}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      ₹{item.price * item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ADDRESS & PAYMENT INFO (Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orderData.shippingAddress && (
            <div className="bg-white p-4 sm:rounded-md border-y sm:border border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">
                Delivery Address
              </h2>
              <div className="text-xs text-gray-600 space-y-1">
                <p className="font-medium text-gray-900 text-sm">
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
                {orderData.shippingAddress.phone && (
                  <p className="pt-1">
                    Phone:{" "}
                    <span className="font-medium text-gray-900">
                      {orderData.shippingAddress.phone}
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="bg-white p-4 sm:rounded-md border-y sm:border border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              Order Summary
            </h2>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Total Product Price</span>
                <span>₹{orderData.pricing?.itemsTotal || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {orderData.pricing?.shippingFee === 0 ? (
                    <span className="text-green-600 font-medium">Free</span>
                  ) : (
                    `₹${orderData.pricing?.shippingFee || 0}`
                  )}
                </span>
              </div>
              {orderData.pricing?.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{orderData.pricing.discount}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 mt-2 border-t border-gray-100 text-sm font-semibold text-gray-900">
                <span>Order Total</span>
                <span>₹{orderData.pricing?.totalAmount || 0}</span>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">Payment Mode</span>
                <span className="text-xs font-semibold text-gray-900 uppercase">
                  {formatPaymentMethod(orderData.payment?.method)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
