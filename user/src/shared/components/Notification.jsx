import React, { useEffect, useState } from "react";
import { X, CheckCircle2, AlertCircle, Info, HelpCircle } from "lucide-react";

const Notification = ({ type = "info", message, onClose, duration = 4000 }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);

      // Smooth progress bar logic
      const interval = setInterval(() => {
        setProgress((prev) => Math.max(0, prev - 100 / (duration / 10)));
      }, 10);

      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [duration, onClose]);

  // Premium Status Configuration
  const STATUS_MAP = {
    success: {
      icon: <CheckCircle2 size={18} className="text-green-500" />,
      accent: "bg-green-500",
      label: "Success",
    },
    error: {
      icon: <AlertCircle size={18} className="text-red-500" />,
      accent: "bg-red-500",
      label: "Error",
    },
    warning: {
      icon: <AlertCircle size={18} className="text-amber-500" />,
      accent: "bg-amber-500",
      label: "Warning",
    },
    info: {
      icon: <Info size={18} className="text-blue-500" />,
      accent: "bg-black",
      label: "Update",
    },
  };

  const config = STATUS_MAP[type] || STATUS_MAP.info;

  return (
    <div className="fixed top-6 right-6 z-[300] w-full max-w-[340px] animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="relative overflow-hidden bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-gray-100 flex items-center p-4 gap-4">
        {/* Left Status Accent Line */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1.5 ${config.accent}`}
        />

        {/* Icon with Soft Background */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
            {config.icon}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 pr-2">
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-0.5">
            {config.label}
          </p>
          <p className="text-sm font-medium text-gray-900 leading-snug">
            {message}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-all">
          <X size={16} strokeWidth={2.5} />
        </button>

        {/* Progress Bar Timer */}
        <div className="absolute bottom-0 left-0 h-[3px] bg-gray-100 w-full">
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
