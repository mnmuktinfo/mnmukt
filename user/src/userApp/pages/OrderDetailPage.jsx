/**
 * OrderDetailPage.jsx — MNMUKT
 *
 * Design: Editorial minimal — inspired by reference screenshot
 *   • Big left-aligned "Order Details" heading
 *   • Per-item cards: large image left, info + tracking bar right
 *   • Delivery address + Shipping updates side-by-side inside each card
 *   • Bottom billing section: Billing address | Payment | Price breakdown
 *
 * Wires into existing services & sub-components:
 *   orderService.getOrderDetails(orderId)
 *   formatDate, getTrackingSteps
 *
 * Route: /orders/:orderId
 */

import React, { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { orderService } from "../features/orders/services/orderService";
import { formatDate } from "../features/orders/utils/orders";
import getTrackingSteps from "../features/orders/components/getTrackingSteps";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Package,
  Edit2,
} from "lucide-react";

/* ─────────────────────────────────────
   BRAND TOKENS
───────────────────────────────────── */
const PINK = "#FF3F6C";
const DARK = "#111827";
const GRAY = "#6B7280";
const LIGHT = "#F9FAFB";

/* ─────────────────────────────────────
   HELPERS
───────────────────────────────────── */
const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n ?? 0);

/* ─────────────────────────────────────
   TRACKING STEPS CONFIG
───────────────────────────────────── */
const STEPS = ["placed", "processing", "shipped", "delivered"];
const STEP_LABELS = {
  placed: "Order placed",
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
   TRACKING BAR  (reference-style thin bar)
───────────────────────────────────── */
const TrackingBar = ({ orderStatus, itemStatus, label }) => {
  const status = itemStatus || orderStatus || "placed";
  const current = stepIdx(status);
  const cancelled = status?.toLowerCase() === "cancelled";

  // how far the fill goes (0–100%)
  const fillPct = cancelled
    ? 0
    : Math.round((current / (STEPS.length - 1)) * 100);

  return (
    <div className="mt-5">
      {label && (
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
          {label}
        </p>
      )}

      {/* Bar */}
      <div className="relative h-[3px] bg-gray-200 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
          style={{
            width: `${fillPct}%`,
            background: cancelled ? "#EF4444" : PINK,
          }}
        />
      </div>

      {/* Step labels */}
      <div className="flex justify-between mt-2">
        {STEPS.map((step, i) => {
          const done = !cancelled && i <= current;
          const active = !cancelled && i === current;
          return (
            <span
              key={step}
              className="text-[10px] sm:text-[11px] font-semibold transition-colors"
              style={{
                color: active ? PINK : done ? DARK : "#9CA3AF",
                fontWeight: active ? 700 : 500,
              }}>
              {STEP_LABELS[step]}
            </span>
          );
        })}
      </div>

      {/* Status text */}
      {cancelled ? (
        <p className="text-xs text-red-500 font-semibold mt-2">
          Order cancelled
        </p>
      ) : (
        <p className="text-xs font-semibold mt-2" style={{ color: GRAY }}>
          {status?.charAt(0).toUpperCase() + status?.slice(1)} ·{" "}
          <span style={{ color: PINK }}>
            {STEP_LABELS[status?.toLowerCase()] ?? "Order placed"}
          </span>
        </p>
      )}
    </div>
  );
};

/* ─────────────────────────────────────
   ITEM CARD  (large image left, details right)
───────────────────────────────────── */
const ItemCard = ({ item, orderStatus, address, index }) => {
  const [editPhone, setEditPhone] = useState(false);

  return (
    <div
      className="border-t border-gray-200 pt-8 pb-10"
      style={{ animationDelay: `${index * 60}ms` }}>
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-10">
        {/* ── Product Image ── */}
        <div
          className="w-full sm:w-[200px] lg:w-[220px] aspect-[4/5] sm:aspect-auto sm:h-[240px]
            flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <Package size={36} />
            </div>
          )}
        </div>

        {/* ── Product Info ── */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Name + Price */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-[17px] sm:text-[19px] font-bold text-gray-900 leading-snug">
                {item.name}
              </h3>
              {item.description && (
                <p className="text-sm text-gray-500 mt-1.5 leading-relaxed max-w-[420px] line-clamp-3">
                  {item.description}
                </p>
              )}
            </div>
            <p className="text-[17px] font-bold text-gray-900 flex-shrink-0">
              {fmt(item.price)}
            </p>
          </div>

          {/* Size / Qty pills */}
          <div className="flex flex-wrap gap-2 mt-3">
            {item.selectedSize && (
              <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded">
                Size: {item.selectedSize}
              </span>
            )}
            <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded">
              Qty: {item.quantity || 1}
            </span>
          </div>

          {/* ── Address + Shipping updates row (reference layout) ── */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Delivery address */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Delivery address
              </p>
              {address ? (
                <div className="text-[13px] text-gray-700 leading-relaxed space-y-0.5">
                  <p className="font-semibold text-gray-900">{address.name}</p>
                  {address.line1 && <p>{address.line1}</p>}
                  <p>
                    {[address.city, address.state, address.pincode]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              ) : (
                <p className="text-[13px] text-gray-400">No address on file</p>
              )}
            </div>

            {/* Shipping updates */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Shipping updates
              </p>
              {address?.phone ? (
                <div className="text-[13px] text-gray-700 space-y-0.5">
                  <p>
                    {address.phone.replace(
                      /(\d{2})(\d{6})(\d{2})/,
                      "$1••••••$3",
                    )}
                  </p>
                  <button
                    onClick={() => setEditPhone((v) => !v)}
                    className="flex items-center gap-1 text-[12px] font-semibold transition-colors"
                    style={{ color: PINK }}>
                    <Edit2 size={11} />
                    Edit
                  </button>
                </div>
              ) : (
                <p className="text-[13px] text-gray-400">—</p>
              )}
            </div>
          </div>

          {/* ── Tracking Bar ── */}
          <TrackingBar orderStatus={orderStatus} itemStatus={item.itemStatus} />
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────
   BILLING FOOTER  (reference-style 3-col)
───────────────────────────────────── */
const BillingFooter = ({ order }) => {
  const p = order?.pricing ?? {};
  const address = order?.addressSnapshot;

  const priceRows = [
    {
      label: "Subtotal",
      value: p.subtotal ?? p.totalMRP ?? order?.totalAmount,
    },
    {
      label: "Shipping",
      value: p.deliveryCharge ?? p.deliveryFee ?? 0,
      free: (p.deliveryCharge ?? p.deliveryFee ?? 0) === 0,
    },
    p.discount > 0 && { label: "Discount", value: -p.discount, green: true },
    p.couponDiscount > 0 && {
      label: "Coupon",
      value: -p.couponDiscount,
      green: true,
    },
    p.platformFee > 0 && { label: "Platform fee", value: p.platformFee },
    p.gstAmount > 0 && { label: "Tax", value: p.gstAmount },
  ].filter(Boolean);

  const total = p.totalPayable ?? p.totalAmount ?? order?.totalAmount ?? 0;

  return (
    <div className="border-t border-gray-200 mt-4 pt-10 pb-16">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
        {/* Billing Address */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">
            Billing address
          </p>
          {address ? (
            <div className="text-[13px] text-gray-700 leading-relaxed space-y-0.5">
              <p className="font-semibold text-gray-900">{address.name}</p>
              {address.line1 && <p>{address.line1}</p>}
              <p>
                {[address.city, address.state, address.pincode]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
          ) : (
            <p className="text-[13px] text-gray-400">—</p>
          )}
        </div>

        {/* Payment Information */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">
            Payment information
          </p>
          <div className="text-[13px] text-gray-700 space-y-1">
            <div className="flex items-center gap-2">
              {/* Card icon placeholder */}
              <span
                className="inline-flex items-center justify-center px-2 py-1 rounded text-[10px]
                  font-black text-white uppercase"
                style={{ background: PINK }}>
                {order?.paymentMethod === "cod" ? "COD" : "CARD"}
              </span>
              <span className="font-semibold text-gray-900 capitalize">
                {order?.paymentMethod === "cod"
                  ? "Cash on Delivery"
                  : (order?.paymentMethod ?? "Online")}
              </span>
            </div>
            <p className="text-gray-400 text-[12px] capitalize">
              Status: {order?.paymentStatus ?? "pending"}
            </p>
          </div>
        </div>

        {/* Price Breakdown */}
        <div>
          <div className="space-y-2.5">
            {priceRows.map((row, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-[13px] text-gray-500">{row.label}</span>
                <span
                  className={`text-[13px] font-semibold ${
                    row.green ? "text-green-600" : "text-gray-900"
                  }`}>
                  {row.free
                    ? "Free"
                    : row.value < 0
                      ? `− ${fmt(Math.abs(row.value))}`
                      : fmt(row.value)}
                </span>
              </div>
            ))}

            <div className="flex items-center justify-between pt-3 mt-1 border-t border-gray-200">
              <span className="text-[14px] font-bold text-gray-900">
                Order total
              </span>
              <span className="text-[14px] font-black" style={{ color: PINK }}>
                {fmt(total)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────
   SKELETON
───────────────────────────────────── */
const Skel = ({ className }) => (
  <div className={`animate-pulse bg-gray-100 rounded ${className}`} />
);

const PageSkeleton = () => (
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
    <Skel className="h-8 w-48 mb-2" />
    <Skel className="h-4 w-72 mb-12" />
    {[1, 2].map((i) => (
      <div key={i} className="border-t border-gray-200 pt-8 pb-10 flex gap-8">
        <Skel className="w-[200px] h-[240px] flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <Skel className="h-6 w-48" />
          <Skel className="h-4 w-full" />
          <Skel className="h-4 w-4/5" />
          <div className="mt-6 grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Skel className="h-3 w-28" />
              <Skel className="h-4 w-40" />
              <Skel className="h-4 w-32" />
            </div>
            <div className="space-y-2">
              <Skel className="h-3 w-28" />
              <Skel className="h-4 w-36" />
            </div>
          </div>
          <Skel className="h-2 w-full mt-4" />
        </div>
      </div>
    ))}
  </div>
);

/* ─────────────────────────────────────
   MAIN PAGE
───────────────────────────────────── */
const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const {
    data: order,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderService.getOrderDetails(orderId),
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
  });

  /* ── Loading ── */
  if (isLoading)
    return (
      <div className="min-h-screen bg-white font-sans">
        <nav className="border-b border-gray-200 h-14" />
        <PageSkeleton />
      </div>
    );

  /* ── Error ── */
  if (error || !order)
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 font-sans">
        <p className="text-gray-900 font-semibold text-lg">Order not found</p>
        <button
          onClick={() => navigate("/orders")}
          className="text-sm font-bold px-5 py-2.5 rounded-full text-white"
          style={{ background: PINK }}>
          Back to Orders
        </button>
      </div>
    );

  const items = order.items ?? [];
  const address = order.addressSnapshot;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        .od-page * { box-sizing: border-box; }
      `}</style>

      <div
        className="od-page min-h-screen bg-white pb-20"
        style={{ fontFamily: "'DM Sans', sans-serif", color: DARK }}>
        {/* ── Minimal Top Nav ── */}
        <nav className="border-b border-gray-200 sticky top-0 z-40 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900
                text-[13px] font-semibold transition-colors group"
              aria-label="Go back">
              <ChevronLeft
                size={18}
                className="group-hover:-translate-x-0.5 transition-transform"
              />
              Orders
            </button>
          </div>
        </nav>

        {/* ── Page Content ── */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ── Page Title Row (reference style) ── */}
          <div
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between
            pt-8 sm:pt-10 pb-2 gap-3">
            <div>
              <h1 className="text-[26px] sm:text-[30px] font-black text-gray-900 leading-none">
                Order Details
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                <span className="text-[13px] text-gray-400 font-medium">
                  Order number{" "}
                  <span className="font-bold text-gray-600">
                    {order.orderId ?? order.id}
                  </span>
                </span>
                <span className="text-gray-300 hidden sm:inline">·</span>
                <span className="text-[13px] text-gray-400 font-medium">
                  {formatDate(order.createdAt)}
                </span>
              </div>
            </div>

            {/* View Invoice CTA */}
            <button
              className="flex items-center gap-1.5 text-[13px] font-bold transition-colors"
              style={{ color: PINK }}>
              View invoice <ChevronRight size={15} />
            </button>
          </div>

          {/* ── Per-Item Cards ── */}
          <div className="mt-2">
            {items.length > 0 ? (
              items.map((item, i) => (
                <ItemCard
                  key={item.id ?? i}
                  item={item}
                  orderStatus={order.orderStatus}
                  address={address}
                  index={i}
                />
              ))
            ) : (
              <div className="border-t border-gray-200 py-16 text-center text-gray-400 text-sm">
                No items found in this order.
              </div>
            )}
          </div>

          {/* ── Billing / Payment / Pricing Footer ── */}
          <BillingFooter order={order} />
        </div>
      </div>
    </>
  );
};

export default OrderDetailPage;
