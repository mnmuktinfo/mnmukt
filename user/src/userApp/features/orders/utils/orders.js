// helpers/orderStatusMeta.js

export const ORDER_STATUS_META = {
  delivered: {
    label: "Delivered",
    color: "text-green-600",
    bg: "bg-green-50",
    dot: "bg-green-500",
    pulse: false,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-600",
    bg: "bg-red-50",
    dot: "bg-red-500",
    pulse: false,
  },
  shipped: {
    label: "In Transit",
    color: "text-blue-600",
    bg: "bg-blue-50",
    dot: "bg-blue-500",
    pulse: true,
  },
  processing: {
    label: "Processing",
    color: "text-amber-600",
    bg: "bg-amber-50",
    dot: "bg-amber-500",
    pulse: true,
  },
  default: {
    label: "Confirmed",
    color: "text-pink-600",
    bg: "bg-pink-50",
    dot: "bg-pink-500",
    pulse: true,
  },
};

export const getStatusMeta = (status = "") =>
  ORDER_STATUS_META[status.toLowerCase()] || ORDER_STATUS_META.default;



export const formatDate = (ts) => {
  if (!ts) return "—";
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};