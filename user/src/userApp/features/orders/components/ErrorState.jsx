import React from "react";
import { XCircle, RefreshCw } from "lucide-react";

const ErrorState = ({ onRetry }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center px-8">
    <XCircle size={32} className="text-gray-200 mb-4" />
    <p className="text-sm text-gray-500 mb-6">
      Something went wrong fetching your orders.
    </p>
    <button
      onClick={onRetry}
      className="flex items-center gap-2 px-6 py-3 border border-gray-200 text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-600 hover:border-gray-400 transition-colors">
      <RefreshCw size={12} /> Retry
    </button>
  </div>
);

export default ErrorState;
