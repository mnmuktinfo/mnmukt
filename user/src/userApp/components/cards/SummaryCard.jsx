import React from "react";

const SummaryCard = () => {
  return (
    <div className="w-full md:w-1/3 bg-gray-50 p-4 rounded">
      <h3 className="font-semibold mb-3">Delivery Estimates</h3>
      <div className="mb-4">
        <p>
          Delivery between <strong>27 Nov - 29 Nov</strong>
        </p>
      </div>
      <h3 className="font-semibold mb-2">Price Details (2 Items)</h3>
      <div className="text-gray-700 mb-2">
        <p>Total MRP: ₹5,997</p>
        <p>Discount on MRP: -₹3,123</p>
        <p>
          Platform Fee:{" "}
          <span className="text-pink-500 cursor-pointer">Know More</span>: ₹23
        </p>
      </div>
      <hr className="my-2" />
      <p className="font-bold text-lg">Total Amount: ₹2,897</p>
      <button className="mt-4 w-full bg-pink-500 text-white py-3 rounded hover:bg-pink-600 transition-all">
        CONTINUE
      </button>
    </div>
  );
};

export default SummaryCard;
