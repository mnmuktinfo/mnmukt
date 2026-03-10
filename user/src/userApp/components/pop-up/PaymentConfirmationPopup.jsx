import React, { useEffect, useState } from "react";
import {
  Check,
  Smartphone,
  X,
  ShieldCheck,
  Copy,
  ExternalLink,
  Clock,
  Package,
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

  // const orderId = `MN-${Math.floor(100000 + Math.random() * 900000)}`;

  return (
    <div className="fixed inset-0 z-[200] bg-slate-50 flex items-center justify-center font-sans p-4 md:p-6 animate-in fade-in duration-300">
      {/* Main Card Container */}
      <div className="bg-white w-full max-w-[500px] shadow-2xl shadow-slate-200 flex flex-col relative overflow-hidden rounded-sm border border-slate-100">
        {/* 1. TOP PROGRESS BAR (Amazon Style) */}
        <div className="h-1 bg-slate-100 w-full">
          <div className="h-full bg-[#ff356c] w-full animate-progress-fast" />
        </div>

        {/* 2. HEADER */}
        <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center bg-white">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 rounded-full p-1">
              <Check size={12} className="text-white" strokeWidth={4} />
            </div>
            <span className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">
              Order Placed Successfully
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* 3. CONTENT AREA */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          {/* Order Summary Box */}
          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-sm border border-slate-100">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Order ID
              </p>
              <p className="text-sm font-black text-slate-900">{orderId}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Verification
              </p>
              <p className="text-xs font-bold text-[#ff356c] flex items-center gap-1 justify-end">
                <Clock size={12} /> Awaiting Payment
              </p>
            </div>
          </div>

          {/* Amazon-Type Information block */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Final Step: Verify Acquisition
            </h2>
            <p className="text-[13px] text-slate-600 leading-relaxed">
              We process payments exclusively through our{" "}
              <span className="font-bold text-slate-900">
                WhatsApp Concierge
              </span>{" "}
              to ensure personalized support and secure transactions.
            </p>
          </div>

          {/* The "Action Card" (Myntra Style Colors) */}
          <div className="border border-slate-200 rounded-sm overflow-hidden">
            <div className="p-4 bg-slate-50/50 flex items-center gap-3 border-b border-slate-100">
              <Smartphone size={18} className="text-slate-400" />
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                Payment Gateway
              </span>
            </div>

            <div className="p-6 space-y-6">
              <div
                onClick={handleCopy}
                className="flex items-center justify-between cursor-pointer group">
                <div>
                  <p className="text-2xl font-black text-slate-900 tracking-tighter">
                    +91 {whatsappNumber}
                  </p>
                  <p className="text-[10px] text-[#ff356c] font-bold uppercase mt-1">
                    {copied ? "✓ Copied to clipboard" : "Click to copy number"}
                  </p>
                </div>
                <div className="bg-slate-100 p-2 group-hover:bg-slate-200 transition-colors">
                  <Copy size={16} className="text-slate-500" />
                </div>
              </div>

              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-slate-900 text-white flex items-center justify-center gap-2 py-4 text-[12px] font-bold uppercase tracking-widest hover:bg-black transition-all active:scale-[0.98]">
                Go to WhatsApp <ExternalLink size={14} />
              </a>
            </div>
          </div>

          {/* Secure Badge */}
          <div className="flex items-center justify-center gap-2 py-2">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              100% Secure Transaction Protocol
            </span>
          </div>
        </div>

        {/* 4. FOOTER (Myntra Style Thin) */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.3em]">
              Mnmukt
            </span>
            <span className="text-[9px] text-slate-400 italic">
              Purity in Essence
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[11px] font-bold text-slate-500 hover:text-slate-900 border-b border-slate-300 pb-0.5">
            Manage Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmationPopup;
