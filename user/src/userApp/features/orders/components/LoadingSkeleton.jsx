import React from "react";

// ─── LOADING & ERROR ───
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-[#f5f5f6] animate-pulse">
    <div className="h-14 bg-white mb-2 border-b border-gray-100"></div>
    <div className="max-w-3xl mx-auto space-y-2 px-4">
      <div className="h-24 bg-white rounded-md"></div>
      <div className="h-16 bg-white rounded-md"></div>
      <div className="h-48 bg-white rounded-md"></div>
    </div>
  </div>
);

export default LoadingSkeleton;
