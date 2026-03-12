import React from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

const Toast = ({ type, msg, onClose }) => (
  <div
    className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3.5 rounded-sm shadow-xl border text-sm font-bold max-w-xs ${type === "success" ? "bg-green-50 border-green-300 text-green-800" : "bg-red-50 border-red-300 text-red-800"}`}>
    {type === "success" ? (
      <CheckCircle2 size={16} />
    ) : (
      <AlertCircle size={16} />
    )}
    <span className="flex-1">{msg}</span>
    <button onClick={onClose} className="opacity-60 hover:opacity-100">
      <X size={14} />
    </button>
  </div>
);

export default Toast;
