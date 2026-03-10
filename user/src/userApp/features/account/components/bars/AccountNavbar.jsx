import React from "react";
import { Link } from "react-router-dom";
import { User } from "lucide-react";
import { COLORS } from "../../../style/theme";
import { IMAGES } from "../../../assets/images"; // make sure logo is exported from images/index.js

const AccountNavbar = () => {
  return (
    <nav
      className="w-full px-4 sm:px-6 py-3 flex items-center justify-between shadow-md sticky top-0 bg-white z-50"
      style={{ borderBottom: `1px solid ${COLORS.secondary}30` }}>
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2">
        <img
          src={IMAGES.logo} // use local asset
          alt="Babli Kurti Logo"
          className="h-10 sm:h-12 w-auto object-contain"
        />
      </Link>

      {/* Middle Navigation (hidden on mobile) */}
      <div className="hidden md:flex items-center gap-6">
        <Link
          to="/user/orders"
          className="font-medium hover:text-gray-800 transition text-sm sm:text-base"
          style={{ color: COLORS.primary }}>
          Orders
        </Link>

        <Link
          to="/user/return-exchange"
          className="font-medium hover:text-gray-800 transition text-sm sm:text-base"
          style={{ color: COLORS.primary }}>
          Return / Exchange
        </Link>

        <Link
          to="/user/wishlist"
          className="font-medium hover:text-gray-800 transition text-sm sm:text-base"
          style={{ color: COLORS.primary }}>
          Wishlist
        </Link>
      </div>

      {/* Profile Icon */}
      <Link
        to="/user/profile"
        className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-orange-400 hover:opacity-90 transition">
        <User size={20} className="text-white" />
      </Link>

      {/* Mobile Hamburger (optional) */}
      <div className="md:hidden flex items-center gap-3">
        {/* You can add a mobile menu icon here if needed */}
      </div>
    </nav>
  );
};

export default AccountNavbar;
