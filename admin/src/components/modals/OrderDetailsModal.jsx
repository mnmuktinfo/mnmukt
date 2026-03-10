import { ShoppingBag } from "lucide-react";
import React from "react";
import {
  FaXmark,
  FaPrint,
  FaLocationDot,
  FaCircleInfo,
  FaWhatsapp,
  FaCircleCheck,
  FaTrashCan,
  FaIndianRupeeSign,
  FaBox,
  FaUserShield,
  FaCircleXmark,
} from "react-icons/fa6";

const OrderDetailsModal = ({
  selectedOrder,
  setSelectedOrder,
  handleAction,
  handleDelete,
  STATUS_FLOW,
}) => {
  if (!selectedOrder) return null;

  const STATUS_STEPS = [
    "pending",
    "confirmed",
    "packaging",
    "shipping",
    "delivered",
  ];
  const currentStatusIndex = STATUS_STEPS.indexOf(selectedOrder.status);
  const flowConfig = STATUS_FLOW[selectedOrder.status];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 md:p-8">
      <div className="bg-[#f8fafc] w-full max-w-6xl h-full max-h-[900px] overflow-hidden flex flex-col shadow-2xl rounded-sm border border-slate-200 animate-in fade-in zoom-in-95 duration-300">
        {/* HEADER: COMMAND HUD */}
        <div className="bg-slate-950 px-8 py-5 flex justify-between items-center shrink-0 border-b border-[#ff356c]/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/5 rounded flex items-center justify-center text-[#ff356c] border border-white/10">
              <ShoppingBag size={24} />
            </div>
            <div>
              <h2 className="text-white text-lg font-black uppercase tracking-tighter">
                Manifest Details
              </h2>
              <p className="text-[#ff356c] text-[10px] font-black uppercase tracking-[0.2em]">
                Registry ID: {selectedOrder.id.toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedOrder(null)}
            className="text-slate-400 hover:text-white bg-white/5 p-2 rounded transition-all active:scale-90">
            <FaXmark size={20} />
          </button>
        </div>

        {/* SHIPMENT PROGRESS BAR */}
        <div className="bg-white px-8 py-6 border-b border-slate-100 shadow-sm flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="flex-1 w-full max-w-3xl flex items-center">
            {STATUS_STEPS.map((step, idx) => {
              const isDone = idx <= currentStatusIndex;
              const isCurrent = idx === currentStatusIndex;
              return (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center gap-2 relative">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                        isDone
                          ? "bg-[#ff356c] border-[#ff356c] text-white shadow-lg"
                          : "bg-white border-slate-200 text-slate-300"
                      }`}>
                      {isDone ? (
                        <FaCircleCheck size={14} />
                      ) : (
                        <span className="text-[10px] font-bold">{idx + 1}</span>
                      )}
                    </div>
                    <span
                      className={`text-[8px] font-black uppercase absolute -bottom-4 whitespace-nowrap tracking-widest ${isDone ? "text-slate-900" : "text-slate-300"}`}>
                      {step}
                    </span>
                  </div>
                  {idx < STATUS_STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-[2px] mx-2 rounded-full ${isDone ? "bg-[#ff356c]" : "bg-slate-100"}`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600 bg-slate-50 border border-slate-200 px-6 py-3 rounded-sm hover:bg-slate-100 transition-all active:scale-95 shrink-0">
            <FaPrint /> Export Packing Slip
          </button>
        </div>

        {/* MAIN WORKSPACE */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#f8fafc] custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT: LOGISTICS DATA */}
            <div className="lg:col-span-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Shipping Destination */}
                <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#ff356c]" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                    <FaLocationDot className="text-[#ff356c]" /> Logistics
                    Target
                  </h4>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-slate-900 uppercase">
                      {selectedOrder.deliveryAddress?.name}
                    </p>
                    <p className="text-xs font-bold text-slate-500 font-mono">
                      {selectedOrder.deliveryAddress?.phone}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed mt-3 border-t border-slate-50 pt-3 italic font-serif">
                      {selectedOrder.deliveryAddress?.line1}
                      <br />
                      {selectedOrder.deliveryAddress?.city},{" "}
                      {selectedOrder.deliveryAddress?.state} -{" "}
                      {selectedOrder.deliveryAddress?.pincode}
                    </p>
                  </div>
                </div>

                {/* Customer Identity */}
                <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                    <FaUserShield className="text-[#ff356c]" /> Client
                    Verification
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-slate-50 p-3 rounded-sm">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        Master Identity
                      </p>
                      <p className="text-xs font-bold text-[#ff356c] truncate">
                        {selectedOrder.userSnapshot?.email}
                      </p>
                    </div>
                    <div className="flex justify-between items-center p-3 border border-slate-100">
                      <p className="text-xs font-black font-mono text-slate-800">
                        {selectedOrder.userSnapshot?.phone}
                      </p>
                      <button
                        onClick={() =>
                          window.open(
                            `https://wa.me/${selectedOrder.userSnapshot?.phone?.replace(/\D/g, "")}`,
                            "_blank",
                          )
                        }
                        className="text-emerald-500 hover:scale-110 transition-transform active:scale-90">
                        <FaWhatsapp size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Manifest Table */}
              <div className="bg-white border border-slate-200 rounded-sm shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                    Asset Manifest
                  </h3>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    {selectedOrder.items?.length} Items Linked
                  </span>
                </div>
                <div className="divide-y divide-slate-100">
                  {selectedOrder.items?.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-6 p-5 hover:bg-slate-50/50 transition-colors">
                      <div className="w-16 h-20 bg-slate-100 border border-slate-200 rounded-sm overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0"
                          alt=""
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black text-slate-950 uppercase tracking-tight truncate">
                          {item.name}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                          Qty Code: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-slate-950 italic">
                          ₹{item.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: BILLING & ACTIONS */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-950 rounded-sm p-8 text-white shadow-xl relative overflow-hidden">
                <p className="text-[9px] font-black uppercase text-white/30 tracking-[0.3em] mb-2">
                  Total Valuation
                </p>
                <p className="text-5xl font-black text-[#ff356c] tracking-tighter flex items-center">
                  <FaIndianRupeeSign size={24} className="mr-1 text-white/20" />
                  {selectedOrder.totalAmount.toLocaleString()}
                </p>
                <div className="mt-8 space-y-4 text-[10px] font-black uppercase tracking-widest border-t border-white/10 pt-6">
                  <div className="flex justify-between">
                    <span className="text-white/40">Shipment Weight</span>
                    <span className="text-white">Calculated</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Fulfillment Cost</span>
                    <span className="text-emerald-400">Zero (Free)</span>
                  </div>
                </div>
              </div>

              {/* ACTION HUD */}
              <div className="space-y-3">
                {flowConfig?.next && (
                  <button
                    onClick={() => handleAction(selectedOrder, flowConfig.next)}
                    className="w-full py-5 bg-[#ff356c] hover:bg-[#e62e5d] text-white rounded-sm font-black text-[11px] uppercase tracking-[0.4em] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3">
                    <FaBox /> {flowConfig.btn}
                  </button>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleAction(selectedOrder, "cancelled")}
                    className="py-4 bg-white border border-rose-100 text-rose-500 rounded-sm font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 transition-all active:scale-95 flex items-center justify-center gap-2">
                    <FaCircleXmark /> Cancel
                  </button>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="py-4 bg-white border border-slate-200 text-slate-400 rounded-sm font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95">
                    Dismiss
                  </button>
                </div>
                <button
                  onClick={() => handleDelete(selectedOrder.id)}
                  className="w-full py-3 text-slate-300 hover:text-rose-600 transition-all text-[9px] font-black uppercase tracking-[0.4em] mt-4">
                  <FaTrashCan className="inline mr-2" /> Purge Entry Permanently
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
