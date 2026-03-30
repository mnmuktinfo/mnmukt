import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HeartIcon,
  ShoppingBagIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

import { useAuth } from "../features/auth/context/UserContext";
import { useCart } from "../features/cart/context/CartContext";
import { useWishlist } from "../features/wishList/context/WishlistContext";

/* ─── The Brand Accent Color ─── */
const BRAND_HEX = "#da127d";

/* ─── Zara-Style + Accent Components ───────────────── */

const Info = ({ label, value }) => (
  <div className="flex justify-between py-3 border-b border-gray-200 last:border-0">
    <span className="text-gray-500 text-[12px] uppercase tracking-widest">
      {label}
    </span>
    <span className="text-[13px] text-black tracking-wide">{value}</span>
  </div>
);

const Row = ({ label, sub, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between py-5 border-b border-gray-200 last:border-0 hover:bg-pink-50/30 transition-colors px-2 group">
    <div className="text-left">
      {/* Text highlights pink on hover */}
      <div className="text-[13px] uppercase tracking-widest text-black group-hover:text-[#da127d] transition-colors">
        {label}
      </div>
      {sub && (
        <div className="text-[11px] text-gray-400 tracking-wider mt-1.5">
          {sub}
        </div>
      )}
    </div>
    {/* Chevron highlights pink on hover */}
    <ChevronRightIcon className="w-4 h-4 text-gray-300 group-hover:text-[#da127d] transition-colors stroke-1" />
  </button>
);

const Tile = ({ icon: Icon, label, count, onClick }) => (
  <button
    onClick={onClick}
    className="flex-1 flex flex-col items-center justify-center py-8 border border-gray-200 hover:border-[#da127d] transition-colors group bg-white relative overflow-hidden">
    {/* Subtle pink glow at the bottom of the tile on hover */}
    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#da127d] translate-y-full group-hover:translate-y-0 transition-transform duration-300" />

    <div className="relative mb-4 text-black group-hover:text-[#da127d] group-hover:scale-110 transition-all duration-500">
      <Icon className="w-6 h-6 stroke-1" />
      {count > 0 && (
        <span className="absolute -top-2 -right-2 text-[9px] bg-[#da127d] text-white w-4 h-4 flex items-center justify-center rounded-full shadow-sm">
          {count}
        </span>
      )}
    </div>
    <span className="text-[10px] tracking-[0.2em] uppercase text-black group-hover:text-[#da127d] transition-colors">
      {label}
    </span>
  </button>
);

/* ─── MAIN PAGE ───────────────── */

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, address, authLoading, logout } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();

  const [showAddress, setShowAddress] = useState(false);

  if (authLoading) return null;
  if (!user) {
    navigate("/auth/login");
    return null;
  }

  const displayName = user.name || "USER";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const cartCount = cart?.length || 0;
  const wishlistCount = wishlist?.length || 0;

  const memberSince = user.createdAt?.seconds
    ? new Date(user.createdAt.seconds * 1000).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : "-";

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-[#da127d] selection:text-white">
      {/* ── HEADER ── */}
      <div className="border-b border-gray-200 px-6 py-6 text-center bg-white/95 backdrop-blur-sm sticky top-0 z-10">
        <h1 className="text-[12px] tracking-[0.25em] text-black">MY ACCOUNT</h1>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-[320px_1fr] gap-16 lg:gap-24">
        {/* ── LEFT PANEL ── */}
        <div className="space-y-10">
          {/* Profile Details */}
          <div className="flex flex-col items-center text-center space-y-5 pb-8 border-b border-gray-200">
            <div className="relative w-20 h-20 rounded-full border border-gray-300 flex items-center justify-center text-xl font-light tracking-widest bg-white">
              {initials}
              {/* Small online indicator accent */}
              <div className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>

            <div>
              <div className="text-[15px] tracking-[0.15em] uppercase text-black mb-1">
                {displayName}
              </div>
              <div className="text-[12px] text-gray-500 tracking-wide">
                {user.email}
              </div>
            </div>

            <button
              onClick={() => navigate("/user/edit")}
              className="text-[10px] tracking-[0.2em] border-b border-[#da127d] text-[#da127d] pb-0.5 hover:text-[#b90f6a] hover:border-[#b90f6a] transition-colors uppercase">
              Edit Profile
            </button>
          </div>

          {/* Stats Tiles */}
          <div className="flex gap-4 w-full">
            <Tile
              icon={ShoppingBagIcon}
              label="Orders"
              count={cartCount}
              onClick={() => navigate("/user/orders")}
            />
            <Tile
              icon={HeartIcon}
              label="Wishlist"
              count={wishlistCount}
              onClick={() => navigate("/wishlist")}
            />
          </div>

          {/* Info */}
          <div className="pt-4 space-y-2">
            <Info label="Member since" value={memberSince} />
            <Info label="Phone" value={user.phone || "-"} />
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="space-y-12 pt-4 md:pt-0">
          {/* Account */}
          <div>
            <h2 className="text-[11px] text-gray-400 tracking-[0.2em] mb-4 border-b border-gray-200 pb-4">
              SETTINGS
            </h2>
            <div>
              <Row
                label="Personal Details"
                sub="Name, phone, and identity"
                onClick={() => navigate("/user/edit")}
              />
              <Row
                label="Saved Addresses"
                sub={
                  address
                    ? `${address.city}, ${address.state}`
                    : "Manage delivery locations"
                }
                onClick={() => setShowAddress(true)}
              />
              <Row
                label="Payments"
                sub="Cards & UPI methods"
                onClick={() => navigate("/user/edit")}
              />
            </div>
          </div>

          {/* Support */}
          <div>
            <h2 className="text-[11px] text-gray-400 tracking-[0.2em] mb-4 border-b border-gray-200 pb-4">
              HELP & SUPPORT
            </h2>
            <div>
              <Row label="Help Center" onClick={() => {}} />
              <Row label="Privacy Policy" onClick={() => {}} />
            </div>
          </div>

          {/* Logout */}
          <div className="pt-8">
            <button
              onClick={handleLogout}
              className="text-[11px] tracking-[0.2em] uppercase text-gray-400 hover:text-[#da127d] transition-colors">
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* ── ADDRESS MODAL ── */}
      {showAddress && (
        <div
          onClick={() => setShowAddress(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-md p-10 shadow-2xl relative overflow-hidden">
            {/* Subtle top brand line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-[#da127d]" />

            <h3 className="text-[13px] tracking-[0.2em] mb-8 border-b border-gray-200 pb-4 text-center">
              DELIVERY ADDRESS
            </h3>

            {address ? (
              <div className="text-[13px] leading-relaxed text-gray-800 text-center mb-10">
                <span className="block mb-2 font-medium">{displayName}</span>
                {address.line1} <br />
                {address.city}, {address.state} <br />
                PIN: {address.pincode}
              </div>
            ) : (
              <div className="text-[13px] tracking-wide text-gray-400 text-center mb-10">
                No address currently saved.
              </div>
            )}

            <button
              onClick={() => {
                setShowAddress(false);
                navigate("/user/edit");
              }}
              className="w-full bg-[#da127d] text-white text-[11px] tracking-[0.2em] py-4 hover:bg-[#b90f6a] transition-colors uppercase shadow-md shadow-pink-500/20">
              {address ? "Edit Address" : "Add Address"}
            </button>

            <button
              onClick={() => setShowAddress(false)}
              className="w-full text-center text-[10px] tracking-[0.2em] uppercase text-gray-400 mt-6 hover:text-black transition-colors">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
