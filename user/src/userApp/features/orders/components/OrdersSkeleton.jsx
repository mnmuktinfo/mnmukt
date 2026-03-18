import React from "react";

const OrdersSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-white border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/50">
          <div className="h-3 bg-gray-100 w-24 rounded" />
        </div>
        <div className="px-5 py-5 flex gap-5">
          <div className="w-24 h-32 bg-gray-100 flex-shrink-0" />
          <div className="flex-1 space-y-3 pt-1">
            <div className="h-4 bg-gray-100 w-3/4 rounded" />
            <div className="h-3 bg-gray-100 w-1/3 rounded" />
            <div className="h-5 bg-gray-100 w-1/4 rounded" />
            <div className="h-3 bg-gray-100 w-1/2 rounded" />
          </div>
        </div>
        <div className="px-5 pb-5">
          <div className="h-10 bg-gray-100 w-36 rounded" />
        </div>
      </div>
    ))}
  </div>
);

export default OrdersSkeleton;
