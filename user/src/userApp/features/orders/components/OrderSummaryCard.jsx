import React from "react";
import { formatDate, getStatusMeta } from "../utils/orders";

const getStatusStyle = (status) => {
  const s = status?.toLowerCase() || "";
  if (s === "delivered") return "bg-green-100 text-green-800";
  if (s === "cancelled") return "bg-red-100 text-red-800";
  if (s === "shipped") return "bg-blue-100 text-blue-800";
  return "bg-orange-100 text-orange-800";
};

// ─── ORDER SUMMARY ───
const OrderSummaryCard = ({ order }) => {
  // Fallbacks just in case data is missing
  const status = order.status || "Processing";
  const itemCount = order.items?.length || 1;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden w-full max-w-2xl mb-4">
      {/* 1. Header: Status & Date */}
      <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-3">
          <span
            className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-sm ${getStatusMeta(status)}`}>
            {status}
          </span>
        </div>
        <span className="text-[12px] text-[#535766] font-medium">
          Placed on {formatDate(order.createdAt)}
        </span>
      </div>

      {/* 2. Body: Main Order Details */}
      <div className="p-5">
        <div className="flex justify-between items-start">
          {/* Left: Order Info */}
          <div>
            <p className="text-[11px] font-bold text-[#535766] uppercase tracking-widest mb-1">
              Order ID
            </p>
            <h2 className="text-[16px] font-bold text-[#282C3F] mb-1">
              {order.orderId || "N/A"}
            </h2>
            <p className="text-[13px] text-gray-500">
              {itemCount} {itemCount > 1 ? "Items" : "Item"}
            </p>
          </div>

          {/* Right: Pricing & Payment */}
          <div className="text-right">
            <p className="text-[11px] font-bold text-[#535766] uppercase tracking-widest mb-1">
              Total Amount
            </p>
            <p className="text-[18px] font-bold text-[#282C3F]">
              ₹{order.totalAmount?.toLocaleString("en-IN") || "0"}
            </p>
            {/* Added a payment status indicator which is common in Indian e-commerce */}
            <p className="text-[12px] text-gray-500 mt-1">
              {order.paymentMode === "COD" ? "Cash on Delivery" : "Paid Online"}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Footer: Action / Tracking */}
      <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between bg-white group cursor-pointer hover:bg-gray-50 transition-colors">
        <p className="text-[13px] text-[#535766]">
          {status === "Delivered"
            ? "Rate your experience"
            : "Track your order status"}
        </p>

        {/* Using Myntra's signature pinkish-red for the action button */}
        <button className="text-[14px] font-bold text-[#FF3F6C] group-hover:text-[#d93059] flex items-center gap-1 transition-colors">
          View Details
          <span className="text-[16px]">&rsaquo;</span>
        </button>
      </div>
    </div>
  );
};

export default OrderSummaryCard;
