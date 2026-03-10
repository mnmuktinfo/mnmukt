import React from "react";

const CartSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Title Skeleton */}
      <div className="mb-10 animate-pulse">
        <div className="h-8 w-48 bg-gray-300 rounded-lg mb-2" />
        <div className="h-4 w-24 bg-gray-200 rounded-md" />
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:gap-12 lg:items-start animate-pulse">
        {/* LEFT COLUMN: CART ITEMS (Span 7/12) */}
        <div className="lg:col-span-7">
          {/* Header Row */}
          <div className="border-b border-gray-200 pb-4 mb-6 flex justify-between">
            <div className="h-4 w-20 bg-gray-200 rounded" />
            <div className="h-4 w-12 bg-gray-200 rounded" />
          </div>

          {/* Items List */}
          <div className="space-y-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex gap-6 py-2">
                {/* Product Image - Modern Aspect Ratio */}
                <div className="h-32 w-32 flex-shrink-0 overflow-hidden rounded-xl bg-gray-300" />

                <div className="flex flex-1 flex-col justify-between">
                  <div className="grid grid-cols-2 gap-x-4">
                    {/* Title & Options */}
                    <div>
                      <div className="h-5 w-3/4 bg-gray-300 rounded mb-2" />
                      <div className="h-4 w-1/2 bg-gray-200 rounded mb-2" />
                      <div className="h-4 w-1/4 bg-gray-100 rounded" />
                    </div>
                    {/* Price - Aligned Right */}
                    <div className="flex justify-end">
                      <div className="h-5 w-20 bg-gray-300 rounded" />
                    </div>
                  </div>

                  {/* Actions (Qty / Remove) */}
                  <div className="flex items-center justify-between mt-4">
                    {/* Quantity Pill */}
                    <div className="h-9 w-24 bg-gray-100 rounded-lg border border-gray-200" />

                    {/* Remove Link */}
                    <div className="h-4 w-16 bg-gray-200 rounded hover:bg-gray-300 transition-colors" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: ORDER SUMMARY (Span 5/12) */}
        <div className="lg:col-span-5 mt-12 lg:mt-0">
          <div className="bg-gray-50 rounded-2xl p-6 lg:p-8 space-y-6">
            <div className="h-6 w-32 bg-gray-300 rounded mb-6" />

            {/* Calculations */}
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                  <div className="h-4 w-16 bg-gray-200 rounded" />
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 my-4" />

            {/* Total */}
            <div className="flex items-center justify-between mb-6">
              <div className="h-5 w-20 bg-gray-300 rounded" />
              <div className="h-5 w-24 bg-gray-300 rounded" />
            </div>

            {/* Checkout Button - Big & Prominent */}
            <div className="h-14 w-full bg-gray-300 rounded-xl" />

            {/* Trust Badges / Small Text */}
            <div className="flex justify-center mt-4 gap-2">
              <div className="h-3 w-40 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSkeleton;
