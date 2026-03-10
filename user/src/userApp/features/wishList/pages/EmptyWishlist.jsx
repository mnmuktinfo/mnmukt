import React from "react";
import { Link } from "react-router-dom";

const EmptyWishlist = () => {
  return (
    <div className="text-center py-20 text-gray-500 flex flex-col items-center gap-4">
      {/* ❤️ Editable SVG */}
      <svg width="81" height="95" viewBox="0 0 81 95" className="w-24 h-24">
        <path
          d="M70.73 5.855c-1.053-3.89-43.3.21-64.51 1.83l5.266 83.03 64.071-5.305c-1.17-24.897-3.774-75.666-4.827-79.555z"
          fill="#fff"
          stroke="#FF356C" // ⭐ change border color
          strokeWidth=".8"
        />
        <path
          d="M65.594 2.219c-1.536-3.723-43.193 5.648-64.163 9.92l15.616 81.627 63.291-13.308C76.064 55.93 67.131 5.942 65.594 2.219z"
          fill="#fff"
          stroke="#FF356C" // ⭐ change border color
          strokeWidth=".8"
        />
        <path
          d="M41.442 61.85L28.655 49.064a9.047 9.047 0 0 1-2.668-6.44c0-2.433.948-4.721 2.668-6.442 3.521-3.522 9.233-3.55 12.791-.088 3.554-3.454 9.26-3.423 12.779.096a9.044 9.044 0 0 1 2.667 6.438 9.045 9.045 0 0 1-2.667 6.439L41.442 61.85zm-6.345-26.272c-1.805 0-3.61.687-4.985 2.061a7.001 7.001 0 0 0-2.064 4.984c0 1.883.734 3.653 2.065 4.984l11.329 11.329 11.327-11.327a7 7 0 0 0 2.063-4.981c0-1.882-.733-3.65-2.064-4.981a7.053 7.053 0 0 0-9.963 0l-1.37 1.359-1.358-1.37a7.02 7.02 0 0 0-4.98-2.058z"
          fill="#FF356C" // ⭐ main heart color
        />
      </svg>

      <h2 className="text-lg font-semibold text-gray-800">
        Your Wishlist is Empty
      </h2>

      <p className="text-gray-500">Add items you love to your wishlist ❤️</p>

      <Link
        to="/collections/all"
        className="bg-[#FF3F6C] uppercase text-white font-semibold py-1.5 px-4  mt-5 shadow hover:bg-pink-600 transition">
        Browse Products
      </Link>
    </div>
  );
};

export default EmptyWishlist;
