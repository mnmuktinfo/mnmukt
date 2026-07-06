import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { OrderService } from "../features/orders/services/api/orderService"; // Adjust path as needed
import {
  ArchiveBoxIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowPathIcon,
  ShoppingBagIcon,
  LinkIcon,
  CheckIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  WifiIcon,
} from "@heroicons/react/24/outline";
import LoadingScreen from "../components/loading/LoadingScreen"; // Adjust path as needed

// ────────────────────────────────────────────────────────────
// Config
// ────────────────────────────────────────────────────────────

const BRAND_NAME = "YourStoreBrand";
// Meesho-style palette: purple as the primary brand color, pink as the
// secondary accent, and a purple→pink gradient for primary actions.
const ACCENT = "#570CB0"; // primary purple
const ACCENT_DARK = "#3C0878"; // pressed/hover purple
const ACCENT_PINK = "#F43397"; // secondary pink
const ACCENT_SOFT = "#F3EBFC"; // pale purple tint for chips/backgrounds
const BRAND_GRADIENT = `linear-gradient(90deg, ${ACCENT_PINK} 0%, ${ACCENT} 100%)`;
const POLL_INTERVAL_MS = 30_000; // refresh in the background while the tab is visible
const MAX_RETRIES = 3;

// Ordered journey used to compute progress + the segmented stepper.
// "cancelled" is handled separately since it isn't part of the happy path.
const JOURNEY = [
  { key: "pending", label: "Order placed", icon: ClockIcon },
  { key: "confirmed", label: "Confirmed", icon: CheckCircleIcon },
  { key: "processing", label: "Processing", icon: ArrowPathIcon },
  { key: "packed", label: "Packed", icon: ArchiveBoxIcon },
  { key: "shipped", label: "Shipped", icon: TruckIcon },
  { key: "out_for_delivery", label: "Out for delivery", icon: MapPinIcon },
  { key: "delivered", label: "Delivered", icon: ArchiveBoxIcon },
];

const STATUS_COLORS = {
  pending: {
    text: "text-amber-600",
    bg: "bg-amber-500",
    ring: "ring-amber-100",
  },
  confirmed: {
    text: "text-blue-600",
    bg: "bg-blue-500",
    ring: "ring-blue-100",
  },
  processing: {
    text: "text-indigo-600",
    bg: "bg-indigo-500",
    ring: "ring-indigo-100",
  },
  packed: {
    text: "text-violet-600",
    bg: "bg-violet-500",
    ring: "ring-violet-100",
  },
  shipped: {
    text: "text-purple-600",
    bg: "bg-purple-500",
    ring: "ring-purple-100",
  },
  out_for_delivery: {
    text: "text-pink-600",
    bg: "bg-pink-500",
    ring: "ring-pink-100",
  },
  delivered: {
    text: "text-green-600",
    bg: "bg-green-500",
    ring: "ring-green-100",
  },
  cancelled: { text: "text-red-600", bg: "bg-red-500", ring: "ring-red-100" },
};

// ────────────────────────────────────────────────────────────
// Small helpers
// ────────────────────────────────────────────────────────────

/** "2h ago" / "just now" — falls back to a short date once it's old. */
function relativeTime(dateInput) {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "";
  const diffSeconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (diffSeconds < 30) return "just now";
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  const diffMinutes = Math.round(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatAbsolute(dateInput) {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatEta(dateInput) {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

// ────────────────────────────────────────────────────────────
// Presentational bits
// ────────────────────────────────────────────────────────────

function TrackingSkeleton() {
  return (
    <div
      className="min-h-screen bg-gray-100 font-sans pb-16 flex flex-col items-center animate-pulse"
      aria-hidden="true">
      <div className="w-full bg-white border-b border-gray-200">
        <div className="max-w-xl sm:max-w-2xl lg:max-w-3xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="h-5 w-32 bg-gray-200 rounded" />
          <div className="h-8 w-20 bg-gray-200 rounded-full" />
        </div>
      </div>
      <div className="w-full max-w-xl sm:max-w-2xl lg:max-w-3xl px-4 sm:px-6 pt-6 space-y-4">
        <div className="text-center pb-2 space-y-2">
          <div className="h-6 w-48 bg-gray-200 rounded mx-auto" />
          <div className="h-4 w-40 bg-gray-200 rounded mx-auto" />
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 space-y-5">
          <div className="h-3 w-full bg-gray-200 rounded-full" />
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="w-3 h-3 rounded-full bg-gray-200 mt-1.5" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-32 bg-gray-200 rounded" />
                  <div className="h-3 w-20 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 space-y-4">
          <div className="h-3.5 w-32 bg-gray-200 rounded" />
          <div className="flex gap-4">
            <div className="w-16 h-16 rounded-lg bg-gray-200 shrink-0" />
            <div className="flex-1 space-y-2 pt-2">
              <div className="h-3.5 w-3/4 bg-gray-200 rounded" />
              <div className="h-3 w-12 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SegmentedStepper({ currentIndex, isCancelled }) {
  if (isCancelled) return null;
  return (
    <div
      className="flex items-center mb-1"
      role="list"
      aria-label="Shipment journey">
      {JOURNEY.map((step, idx) => {
        const isComplete = idx < currentIndex;
        const isCurrent = idx === currentIndex;
        const isLast = idx === JOURNEY.length - 1;
        return (
          <React.Fragment key={step.key}>
            <div
              role="listitem"
              className="flex flex-col items-center shrink-0"
              aria-current={isCurrent ? "step" : undefined}>
              <div
                className={[
                  "w-2.5 h-2.5 rounded-full transition-colors duration-500",
                  isComplete ? "bg-green-500" : isCurrent ? "" : "bg-gray-200",
                  isCurrent ? "ring-4" : "",
                ].join(" ")}
                style={
                  isCurrent
                    ? {
                        backgroundColor: ACCENT,
                        boxShadow: `0 0 0 4px ${ACCENT_SOFT}`,
                      }
                    : undefined
                }
              />
            </div>
            {!isLast && (
              <div
                className={[
                  "flex-1 h-0.5 mx-1 rounded-full transition-colors duration-500",
                  isComplete ? "bg-green-500" : "bg-gray-200",
                ].join(" ")}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Main component
// ────────────────────────────────────────────────────────────

export default function SharedTrackingPage() {
  const { shareToken } = useParams();
  const navigate = useNavigate();

  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorKind, setErrorKind] = useState(null); // "not_found" | "network"
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const [copyState, setCopyState] = useState("idle"); // "idle" | "copied"
  const [, forceTick] = useState(0); // re-render periodically so "x ago" labels stay fresh

  const isMountedRef = useRef(true);
  const retryCountRef = useRef(0);

  const fetchSharedOrder = useCallback(
    async ({ silent = false } = {}) => {
      if (!shareToken) return;
      if (!silent) setLoading(true);
      setError(null);
      setErrorKind(null);
      try {
        const data = await OrderService.getSharedOrder(shareToken);
        if (!isMountedRef.current) return;
        setOrderData(data);
        setLastUpdatedAt(new Date());
        retryCountRef.current = 0;
      } catch (err) {
        if (!isMountedRef.current) return;
        // Network/timeout errors are worth a manual retry; a 404/expired
        // token is a dead end, so we treat them differently in the UI.
        const status = err?.response?.status ?? err?.status;
        const isNetworkIssue =
          !status || status >= 500 || err?.message === "Network Error";
        setErrorKind(isNetworkIssue ? "network" : "not_found");
        setError(
          err?.message ||
            (isNetworkIssue
              ? "We couldn't reach our servers. Check your connection and try again."
              : "This tracking link is invalid or has expired."),
        );
      } finally {
        if (isMountedRef.current && !silent) setLoading(false);
      }
    },
    [shareToken],
  );

  // Initial load
  useEffect(() => {
    isMountedRef.current = true;
    fetchSharedOrder();
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchSharedOrder]);

  // Background polling, paused while the tab is hidden or the order is in a
  // terminal state (delivered/cancelled) to avoid pointless requests.
  useEffect(() => {
    const terminal =
      orderData?.orderStatus?.toLowerCase() === "delivered" ||
      orderData?.orderStatus?.toLowerCase() === "cancelled";
    if (terminal || !shareToken) return;

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchSharedOrder({ silent: true });
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [fetchSharedOrder, shareToken, orderData?.orderStatus]);

  // Keep relative timestamps ("2m ago") fresh without re-fetching.
  useEffect(() => {
    const tick = setInterval(() => forceTick((n) => n + 1), 60_000);
    return () => clearInterval(tick);
  }, []);

  const handleManualRetry = () => {
    retryCountRef.current += 1;
    fetchSharedOrder();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      // Clipboard API can fail in insecure contexts / older browsers.
      setCopyState("idle");
    }
  };

  // ── Loading ──
  if (loading && !orderData) {
    return <TrackingSkeleton />;
  }

  // ── Error (no usable data at all) ──
  if ((error && !orderData) || (!loading && !orderData)) {
    const isNetwork = errorKind === "network";
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center font-sans">
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
            isNetwork ? "bg-amber-50" : "bg-red-50"
          }`}>
          {isNetwork ? (
            <WifiIcon className="w-7 h-7 text-amber-500" />
          ) : (
            <XCircleIcon className="w-7 h-7 text-red-400" />
          )}
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1.5">
          {isNetwork ? "Connection trouble" : "Tracking link unavailable"}
        </h2>
        <p className="text-sm text-gray-600 mb-6 max-w-sm">
          {error || "Invalid or expired tracking link."}
        </p>
        <div className="flex gap-2">
          {isNetwork && (
            <button
              type="button"
              onClick={handleManualRetry}
              disabled={loading}
              className="px-5 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-60 inline-flex items-center gap-1.5">
              <ArrowPathIcon
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              Try again
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="px-5 py-2 border border-gray-300 bg-white text-gray-800 rounded-md text-sm font-medium hover:bg-gray-50">
            Visit our store
          </button>
        </div>
      </div>
    );
  }

  const currentStatus = orderData.orderStatus?.toLowerCase() || "pending";
  const isCancelled = currentStatus === "cancelled";
  const colors = STATUS_COLORS[currentStatus] || STATUS_COLORS.pending;
  const StatusIcon =
    JOURNEY.find((s) => s.key === currentStatus)?.icon || ClockIcon;
  const customerName = orderData.customerName || "A friend";
  const currentIndex = JOURNEY.findIndex((s) => s.key === currentStatus);
  const eta = orderData.estimatedDelivery
    ? formatEta(orderData.estimatedDelivery)
    : null;
  const history = Array.isArray(orderData.statusHistory)
    ? orderData.statusHistory
    : [];
  const items = Array.isArray(orderData.items) ? orderData.items : [];

  return (
    <div className="min-h-screen bg-gray-100 font-sans pb-16 selection:bg-pink-200 flex flex-col items-center">
      {/* Brand Header */}
      <div className="w-full bg-white sticky top-0 z-20 shadow-sm">
        <div className="max-w-xl sm:max-w-2xl lg:max-w-3xl mx-auto px-4 sm:px-6 py-3.5 flex justify-between items-center">
          <span
            className="text-lg sm:text-xl font-extrabold tracking-tight"
            style={{ color: ACCENT }}>
            {BRAND_NAME}
          </span>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-xs sm:text-sm font-semibold text-white rounded-full px-4 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-95 transition-transform"
            style={{ backgroundImage: BRAND_GRADIENT }}>
            Shop now
          </button>
        </div>
        {/* Thin brand gradient strip, a small nod to the logo colors */}
        <div
          className="h-[3px] w-full"
          style={{ backgroundImage: BRAND_GRADIENT }}
        />
      </div>

      <div className="w-full max-w-xl sm:max-w-2xl lg:max-w-3xl px-4 sm:px-6 pt-6 space-y-4">
        {/* Intro Banner */}
        <div className="text-center pb-2">
          <h1 className="text-xl font-semibold text-gray-900">
            {customerName}&rsquo;s order
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Follow along to see when it arrives.
          </p>
        </div>

        {/* TIMELINE CARD */}
        {!isCancelled ? (
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-gray-900">
                Shipment status
              </h2>
              <div className={`flex items-center gap-1.5 ${colors.text}`}>
                <StatusIcon className="w-[18px] h-[18px]" />
                <span className="text-xs font-semibold capitalize">
                  {currentStatus.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            {/* Segmented journey stepper */}
            <div className="mb-2">
              <SegmentedStepper
                currentIndex={Math.max(currentIndex, 0)}
                isCancelled={isCancelled}
              />
            </div>

            {/* Meta row: last updated + refresh + ETA */}
            <div className="flex items-center justify-between text-xs text-gray-400 mb-6">
              <span aria-live="polite">
                {lastUpdatedAt
                  ? `Updated ${relativeTime(lastUpdatedAt)}`
                  : "\u00A0"}
              </span>
              <button
                type="button"
                onClick={() => fetchSharedOrder({ silent: true })}
                className="inline-flex items-center gap-1 font-medium text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 rounded-full px-2 py-1 -mr-2 transition-colors"
                onMouseEnter={(e) => (e.currentTarget.style.color = ACCENT)}
                onMouseLeave={(e) => (e.currentTarget.style.color = "")}
                aria-label="Refresh tracking status">
                <ArrowPathIcon className="w-3.5 h-3.5" />
                Refresh
              </button>
            </div>

            {eta && (
              <div
                className="mb-6 flex items-center gap-2.5 rounded-lg px-3.5 py-2.5"
                style={{ backgroundColor: ACCENT_SOFT }}>
                <TruckIcon
                  className="w-4 h-4 shrink-0"
                  style={{ color: ACCENT }}
                />
                <p className="text-xs text-gray-700">
                  <span className="font-semibold">Estimated delivery:</span>{" "}
                  {eta}
                </p>
              </div>
            )}

            {(orderData.carrier || orderData.trackingNumber) && (
              <div className="mb-6 flex items-center justify-between rounded-lg border border-gray-100 px-3.5 py-2.5">
                <div>
                  {orderData.carrier && (
                    <p className="text-xs font-semibold text-gray-800">
                      {orderData.carrier}
                    </p>
                  )}
                  {orderData.trackingNumber && (
                    <p className="text-[11px] font-mono text-gray-500 tracking-wide">
                      {orderData.trackingNumber}
                    </p>
                  )}
                </div>
                {orderData.carrierUrl && (
                  <a
                    href={orderData.carrierUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 rounded px-1"
                    style={{ color: ACCENT }}>
                    Track on carrier site
                  </a>
                )}
              </div>
            )}

            {/* Status History List */}
            <div className="relative pl-3">
              <div className="absolute top-2 bottom-2 left-[17px] w-0.5 bg-gray-100" />
              <ol className="space-y-6">
                {history.length > 0 ? (
                  [...history].reverse().map((entry, idx) => (
                    <li
                      key={
                        entry.id ?? `${entry.status}-${entry.changedAt ?? idx}`
                      }
                      className="relative flex gap-4">
                      <div
                        className={`w-3 h-3 rounded-full mt-1.5 z-10 ring-4 ring-white ${
                          idx === 0 ? "bg-green-500" : "bg-gray-300"
                        }`}
                      />
                      <div className="flex-1">
                        <p
                          className={`text-sm font-semibold capitalize ${
                            idx === 0 ? "text-gray-900" : "text-gray-500"
                          }`}>
                          {entry.status?.replace(/_/g, " ")}
                        </p>
                        {entry.note && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {entry.note}
                          </p>
                        )}
                        {entry.changedAt && (
                          <p
                            className="text-[11px] font-medium text-gray-400 mt-1 uppercase tracking-wide"
                            title={formatAbsolute(entry.changedAt)}>
                            {formatAbsolute(entry.changedAt)}
                          </p>
                        )}
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-gray-500 py-2 list-none">
                    Tracking updates will appear here soon.
                  </li>
                )}
              </ol>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 p-5 rounded-xl border border-red-100 flex gap-3 items-start shadow-sm">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-semibold text-red-800">
                Order cancelled
              </h2>
              <p className="text-sm text-red-600 mt-1">
                This order has been cancelled and will not be delivered.
              </p>
              {orderData.cancellationReason && (
                <p className="text-xs text-red-500 mt-2">
                  Reason: {orderData.cancellationReason}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ITEMS CARD */}
        {items.length > 0 && (
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              What&rsquo;s in the package
            </h2>
            <div className="space-y-4">
              {items.map((item, idx) => (
                <div key={item.id ?? idx} className="flex gap-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-lg border border-gray-100 shrink-0 flex items-center justify-center overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name || "Product"}
                        loading="lazy"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <ArchiveBoxIcon className="w-6 h-6 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <p className="text-sm text-gray-900 font-medium line-clamp-2">
                      {item.name || "Item"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Qty: {item.quantity ?? 1}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Share this tracking link */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            Share this link so someone else can follow the delivery too.
          </p>
          <button
            type="button"
            onClick={handleCopyLink}
            className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold rounded-full border px-4 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 transition-colors"
            style={{
              borderColor: copyState === "copied" ? "#bbf7d0" : ACCENT_SOFT,
              color: copyState === "copied" ? "#16a34a" : ACCENT,
              backgroundColor: copyState === "copied" ? "#f0fdf4" : ACCENT_SOFT,
            }}
            aria-live="polite">
            {copyState === "copied" ? (
              <>
                <CheckIcon className="w-3.5 h-3.5" />
                Copied
              </>
            ) : (
              <>
                <LinkIcon className="w-3.5 h-3.5" />
                Copy link
              </>
            )}
          </button>
        </div>

        {/* Call to Action */}
        <div className="mt-8 pt-8 border-t border-gray-200 text-center pb-8">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4"
            style={{ backgroundColor: ACCENT_SOFT, color: ACCENT }}>
            <ShoppingBagIcon className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">
            Want one for yourself?
          </h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            Explore our latest collection and get it delivered to your door.
          </p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full sm:w-auto sm:px-10 py-3.5 text-white rounded-full text-sm font-semibold shadow-sm transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{ backgroundImage: BRAND_GRADIENT }}>
            Explore store
          </button>
        </div>
      </div>
    </div>
  );
}
