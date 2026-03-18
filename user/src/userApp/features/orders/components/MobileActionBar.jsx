import React from "react";

// ─── MOBILE ACTION BAR ───
const MobileActionBar = ({ order, setIsTrackingModalOpen }) => (
  <div className="fixed sm:hidden bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 flex gap-3 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe">
    {order.orderStatus !== "cancelled" && (
      <button
        onClick={() => setIsTrackingModalOpen(true)}
        className="flex-1 py-3.5 border border-[#282C3F] text-[#282C3F] rounded-[4px] text-[13px] font-bold uppercase tracking-wide hover:bg-gray-50">
        Track Order
      </button>
    )}
    <button
      className={`flex-1 py-3.5 rounded-[4px] text-[13px] font-bold uppercase tracking-wide text-white transition-colors ${
        order.orderStatus === "cancelled"
          ? "bg-[#FF3F6C] w-full"
          : "bg-[#FF3F6C]"
      }`}>
      {order.orderStatus === "delivered"
        ? "Return / Exchange"
        : order.orderStatus === "cancelled"
          ? "View Similar Products"
          : "Cancel Order"}
    </button>
  </div>
);

export default MobileActionBar;
