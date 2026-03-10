import React, { useEffect, useState } from "react";
import {
  FaXmark,
  FaCircleCheck,
  FaCircleExclamation,
  FaTriangleExclamation,
  FaCircleInfo,
} from "react-icons/fa6";

const Notification = ({ type = "info", message, onClose, duration = 4000 }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      const interval = setInterval(() => {
        setProgress((prev) => Math.max(0, prev - 100 / (duration / 10)));
      }, 10);

      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [duration, onClose]);

  const STATUS_MAP = {
    success: {
      icon: <FaCircleCheck className="text-emerald-500" />,
      accent: "bg-emerald-500",
      label: "Registry Update",
    },
    error: {
      icon: <FaCircleExclamation className="text-rose-500" />,
      accent: "bg-rose-500",
      label: "System Failure",
    },
    warning: {
      icon: <FaTriangleExclamation className="text-amber-500" />,
      accent: "bg-amber-500",
      label: "Authorization Warning",
    },
    info: {
      icon: <FaCircleInfo className="text-[#ff356c]" />,
      accent: "bg-[#ff356c]",
      label: "Status Manifest",
    },
  };

  const config = STATUS_MAP[type] || STATUS_MAP.info;

  return (
    <div className="fixed top-24 right-8 z-[999] w-full max-w-[360px] animate-in fade-in slide-in-from-right-10 duration-700">
      <div className="relative overflow-hidden bg-white border border-gray-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] flex items-center p-6 gap-5 rounded-sm">
        {/* Left Status Bar: Thin and Minimal */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 ${config.accent}`}
        />

        {/* Icon Interface */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gray-50 flex items-center justify-center text-lg rounded-sm">
            {config.icon}
          </div>
        </div>

        {/* Intelligence Content */}
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400 mb-1.5 leading-none">
            {config.label}
          </p>
          <p className="text-[11px] font-bold text-gray-900 uppercase tracking-tight leading-tight">
            {message}
          </p>
        </div>

        {/* Close Protocol */}
        <button
          onClick={onClose}
          className="p-2 text-gray-300 hover:text-gray-950 transition-all active:scale-75">
          <FaXmark size={14} />
        </button>

        {/* Precision Progress Bar */}
        <div className="absolute bottom-0 left-0 h-[2px] bg-gray-50 w-full">
          <div
            className={`h-full transition-all linear ${config.accent}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default Notification;
