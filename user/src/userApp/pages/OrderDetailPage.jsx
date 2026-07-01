import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { orderService } from "../features/orders/services/orderService";
import { formatDate } from "../features/orders/utils/orders";

// Heroicons (Outline & Solid)
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  MapPinIcon,
  TruckIcon,
  QuestionMarkCircleIcon,
  StarIcon,
  ArrowPathIcon,
  ClipboardDocumentIcon,
  PhoneIcon,
  CheckCircleIcon as CheckCircleOutline,
  XCircleIcon as XCircleOutline,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon as CheckCircleSolid,
  XCircleIcon as XCircleSolid,
} from "@heroicons/react/24/solid";

/* ─────────────────────────────────────
   HELPERS
───────────────────────────────────── */
const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n ?? 0);

const formatPaymentMethod = (method) => {
  if (!method) return "Online Payment";
  const m = method.toLowerCase();
  if (m === "cod") return "Cash on Delivery";
  if (m === "razorpay") return "Razorpay (Online)";
  if (m === "whatsapp") return "WhatsApp Payment";
  if (m === "upi") return "UPI";
  return m.replace(/_/g, " ");
};

/* ─────────────────────────────────────
   TRACKING STEPS CONFIG
───────────────────────────────────── */
const STEPS = ["placed", "processing", "shipped", "delivered"];
const STEP_LABELS = {
  placed: "Order Placed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
};

const stepIdx = (status) => {
  const s = status?.toLowerCase();
  if (s === "cancelled") return -1;
  const i = STEPS.indexOf(s);
  return i === -1 ? 0 : i;
};

/* ─────────────────────────────────────
   TRACKING PROGRESS BAR
───────────────────────────────────── */
const TrackingBar = ({ status }) => {
  const currentStatus = status?.toLowerCase() || "placed";
  const isCancelled = currentStatus === "cancelled";
  const current = stepIdx(currentStatus);
  const fillPct = isCancelled
    ? 100
    : Math.max(5, Math.round((current / (STEPS.length - 1)) * 100));

  if (isCancelled) {
    return (
      <div className="mt-4 bg-red-50 p-4 rounded-md border border-red-100 flex items-start gap-3">
        <XCircleSolid className="w-6 h-6 text-red-500 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-red-700">Order Cancelled</p>
          <p className="text-xs text-red-600 mt-1">
            This order has been cancelled. Any paid amount will be refunded as
            per policy.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 mb-2">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-gray-900">
          Status:{" "}
          <span className="text-[#f43397]">
            {STEP_LABELS[currentStatus] || currentStatus}
          </span>
        </p>
      </div>

      <div className="relative px-2">
        {/* Background Bar */}
        <div className="absolute top-2.5 left-2 right-2 h-1 bg-gray-200 rounded-full" />
        {/* Fill Bar */}
        <div
          className="absolute top-2.5 left-2 h-1 bg-green-500 rounded-full transition-all duration-700"
          style={{ width: `calc(${fillPct}% - 16px)` }}
        />

        {/* Nodes */}
        <div className="relative flex justify-between">
          {STEPS.map((step, i) => {
            const isCompleted = i <= current;
            const isActive = i === current;
            return (
              <div key={step} className="flex flex-col items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border-2 bg-white z-10 transition-colors ${
                    isCompleted ? "border-green-500" : "border-gray-300"
                  }`}>
                  {isCompleted && (
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                  )}
                </div>
                <span
                  className={`text-[10px] sm:text-xs font-medium text-center ${
                    isActive ? "text-gray-900 font-bold" : "text-gray-500"
                  }`}>
                  {STEP_LABELS[step]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────
   ITEM CARD
───────────────────────────────────── */
const ItemCard = ({ item, orderStatus }) => {
  const isDelivered = orderStatus?.toLowerCase() === "delivered";
  const isCancelled = orderStatus?.toLowerCase() === "cancelled";

  return (
    <div className="p-4 border-b border-gray-100 last:border-0 flex flex-col sm:flex-row gap-4">
      {/* Product Image */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded border border-gray-200 shrink-0 overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <DocumentTextIcon className="w-8 h-8 text-gray-300" />
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
          {item.name}
        </h3>
        <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-500">
          {item.selectedSize && (
            <span>
              Size:{" "}
              <span className="font-medium text-gray-800">
                {item.selectedSize}
              </span>
            </span>
          )}
          <span>
            Qty:{" "}
            <span className="font-medium text-gray-800">
              {item.quantity || 1}
            </span>
          </span>
        </div>
        <p className="text-base font-semibold text-gray-900 mt-2">
          {fmt(item.price)}
        </p>

        {/* Item Actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          {isDelivered && (
            <>
              <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded hover:bg-gray-100">
                <ArrowPathIcon className="w-4 h-4" /> Return / Exchange
              </button>
              <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#f43397] bg-pink-50 border border-pink-200 rounded hover:bg-pink-100">
                <StarIcon className="w-4 h-4" /> Rate Product
              </button>
            </>
          )}
          {!isDelivered && !isCancelled && (
            <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100">
              <XCircleOutline className="w-4 h-4" /> Cancel Item
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────
   ORDER SUMMARY CARD
───────────────────────────────────── */
const OrderSummary = ({ pricing, total }) => {
  const p = pricing || {};

  return (
    <div className="bg-white rounded-md border border-gray-200 p-4">
      <h2 className="text-sm font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">
        Price Details
      </h2>
      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Total Product Price</span>
          <span>{fmt(p.subtotal ?? p.totalMRP)}</span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>Shipping Charges</span>
          <span
            className={
              (p.shippingCharge ?? p.deliveryFee) === 0
                ? "text-green-600 font-medium"
                : ""
            }>
            {(p.shippingCharge ?? p.deliveryFee) === 0
              ? "Free"
              : fmt(p.shippingCharge ?? p.deliveryFee)}
          </span>
        </div>

        {(p.itemDiscount > 0 || p.discount > 0) && (
          <div className="flex justify-between text-green-600 font-medium">
            <span>Special Discount</span>
            <span>− {fmt(p.itemDiscount ?? p.discount)}</span>
          </div>
        )}

        {p.couponDiscount > 0 && (
          <div className="flex justify-between text-green-600 font-medium">
            <span>Coupon Applied</span>
            <span>− {fmt(p.couponDiscount)}</span>
          </div>
        )}

        {(p.taxAmount > 0 || p.gstAmount > 0) && (
          <div className="flex justify-between text-gray-600">
            <span>Estimated Tax</span>
            <span>{fmt(p.taxAmount ?? p.gstAmount)}</span>
          </div>
        )}

        <div className="flex justify-between text-base font-bold text-gray-900 pt-3 border-t border-gray-100 mt-2">
          <span>Order Total</span>
          <span>{fmt(total)}</span>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────
   SKELETON
───────────────────────────────────── */
const PageSkeleton = () => (
  <div className="max-w-3xl mx-auto px-4 pt-6 space-y-4">
    <div className="h-20 bg-gray-200 rounded-md animate-pulse" />
    <div className="h-40 bg-gray-200 rounded-md animate-pulse" />
    <div className="flex gap-4">
      <div className="h-32 flex-1 bg-gray-200 rounded-md animate-pulse" />
      <div className="h-32 flex-1 bg-gray-200 rounded-md animate-pulse" />
    </div>
    <div className="h-48 bg-gray-200 rounded-md animate-pulse" />
  </div>
);

/* ─────────────────────────────────────
   MAIN PAGE
───────────────────────────────────── */
const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const {
    data: order,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderService.getOrderDetails(orderId),
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000,
  });

  const handleCopyOrderId = (id) => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        <nav className="h-14 bg-white border-b border-gray-200" />
        <PageSkeleton />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center font-sans p-4">
        <QuestionMarkCircleIcon className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-gray-900 font-semibold text-lg mb-4">
          Order not found
        </p>
        <button
          onClick={() => navigate("/orders")}
          className="px-6 py-2.5 bg-[#f43397] text-white text-sm font-medium rounded hover:bg-[#e02b88] transition-colors">
          Back to Orders
        </button>
      </div>
    );
  }

  const items = order.items ?? [];
  const address = order.shippingAddress || order.addressSnapshot;
  const totalAmount = order.pricing?.total ?? order.totalAmount ?? 0;
  const displayOrderId = order.orderId ?? order.id;

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-24">
      {/* TOP NAV */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1 -ml-1 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <h1 className="text-base font-semibold text-gray-900">
            Order Details
          </h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 pt-4 sm:pt-6 space-y-4">
        {/* HEADER INFO CARD */}
        <div className="bg-white rounded-md border border-gray-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-gray-500">Order ID:</span>
              <span className="text-sm font-semibold text-gray-900">
                {displayOrderId}
              </span>
              <button
                onClick={() => handleCopyOrderId(displayOrderId)}
                className="text-gray-400 hover:text-[#f43397] transition-colors relative"
                title="Copy Order ID">
                <ClipboardDocumentIcon className="w-4 h-4" />
                {copied && (
                  <span className="absolute -top-8 -left-4 bg-gray-800 text-white text-[10px] px-2 py-1 rounded shadow">
                    Copied!
                  </span>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>

          <button className="flex items-center justify-center gap-1.5 px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 bg-white rounded hover:bg-gray-50 transition-colors w-full sm:w-auto">
            <DocumentTextIcon className="w-4 h-4 text-gray-500" />
            Download Invoice
          </button>
        </div>

        {/* TRACKING & ITEMS CARD */}
        <div className="bg-white rounded-md border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">
              Delivery Status
            </h2>
            <TrackingBar status={order.orderStatus} />
          </div>

          <div>
            {items.length > 0 ? (
              items.map((item, i) => (
                <ItemCard
                  key={item.id ?? i}
                  item={item}
                  orderStatus={order.orderStatus}
                />
              ))
            ) : (
              <div className="py-10 text-center text-sm text-gray-500">
                No items found in this order.
              </div>
            )}
          </div>
        </div>

        {/* DETAILS GRID (Address + Payment) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Shipping Address */}
          <div className="bg-white rounded-md border border-gray-200 p-4 flex flex-col">
            <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2 border-b border-gray-100 pb-2">
              <MapPinIcon className="w-4 h-4 text-gray-500" /> Delivery Address
            </h2>
            {address ? (
              <div className="text-sm text-gray-700 space-y-1 mt-1">
                <p className="font-medium text-gray-900">
                  {address.fullName || address.name}
                </p>
                {address.addressLine1 && <p>{address.addressLine1}</p>}
                <p>
                  {[
                    address.city,
                    address.state,
                    address.postalCode || address.pincode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                {address.phone && (
                  <p className="pt-2 font-medium">Phone: {address.phone}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No address on file</p>
            )}
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-md border border-gray-200 p-4 flex flex-col">
            <h2 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-2">
              Payment Details
            </h2>
            <div className="mt-1 space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Method</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatPaymentMethod(order.payment?.method)}
                </p>
              </div>
              {order.payment?.status && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Status</p>
                  <div className="flex items-center gap-1.5">
                    {order.payment.status.toLowerCase() === "completed" ||
                    order.payment.status.toLowerCase() === "success" ? (
                      <CheckCircleSolid className="w-4 h-4 text-green-500" />
                    ) : (
                      <div className="w-2 h-2 bg-amber-500 rounded-full ml-1" />
                    )}
                    <p className="text-sm font-medium capitalize text-gray-900">
                      {order.payment.status}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ORDER SUMMARY */}
        <OrderSummary pricing={order.pricing} total={totalAmount} />

        {/* SUPPORT FOOTER */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm font-semibold text-gray-900 mb-4 px-2">
            Need help with your order?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={`mailto:support@store.com?subject=Help with Order ${displayOrderId}`}
              className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded hover:border-gray-300 transition-colors">
              <PhoneIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Contact Support
                </p>
                <p className="text-xs text-gray-500">Reach out to our team</p>
              </div>
            </a>
            <a
              href="/support/returns"
              className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded hover:border-gray-300 transition-colors">
              <ArrowPathIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Return Policy
                </p>
                <p className="text-xs text-gray-500">
                  Learn about easy returns
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
