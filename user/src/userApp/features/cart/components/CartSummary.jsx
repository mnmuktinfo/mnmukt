import React from "react";

const CartSummary = ({
  subtotal,
  originalTotalPrice,
  platformFee = 0,
  selectedItems,
  onPlaceOrder,
  btnText = "Place Order",
}) => {
  const total = subtotal + platformFee;
  const discountOnMrp = Number((originalTotalPrice - subtotal).toFixed(2));

  return (
    <div className="bg-white w-full max-w-md mx-auto font-sans">
      {/* HUD Header */}
      <h2 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-8">
        Price Details — {selectedItems.length}{" "}
        {selectedItems.length === 1 ? "Item" : "Items"}
      </h2>

      <div className="space-y-4">
        {/* Total MRP */}
        <div className="flex justify-between items-baseline">
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
            Total MRP
          </span>
          <span className="text-sm font-medium text-slate-900 tracking-tighter">
            ₹{originalTotalPrice}
          </span>
        </div>

        {/* Discount */}
        <div className="flex justify-between items-baseline">
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
            Exclusivity Discount
          </span>
          <span className="text-sm font-medium text-[#ff356c] tracking-tighter">
            −₹{discountOnMrp}
          </span>
        </div>

        {/* Platform Fee */}
        <div className="flex justify-between items-baseline">
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
            Logistics Protocol
          </span>
          <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
            {platformFee === 0 ? "Complimentary" : `₹${platformFee}`}
          </span>
        </div>

        {/* Divider */}
        <div className="pt-4 border-b border-slate-100" />

        {/* Total */}
        <div className="flex justify-between items-center pt-2">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-900">
            Total Amount
          </span>
          <span className="text-xl font-light text-slate-900 tracking-tighter italic font-serif">
            ₹{total}
          </span>
        </div>
      </div>

      {/* Primary Action */}
      <button
        onClick={onPlaceOrder}
        className="w-full mt-10 py-5 bg-slate-950 text-white text-[10px] font-black uppercase tracking-[0.5em] hover:bg-[#ff356c] transition-all duration-500 shadow-2xl shadow-slate-200">
        {btnText}
      </button>
    </div>
  );
};

export default CartSummary;
