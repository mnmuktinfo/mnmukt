import React, { useState } from "react";

// Helper component for the SVG icons to keep the main code clean
const Icons = {
  Tag: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-gray-400">
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
      <path d="M7 7h.01" />
    </svg>
  ),
  Ticket: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-gray-400">
      <rect width="20" height="13" x="2" y="5.5" rx="2" ry="2" />
      <path d="M2 12h20" />
      <path d="M6 5.5v13" />
      <path d="M18 5.5v13" />
    </svg>
  ),
  Gift: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-[#007673]">
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
    </svg>
  ),
  Wallet: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-gray-400">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  ),
  ChevronDown: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-gray-400">
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
};

const CartSummary = ({
  subtotal,
  originalTotalPrice,
  platformFee = 0,
  selectedItems,
  onPlaceOrder,
  btnText = "PLACE ORDER",
}) => {
  // State for the gift wrap checkbox
  const [isGiftWrap, setIsGiftWrap] = useState(false);

  const discountOnMrp = Number((originalTotalPrice - subtotal).toFixed(2));

  // Mocking GST based on subtotal
  const gstAmount = Number((subtotal * 0.05).toFixed(2));

  // Calculate total, dynamically adding ₹25 if gift wrap is selected
  const total = subtotal + platformFee + gstAmount + (isGiftWrap ? 25 : 0);

  return (
    <div className="w-full font-sans flex flex-col gap-4">
      {/* 1. Primary Action Button (Moved to top like the image) */}
      <button
        onClick={onPlaceOrder}
        className="w-full py-3.5 bg-[#007673] text-white text-[13px] font-bold uppercase tracking-wide rounded-sm hover:bg-[#005f5c] transition-colors shadow-sm">
        {btnText}
      </button>

      {/* 2. Membership Promo Banner */}
      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-[#e8cbf5] to-[#f4d5ef] px-4 py-2.5 text-center text-[10px] font-black tracking-widest text-gray-900">
          YOU ARE MISSING OUT ON!
        </div>
        <div className="p-4">
          <div className="flex justify-between items-center gap-4 mb-3">
            <p className="text-[12px] text-gray-700 leading-snug">
              Save an additional <span className="font-bold">₹190</span> by
              adding membership to your cart.
            </p>
            <button className="border border-[#007673] text-[#007673] bg-white px-5 py-1.5 text-[11px] font-bold rounded-sm hover:bg-[#007673] hover:text-white transition-colors">
              ADD
            </button>
          </div>
          <div className="border-t border-dashed border-gray-200 pt-3">
            <p className="text-[11px] text-gray-400">
              Free shipping on all orders
            </p>
            <button className="text-[11px] font-bold text-gray-800 mt-1 flex items-center gap-1 hover:text-[#007673] transition-colors">
              View all benefits <Icons.ChevronDown />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Expandable Coupon & Voucher Options */}
      <div className="bg-white border border-gray-200 rounded-sm shadow-sm divide-y divide-gray-100">
        {/* Apply Coupon */}
        <div className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3 text-[13px] text-gray-700 font-medium">
            <Icons.Tag /> Apply Coupon
          </div>
          <Icons.ChevronDown />
        </div>

        {/* Gift Voucher */}
        <div className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3 text-[13px] text-gray-700 font-medium">
            <Icons.Ticket /> Gift Voucher
          </div>
          <Icons.ChevronDown />
        </div>

        {/* Gift Wrap (Interactive Checkbox) */}
        <div
          className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setIsGiftWrap(!isGiftWrap)}>
          <div className="flex items-center gap-3 text-[13px] text-gray-700 font-medium">
            <Icons.Gift /> Gift Wrap (₹ 25)
          </div>
          <input
            type="checkbox"
            checked={isGiftWrap}
            onChange={() => setIsGiftWrap(!isGiftWrap)}
            className="w-4 h-4 accent-[#007673] cursor-pointer"
          />
        </div>

        {/* TSS Money / Points */}
        <div className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3 text-[13px] text-gray-700 font-medium">
            <Icons.Wallet /> TSS Money / TSS Points
          </div>
          <Icons.ChevronDown />
        </div>
      </div>

      {/* 4. Billing Details Box */}
      <div className="bg-white border border-gray-200 rounded-sm p-4 sm:p-5 shadow-sm">
        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-5">
          Billing Details
        </h3>

        <div className="space-y-3">
          {/* Cart Total */}
          <div className="flex justify-between text-[13px] text-gray-600">
            <span>
              Cart Total{" "}
              <span className="text-[10px] text-gray-400 ml-1">
                (Excl. of all taxes)
              </span>
            </span>
            <span className="font-bold text-gray-800">
              ₹ {subtotal.toFixed(2)}
            </span>
          </div>

          {/* Discount */}
          {discountOnMrp > 0 && (
            <div className="flex justify-between text-[13px] text-gray-600">
              <span>Product Discount</span>
              <span className="font-bold text-[#007673]">
                −₹ {discountOnMrp.toFixed(2)}
              </span>
            </div>
          )}

          {/* GST */}
          <div className="flex justify-between text-[13px] text-gray-600">
            <span>
              GST{" "}
              <span className="text-[10px] text-[#007673] ml-1 cursor-pointer hover:underline">
                (view details)
              </span>
            </span>
            <span className="font-bold text-gray-800">
              ₹ {gstAmount.toFixed(2)}
            </span>
          </div>

          {/* Conditional Gift Wrap Charge */}
          {isGiftWrap && (
            <div className="flex justify-between text-[13px] text-gray-600">
              <span>Gift Wrap</span>
              <span className="font-bold text-gray-800">₹ 25.00</span>
            </div>
          )}

          {/* Shipping Charges */}
          <div className="flex justify-between text-[13px] text-gray-600 border-b border-gray-100 pb-4">
            <span>Shipping Charges</span>
            <span className="text-[#007673] font-bold uppercase text-[12px]">
              {platformFee === 0 ? "Free" : `₹ ${platformFee.toFixed(2)}`}
            </span>
          </div>

          {/* Total Payable */}
          <div className="flex justify-between items-center pt-2">
            <span className="text-[14px] font-bold text-gray-900">
              Total Payable
            </span>
            <span className="text-[16px] font-bold text-gray-900">
              ₹ {total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
