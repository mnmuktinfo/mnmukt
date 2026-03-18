import {
  CheckCircle,
  ChevronRight,
  Navigation,
  X,
  XCircle,
} from "lucide-react";
import React from "react";
import TrackingTimeline from "./TrackingTimeline";

const TrackingCard = ({
  order,
  latestStep,
  trackingSteps,
  isModalOpen,
  setIsModalOpen,
}) => (
  <div className="bg-white sm:rounded-md sm:border border-gray-200">
    {/* Mobile Summary */}
    <div
      className="p-5 flex items-center justify-between sm:hidden active:bg-gray-50 cursor-pointer"
      onClick={() => setIsModalOpen(true)}>
      <div className="flex items-center gap-4">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            order.orderStatus === "delivered"
              ? "bg-[#E8F8F5]"
              : order.orderStatus === "cancelled"
                ? "bg-red-50"
                : "bg-blue-50"
          }`}>
          {order.orderStatus === "delivered" ? (
            <CheckCircle size={20} className="text-[#03A685]" />
          ) : order.orderStatus === "cancelled" ? (
            <XCircle size={20} className="text-[#FF3F6C]" />
          ) : (
            <Navigation size={20} className="text-blue-600" />
          )}
        </div>
        <div>
          <p className="text-[14px] font-bold text-[#282C3F]">
            {latestStep.status}
          </p>
          <p className="text-[12px] text-[#535766] mt-0.5">{latestStep.date}</p>
        </div>
      </div>
      <ChevronRight size={20} className="text-gray-400" />
    </div>

    {/* Desktop Timeline */}
    <div className="hidden sm:block p-6">
      <h3 className="text-[14px] font-bold text-[#282C3F] uppercase tracking-wide mb-6">
        Tracking Details
      </h3>
      <TrackingTimeline steps={trackingSteps} />
    </div>

    {/* Mobile Fullscreen Modal */}
    {isModalOpen && (
      <div className="fixed inset-0 z-[100] sm:hidden flex flex-col bg-white animate-in slide-in-from-bottom-full duration-300">
        <div className="h-14 flex items-center px-4 border-b border-gray-100 shrink-0">
          <button
            onClick={() => setIsModalOpen(false)}
            className="p-2 -ml-2 text-[#282C3F]">
            <X size={24} />
          </button>
          <h2 className="text-[15px] font-bold text-[#282C3F] ml-2 tracking-wide uppercase">
            Tracking Details
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-[#f5f5f6]">
          <div className="bg-white rounded-md p-6 border border-gray-200 shadow-sm">
            <TrackingTimeline steps={trackingSteps} />
          </div>
        </div>
      </div>
    )}
  </div>
);

export default TrackingCard;
