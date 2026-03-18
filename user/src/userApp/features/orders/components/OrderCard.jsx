import React from "react";
import { ChevronRight, Package, Star, IndianRupee } from "lucide-react";
import { getStatusMeta, formatDate } from "../utils/orders";
import { useNavigate } from "react-router-dom";
import { redirectToWhatsApp } from "../../../../utils/redirectToWhatsApp";

const OrderCard = ({ order }) => {
  const navigate = useNavigate();
  const meta = getStatusMeta(order.orderStatus);

  const orderId = order?.id || order?.orderId;
  const amount = order?.totalAmount || 0;
  const customerName = order?.addressSnapshot?.name;

  const isCancelled = order.orderStatus === "cancelled";
  const isDelivered = order.orderStatus === "delivered";
  const isInTransit =
    order.orderStatus === "shipped" || order.orderStatus === "processing";

  const deliveryDate =
    order.expectedDelivery || order.deliveredAt || order.updatedAt;

  // ── Compute status display ──
  let statusDisplay = meta.label;
  if (isDelivered && deliveryDate)
    statusDisplay = `Delivered on ${formatDate(deliveryDate)}`;
  else if (isCancelled) statusDisplay = "Refund Completed";
  else if (isInTransit && deliveryDate)
    statusDisplay = `Delivery expected by ${formatDate(deliveryDate)}`;
  else if (order.orderStatus === "placed")
    // custom state for "not confirmed"
    statusDisplay = "Order Placed";

  const displayItems =
    order.items ||
    (order.previewItem
      ? [
          {
            ...order.previewItem,
            quantity: order.itemCount || 1,
            itemStatus: order.orderStatus,
          },
        ]
      : []);

  // ── Determine if we should show WhatsApp / Confirm Payment button ──
  const showConfirmButton =
    order.paymentStatus?.toLowerCase() === "pending" ||
    order.orderStatus === "placed";

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-gray-500">Order #{order.orderId}</p>
          <p className="text-xs text-gray-400 mt-1">
            {formatDate(order.createdAt)}
          </p>
        </div>

        {/* Right: Status & Payment */}
        <div className="text-right">
          <p className={`text-sm font-semibold ${meta.color}`}>
            {statusDisplay}
          </p>

          {showConfirmButton ? (
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click
                redirectToWhatsApp({ orderId, amount, customerName });
              }}
              className="mt-2 px-3 py-1 text-xs font-semibold text-white bg-[#FF3F6C] rounded hover:bg-[#d93059] transition-colors">
              Confirm Payment
            </button>
          ) : (
            <p className="text-xs text-gray-500 mt-1 capitalize">
              {order.paymentStatus}
            </p>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="mb-4 space-y-3">
        {displayItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-white border border-gray-200 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
              {item?.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className={`w-full h-full object-cover ${isCancelled ? "opacity-60 grayscale" : ""}`}
                />
              ) : (
                <Package size={16} className="text-gray-300" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {item?.name || "Product"}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">
                  Qty: {item?.quantity || 1}
                </span>
                {item?.selectedSize && (
                  <span className="text-xs text-gray-500">
                    Size: {item.selectedSize}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center text-sm font-semibold text-gray-900">
                <IndianRupee size={12} />
                {item?.price || 0}
              </div>
              {item?.itemStatus && item.itemStatus !== order.orderStatus && (
                <p className="text-xs text-gray-500 mt-1 capitalize">
                  {item.itemStatus.replace("_", " ")}
                </p>
              )}
            </div>
          </div>
        ))}

        {/* Total */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 mt-3">
          <p className="text-sm font-medium text-gray-900">
            Order Total ({order.itemCount}{" "}
            {order.itemCount === 1 ? "item" : "items"})
          </p>
          <div className="flex items-center text-lg font-bold text-gray-900">
            <IndianRupee size={16} />
            {order.totalAmount}
          </div>
        </div>
      </div>

      {/* Rating */}
      {isDelivered && (
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={16}
                className="text-gray-300 fill-current"
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 font-medium hover:text-[#ff3f6c] transition-colors">
            Rate this product
          </span>
        </div>
      )}

      <div className="flex justify-end mt-3">
        <ChevronRight
          size={18}
          className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all"
        />
      </div>
    </div>
  );
};

export default OrderCard;
