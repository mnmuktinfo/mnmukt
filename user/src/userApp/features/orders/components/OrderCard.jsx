import React from "react";
import { Package, IndianRupee, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { redirectToWhatsApp } from "../../../../utils/redirectToWhatsApp";

// ── Helpers ───────────────────────────────────────────────────────────────────
export const formatDate = (dateStr) => {
  if (!dateStr) return "";
  // Handle Firestore Timestamp objects
  const raw = dateStr?.toDate ? dateStr.toDate() : new Date(dateStr);
  if (isNaN(raw)) return "";
  return raw.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const getStatusMeta = (status) => {
  const map = {
    delivered: { label: "Delivered", color: "text-green-600" },
    shipped: { label: "Out for delivery", color: "text-amber-500" },
    processing: { label: "Processing", color: "text-blue-500" },
    placed: { label: "Order Placed", color: "text-amber-500" },
    cancelled: { label: "Cancelled", color: "text-red-500" },
  };
  return map[status] || { label: status, color: "text-gray-500" };
};

// ── Dummy data (used when real API returns nothing) ────────────────────────────
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
        description:
          "Are you a minimalist looking for a compact carry option? The Micro Backpack is the perfect size for your essential everyday carry items. Wear it like a backpack or carry it like a satchel for all-day use.",
        price: 5800,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&q=80",
        itemStatus: "delivered",
        productId: "micro-backpack",
      },
      {
        id: "i2",
        name: "Nomad Shopping Tote",
        description:
          "This durable shopping tote is perfect for the world traveler. Its yellow canvas construction is water, fray, tear resistant. The matching handle, backpack straps, and shoulder loops provide multiple carry options.",
        price: 6000,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200&q=80",
        itemStatus: "delivered",
        productId: "nomad-tote",
      },
    ],
  },
  {
    orderId: "AT48441546",
    createdAt: "2020-12-22",
    totalAmount: 3200,
    itemCount: 1,
    paymentStatus: "paid",
    orderStatus: "delivered",
    deliveredAt: "2021-01-05",
    items: [
      {
        id: "i3",
        name: "Double Stack Clothing Bag",
        description:
          "Save space and protect your favorite clothes in this double-layer garment bag. Each compartment easily holds multiple pairs of jeans or tops.",
        price: 3200,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=200&q=80",
        itemStatus: "delivered",
        productId: "clothing-bag",
      },
    ],
  },
  {
    orderId: "MN72938401",
    createdAt: "2024-03-15",
    totalAmount: 4499,
    itemCount: 1,
    paymentStatus: "pending",
    orderStatus: "placed",
    deliveredAt: null,
    items: [
      {
        id: "i4",
        name: "Minimal Canvas Sneakers",
        description:
          "Clean, lightweight canvas sneakers for everyday wear. Breathable upper, cushioned insole, and rubber outsole designed for all-day comfort.",
        price: 4499,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80",
        itemStatus: "placed",
        productId: "canvas-sneakers",
      },
    ],
  },
  {
    orderId: "RZ11023887",
    createdAt: "2024-02-02",
    totalAmount: 8750,
    itemCount: 1,
    paymentStatus: "paid",
    orderStatus: "shipped",
    expectedDelivery: "2024-03-30",
    items: [
      {
        id: "i5",
        name: "Leather Weekender Bag",
        description:
          "Crafted from full-grain leather with a structured frame and ample room for 2–3 days of travel essentials. Includes detachable shoulder strap.",
        price: 8750,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=200&q=80",
        itemStatus: "shipped",
        productId: "leather-weekender",
      },
    ],
  },
];

// ── StatusDot ──────────────────────────────────────────────────────────────────
const StatusDot = ({ status }) => {
  const cfg = {
    delivered: { bg: "bg-green-500", symbol: "✓" },
    cancelled: { bg: "bg-red-500", symbol: "✕" },
    shipped: { bg: "bg-amber-400", symbol: "›" },
    processing: { bg: "bg-blue-400", symbol: "›" },
    placed: { bg: "bg-amber-400", symbol: "›" },
  };
  const { bg, symbol } = cfg[status] || { bg: "bg-gray-400", symbol: "·" };
  return (
    <span
      className={`inline-flex items-center justify-center w-[15px] h-[15px] rounded-full text-white text-[8px] font-bold flex-shrink-0 ${bg}`}>
      {symbol}
    </span>
  );
};

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
  const amount = order?.totalAmount || 0;
  const customerName = order?.addressSnapshot?.name;

  const isCancelled = order.orderStatus === "cancelled";
  const isDelivered = order.orderStatus === "delivered";
  const isInTransit =
    order.orderStatus === "shipped" || order.orderStatus === "processing";

  const deliveryDate =
    order.expectedDelivery || order.deliveredAt || order.updatedAt;

  let statusDisplay = getStatusMeta(order.orderStatus).label;
  if (isDelivered && deliveryDate)
    statusDisplay = `Delivered on ${formatDate(deliveryDate)}`;
  else if (isCancelled) statusDisplay = "Refund Completed";
  else if (isInTransit && deliveryDate)
    statusDisplay = `Delivery expected by ${formatDate(deliveryDate)}`;
  else if (order.orderStatus === "placed") statusDisplay = "Order Placed";

  // Support both full items array and lightweight previewItem
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
    order.paymentStatus?.toLowerCase() === "pending" ||
    order.orderStatus === "placed";

  return (
    <div className="bg-white  overflow-hidden w-full s mb-4 sm:mb-6">
      {/* ── Header (Fully Responsive Grid) ── */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        {/* Meta Data */}
        <div className="grid grid-cols-2 sm:flex sm:flex-row sm:gap-8 gap-y-3 gap-x-4 w-full md:w-auto">
          <div>
            <p className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Order number
            </p>
            <p className="text-sm text-gray-900 font-semibold break-all">
              {order.orderId}
            </p>
          </div>
          <div>
            <p className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Date placed
            </p>
            <p className="text-sm text-gray-800">
              {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="col-span-2 sm:col-span-1 pt-2 border-t border-gray-50 sm:pt-0 sm:border-t-0">
            <p className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Total amount
            </p>
            <div className="flex items-center text-sm font-bold text-gray-900">
              <IndianRupee size={12} strokeWidth={2.5} className="mr-0.5" />
              {Number(amount).toLocaleString("en-IN")}
            </div>
          </div>
        </div>

        {/* Action Buttons (Full width on mobile, auto on desktop) */}
        <div className="flex gap-2 w-full md:w-auto mt-1 md:mt-0">
          {showConfirmButton ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                redirectToWhatsApp({ orderId, amount, customerName });
              }}
              className="flex-1 md:flex-none px-4 py-2.5 text-sm font-semibold text-white bg-[#FF3F6C] rounded-lg hover:bg-[#d93059] active:scale-95 transition-all text-center">
              Confirm Payment
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate(`/user/orders/${orderId}`)}
                className="flex-1 md:flex-none px-4 py-2 text-xs sm:text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 active:scale-95 transition-all text-center">
                View Order
              </button>
              {/* Removed hidden class to show full details on mobile */}
              <button
                onClick={() => navigate(`/orders/${orderId}/invoice`)}
                className="flex-1 md:flex-none px-4 py-2 text-xs sm:text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 active:scale-95 transition-all text-center">
                View Invoice
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Items List ── */}
      <div className="divide-y divide-gray-100">
        {displayItems.map((item, index) => {
          const itemDelivered = item.itemStatus === "delivered";
          const itemCancelled = item.itemStatus === "cancelled";

          return (
            <div
              key={item.id || index}
              className="flex gap-4 sm:gap-6 px-4 sm:px-6 py-5 sm:py-6">
              {/* Product Image */}
              <div className="w-20 h-20 sm:w-28 sm:h-28 flex-shrink-0 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">
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

              {/* Product Body */}
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-semibold text-gray-900 leading-snug">
                      {item?.name || "Product"}
                    </p>
                    {item?.description && (
                      <p className="text-xs sm:text-sm text-gray-500 mt-1.5 leading-relaxed line-clamp-2 sm:line-clamp-3">
                        {item.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 mt-2">
                      {item?.quantity > 1 && (
                        <span className="text-[11px] font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                          Qty: {item.quantity}
                        </span>
                      )}
                      {item?.selectedSize && (
                        <span className="text-[11px] font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                          Size: {item.selectedSize}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center text-sm sm:text-base font-bold text-gray-900 flex-shrink-0">
                    <IndianRupee
                      size={13}
                      strokeWidth={2.5}
                      className="mr-0.5"
                    />
                    {Number(item?.price || 0).toLocaleString("en-IN")}
                  </div>
                </div>

                {/* Status + Actions row (Wrapped elegantly for mobile) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 sm:mt-auto pt-4 border-t border-gray-50 gap-3 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <StatusDot status={item.itemStatus || order.orderStatus} />
                    <span
                      className={`text-xs sm:text-sm font-semibold ${
                        itemCancelled
                          ? "text-red-500"
                          : itemDelivered
                            ? "text-gray-800"
                            : "text-amber-500"
                      }`}>
                      {statusDisplay}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs sm:text-sm">
                    <button
                      onClick={() => navigate(`/products/${item?.productId}`)}
                      className="text-[#FF3F6C] hover:text-[#d93059] font-semibold transition-colors">
                      View product
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => navigate(`/products/${item?.productId}`)}
                      className="text-[#FF3F6C] hover:text-[#d93059] font-semibold transition-colors">
                      Buy again
                    </button>
                  </div>
                </div>

                {/* Star rating — delivered items only */}
                {itemDelivered && (
                  <div className="flex items-center gap-2 mt-3 sm:mt-4">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          className="text-gray-300 fill-current cursor-pointer hover:text-yellow-400 transition-colors"
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-medium text-gray-400 hover:text-[#FF3F6C] cursor-pointer transition-colors">
                      Rate this product
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderCard;
