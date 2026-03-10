import React from "react";

const OrderSummary = ({ subtotal, deliveryFee, total, itemCount }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

      <div className="flex justify-between text-sm mb-3">
        <span>Subtotal ({itemCount} items)</span>
        <span>₹ {subtotal}</span>
      </div>

      <div className="flex justify-between text-sm mb-3">
        <span>Delivery Fee</span>
        <span>{deliveryFee === 0 ? "Free" : `₹ ${deliveryFee}`}</span>
      </div>

      <hr className="my-4" />

      <div className="flex justify-between text-lg font-semibold mb-6">
        <span>Total</span>
        <span>₹ {total}</span>
      </div>

      <button className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition">
        Checkout
      </button>
    </div>
  );
};

export default OrderSummary;
