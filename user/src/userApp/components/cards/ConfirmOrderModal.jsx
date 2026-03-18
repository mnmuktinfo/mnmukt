import React from "react";
import { X } from "lucide-react";

const ConfirmOrderModal = ({
  isOpen,
  onCancel,
  onConfirm,
  title = "Confirm Cash on Delivery Order",
  message = "Pay via UPI or Cash when you receive your order",
  confirmColor = "#f43397", // Pink
  cancelColor = "#fff",
  confirmText = "Confirm order",
  cancelText = "Cancel",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white  max-w-sm w-full relative p-5 sm:p-6">
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>

        {/* Responsive Illustration */}
        <div className="flex justify-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-28 w-28 sm:h-32 sm:w-32"
            viewBox="0 0 64 64">
            {/* Circular background */}
            <circle cx="32" cy="32" r="30" fill="#ffe6f0" />

            {/* Cash icon */}
            <rect x="12" y="24" width="40" height="24" rx="3" fill="#ff79b0" />
            <line
              x1="20"
              y1="32"
              x2="44"
              y2="32"
              stroke="#fff"
              strokeWidth="2"
            />
            <line
              x1="32"
              y1="24"
              x2="32"
              y2="48"
              stroke="#fff"
              strokeWidth="2"
            />

            {/* Checkmark */}
            <path
              d="M22 34l8 8 16-16"
              stroke="#f43397"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Animated confetti */}
            {Array.from({ length: 12 }).map((_, i) => (
              <rect
                key={i}
                x={Math.random() * 60 + 2}
                y={Math.random() * 60 + 2}
                width={2 + Math.random() * 2}
                height={4 + Math.random() * 4}
                fill={["#f43397", "#ff79b0", "#ffcae0"][i % 3]}
                className="animate-flicker"
                style={{ animationDelay: `${Math.random()}s` }}
              />
            ))}
          </svg>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 text-center mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-center text-purple-600 text-sm sm:text-[14px] mb-5 sm:mb-6">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onCancel}
            style={{ backgroundColor: cancelColor }}
            className="flex-1 px-5 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors text-sm sm:text-base">
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            style={{ backgroundColor: confirmColor }}
            className="flex-1 px-5 py-2 text-white font-semibold hover:brightness-90 transition-all text-sm sm:text-base">
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmOrderModal;
