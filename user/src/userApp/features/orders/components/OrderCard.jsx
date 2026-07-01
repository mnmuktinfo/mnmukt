import React from "react";
import {
  Package,
  Star,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { redirectToWhatsApp } from "../../../../utils/redirectToWhatsApp";

// ── Helpers ───────────────────────────────────────────────────────────────────
export const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const raw = dateStr?.toDate ? dateStr.toDate() : new Date(dateStr);
  if (isNaN(raw)) return "";
  return raw.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const getStatusMeta = (status) => {
  const map = {
    delivered: {
      label: "Delivered",
      color: "text-green-600",
      bg: "bg-green-50",
      icon: CheckCircle2,
    },
    shipped: {
      label: "Shipped",
      color: "text-blue-600",
      bg: "bg-blue-50",
      icon: Truck,
    },
    processing: {
      label: "Processing",
      color: "text-amber-600",
      bg: "bg-amber-50",
      icon: Clock,
    },
    placed: {
      label: "Order Placed",
      color: "text-amber-600",
      bg: "bg-amber-50",
      icon: Clock,
    },
    cancelled: {
      label: "Cancelled",
      color: "text-red-600",
      bg: "bg-red-50",
      icon: XCircle,
    },
  };
  return (
    map[status] || {
      label: status,
      color: "text-gray-600",
      bg: "bg-gray-100",
      icon: Clock,
    }
  );
};

// ── Dummy data ─────────────────────────────────────────────────────────────────
export const DUMMY_ORDERS = [
  {
    orderId: "WU88191111",
    createdAt: "2021-07-06",
    totalAmount: 11800,
    itemCount: 2,
    paymentStatus: "paid",
    orderStatus: "delivered",
    deliveredAt: "2021-07-12",
    items: [
      {
        id: "i1",
        name: "Micro Backpack",
        description: "Are you a minimalist looking for a compact carry option?",
        price: 5800,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&q=80",
        itemStatus: "delivered",
        productId: "micro-backpack",
      },
    ],
  },
  // ... other dummy orders omitted for brevity, but they will work exactly the same
];

// ── OrderCard ──────────────────────────────────────────────────────────────────
const OrderCard = ({
  order,
  navigate: navProp,
  refreshOrders,
  updateOrderInCache,
}) => {
  const nav = useNavigate();
  const navigate = navProp || nav;

  const orderId = order?.id || order?.orderId;
  const amount = order?.pricing?.total ?? order?.totalAmount ?? 0;
  const customerName =
    order?.shippingAddress?.fullName ??
    order?.customer?.name ??
    order?.addressSnapshot?.name;

  const isCancelled = order.orderStatus === "cancelled";
  const isDelivered = order.orderStatus === "delivered";
  const isInTransit =
    order.orderStatus === "shipped" || order.orderStatus === "processing";

  const deliveryDate =
    order.expectedDelivery || order.deliveredAt || order.updatedAt;

  let statusDisplay = getStatusMeta(order.orderStatus).label;
  if (isDelivered && deliveryDate)
    statusDisplay = `Delivered on ${formatDate(deliveryDate)}`;
  else if (isCancelled) statusDisplay = "Cancelled & Refunded";
  else if (isInTransit && deliveryDate)
    statusDisplay = `Expected by ${formatDate(deliveryDate)}`;
  else if (order.orderStatus === "placed") statusDisplay = "Order Confirmed";

  const displayItems = order.items?.length
    ? order.items
    : order.previewItem
      ? [
          {
            ...order.previewItem,
            quantity: order.itemCount || 1,
            itemStatus: order.orderStatus,
          },
        ]
      : [];

  const showConfirmButton =
    (order.payment?.status ?? order.paymentStatus)?.toLowerCase() ===
      "pending" ||
    order.orderStatus === "placed" ||
    order.orderStatus === "pending";

  const StatusIcon = getStatusMeta(order.orderStatus).icon;
  const statusColor = getStatusMeta(order.orderStatus).color;
  const statusBg = getStatusMeta(order.orderStatus).bg;

  return (
    <div className="bg-white border border-gray-200 rounded-md overflow-hidden mb-4 shadow-sm w-full font-sans">
      {/* ── Header ── */}
      <div className="px-4 py-3 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 w-full sm:w-auto">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Order ID</p>
            <p className="text-sm font-medium text-gray-900">{order.orderId}</p>
          </div>
          <div className="hidden sm:block w-px bg-gray-200" />
          <div className="flex justify-between sm:block w-full sm:w-auto">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Order Date</p>
              <p className="text-sm text-gray-800">
                {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="sm:hidden text-right">
              <p className="text-xs text-gray-500 mb-0.5">Total</p>
              <p className="text-sm font-semibold text-gray-900">
                ₹{Number(amount).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
          <div className="hidden sm:block w-px bg-gray-200" />
          <div className="hidden sm:block">
            <p className="text-xs text-gray-500 mb-0.5">Total Amount</p>
            <p className="text-sm font-semibold text-gray-900">
              ₹{Number(amount).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          {showConfirmButton ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                redirectToWhatsApp({ orderId, amount, customerName });
              }}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-[#f43397] rounded hover:bg-[#e02b88] transition-colors">
              Confirm Payment
            </button>
          ) : (
            <button
              onClick={() => navigate(`/user/orders/${orderId}`)}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors flex justify-center items-center gap-1">
              Order Details <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ── Order Status Banner ── */}
      <div
        className={`px-4 py-2.5 flex items-center gap-2 border-b border-gray-100 ${statusBg}`}>
        <StatusIcon size={18} className={statusColor} />
        <span className={`text-sm font-medium ${statusColor}`}>
          {statusDisplay}
        </span>
      </div>

      {/* ── Items List ── */}
      <div className="divide-y divide-gray-100">
        {displayItems.map((item, index) => {
          const itemDelivered = item.itemStatus === "delivered";
          const itemCancelled = item.itemStatus === "cancelled";

          return (
            <div
              key={item.id || index}
              className="flex flex-col sm:flex-row gap-4 px-4 py-4">
              {/* Product Image */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">
                {item?.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className={`w-full h-full object-cover ${itemCancelled ? "opacity-50 grayscale" : ""}`}
                  />
                ) : (
                  <Package size={24} className="text-gray-300" />
                )}
              </div>

              {/* Product Info & Actions */}
              <div className="flex-1 flex flex-col sm:flex-row justify-between gap-4">
                {/* Info */}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 line-clamp-2">
                    {item?.name || "Product Name"}
                  </p>

                  <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                    {item?.selectedSize && (
                      <span>
                        Size:{" "}
                        <span className="font-medium text-gray-800">
                          {item.selectedSize}
                        </span>
                      </span>
                    )}
                    {item?.quantity && (
                      <span>
                        Qty:{" "}
                        <span className="font-medium text-gray-800">
                          {item.quantity}
                        </span>
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-gray-900 mt-2">
                    ₹{Number(item?.price || 0).toLocaleString("en-IN")}
                  </p>
                </div>

                {/* Specific Item Actions */}
                <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-2 justify-start sm:justify-center flex-wrap sm:flex-nowrap">
                  {isInTransit && (
                    <button
                      onClick={() => navigate(`/order-tracking/${orderId}`)}
                      className="px-4 py-1.5 text-xs font-medium text-[#f43397] border border-[#f43397] rounded hover:bg-pink-50 transition-colors">
                      Track
                    </button>
                  )}

                  {itemDelivered && (
                    <button
                      onClick={() => navigate(`/user/orders/${orderId}`)}
                      className="px-4 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                      Return
                    </button>
                  )}

                  {!itemCancelled && (
                    <button
                      onClick={() => navigate(`/products/${item?.productId}`)}
                      className="px-4 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors">
                      Buy Again
                    </button>
                  )}
                </div>
              </div>

              {/* Mobile Rating Row (if delivered) */}
              {itemDelivered && (
                <div className="w-full sm:hidden pt-3 mt-1 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-xs text-gray-500">Rate Product</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className="text-gray-300 hover:text-[#f43397] transition-colors cursor-pointer"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderCard;
