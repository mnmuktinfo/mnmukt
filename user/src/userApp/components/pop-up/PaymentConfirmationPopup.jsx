import React, { useEffect, useState } from "react";
import {
  Check,
  Smartphone,
  X,
  ShieldCheck,
  Copy,
  ExternalLink,
  Clock,
} from "lucide-react";

const PaymentConfirmationPopup = ({
  visible,
  orderId,
  onClose,
  whatsappNumber,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (visible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => (document.body.style.overflow = "unset");
  }, [visible]);

  if (!visible) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(whatsappNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center md:items-center p-0 md:p-6 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* Main Card Container */}
      <div className="bg-white w-full md:max-w-[460px] flex flex-col relative overflow-hidden rounded-t-2xl md:rounded-sm shadow-2xl animate-in slide-in-from-bottom-full md:slide-in-from-bottom-0 md:zoom-in-95 duration-300">
        {/* 1. TOP PROGRESS BAR */}
        <div className="h-1.5 bg-gray-100 w-full relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full bg-[#007673] w-1/2 animate-[pulse_2s_ease-in-out_infinite]" />
        </div>

        {/* 2. HEADER */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white relative">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 rounded-full p-1.5 flex items-center justify-center">
              <Check size={14} className="text-green-600" strokeWidth={3} />
            </div>
            <span className="text-[13px] font-bold text-gray-900 uppercase tracking-widest">
              Order Placed
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-full p-1.5 transition-colors">
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* 3. CONTENT AREA */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Order Summary Box */}
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-sm border border-gray-200">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">
                Order ID
              </p>
              <p className="text-[14px] font-bold text-gray-900">{orderId}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">
                Status
              </p>
              <p className="text-[12px] font-bold text-orange-500 flex items-center justify-end gap-1.5">
                <Clock size={12} strokeWidth={2.5} /> Awaiting Payment
              </p>
            </div>
          </div>

          {/* Text Information block */}
          <div className="space-y-2 text-center md:text-left px-2">
            <h2 className="text-[16px] font-bold text-gray-900 tracking-tight">
              Final Step: Verify Payment
            </h2>
            <p className="text-[13px] text-gray-600 leading-relaxed">
              We process payments exclusively through our WhatsApp Support to
              ensure personalized service and 100% secure transactions.
            </p>
          </div>

          {/* Action Card */}
          <div className="border border-[#007673]/20 rounded-sm overflow-hidden bg-white shadow-sm">
            <div className="p-3 bg-[#007673]/5 flex items-center justify-center gap-2 border-b border-[#007673]/10">
              <Smartphone size={16} className="text-[#007673]" />
              <span className="text-[11px] font-bold text-[#007673] uppercase tracking-widest">
                Payment Gateway
              </span>
            </div>

            <div className="p-6 space-y-5">
              <div
                onClick={handleCopy}
                className="flex items-center justify-between cursor-pointer group bg-gray-50 hover:bg-gray-100 p-4 rounded-sm border border-gray-200 transition-all">
                <div>
                  <p className="text-[18px] font-bold text-gray-900 tracking-wider">
                    +91 {whatsappNumber}
                  </p>
                  <p
                    className={`text-[10px] font-bold uppercase tracking-wide mt-1 transition-colors ${copied ? "text-green-600" : "text-gray-500"}`}>
                    {copied ? "✓ Copied!" : "Tap to copy number"}
                  </p>
                </div>
                <div className="bg-white p-2 rounded-sm shadow-sm border border-gray-200 text-gray-400 group-hover:text-[#007673] transition-colors">
                  <Copy size={16} strokeWidth={1.5} />
                </div>
              </div>

              <a
                href={`https://wa.me/${whatsappNumber}?text=Hi,%20I%20want%20to%20complete%20the%20payment%20for%20my%20order%20%2A${orderId}%2A.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] text-white flex items-center justify-center gap-2 py-3.5 rounded-sm text-[13px] font-bold uppercase tracking-widest hover:bg-[#1da851] transition-all shadow-sm">
                Message on WhatsApp <ExternalLink size={16} strokeWidth={2} />
              </a>
            </div>
          </div>

          {/* Secure Badge */}
          <div className="flex items-center justify-center gap-1.5 pt-2">
            <ShieldCheck size={14} className="text-[#007673]" strokeWidth={2} />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
              100% Secure Transaction
            </span>
          </div>
        </div>

        {/* 4. FOOTER */}
        <div className="p-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Mnmukt
          </span>
          <button
            onClick={onClose}
            className="text-[11px] font-bold text-[#007673] hover:underline uppercase tracking-widest transition-all">
            Go to Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmationPopup;
