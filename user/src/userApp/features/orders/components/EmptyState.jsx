import React from "react";
import { ShoppingBag } from "lucide-react";

const EmptyState = ({ navigate, isCancelled }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center px-8 animate-in fade-in duration-500">
    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
      <ShoppingBag size={22} className="text-gray-200" />
    </div>
    <h2
      className="text-xl sm:text-2xl font-light text-gray-900 mb-2"
      style={{ fontFamily: "'Playfair Display', serif" }}>
      {isCancelled ? "No Cancelled Orders" : "No Orders Yet"}
    </h2>
    <p className="text-[11px] text-gray-400 uppercase tracking-[0.25em] mb-8 leading-loose max-w-xs">
      {isCancelled
        ? "You haven't cancelled any orders."
        : "Your first order is just a click away."}
    </p>
    {!isCancelled && (
      <button
        onClick={() => navigate("/")}
        className="px-8 py-3.5 bg-gray-900 text-white text-[10px] font-semibold uppercase tracking-[0.3em] hover:bg-gray-800 transition-colors">
        Explore Collection
      </button>
    )}
  </div>
);

export default EmptyState;
