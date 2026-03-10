import React from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Camera,
  ChevronLeft,
  Settings,
  ShieldCheck,
  Star,
} from "lucide-react";

const ProfileHeader = ({ user, cartCount, wishlistCount, loading }) => {
  const navigate = useNavigate();

  // --- MNMUKT SKELETON ---
  if (loading) {
    return (
      <div className="bg-white border-b border-slate-50">
        <div className="h-14 flex items-center px-6 border-b border-slate-50">
          <div className="w-4 h-4 bg-slate-50 rounded-full" />
        </div>
        <div className="p-8 flex items-center space-x-6">
          <div className="w-20 h-20 bg-slate-50 rounded-full" />
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-slate-50 w-1/4" />
            <div className="h-2 bg-slate-50 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  const userName = user?.name || "Guest Connoisseur";
  const userEmail = user?.email || "Welcome to Mnmukt";

  return (
    <div className="bg-white border-b border-slate-50 font-sans">
      {/* --- A. TOP NAV BAR (Minimalist & White) --- */}
      <div className="flex items-center justify-between px-6 h-16 bg-white">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 hover:text-[#ff356c] transition-colors group">
          <ChevronLeft
            size={18}
            className="text-slate-400 group-hover:text-[#ff356c]"
          />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 group-hover:text-slate-900">
            Back
          </span>
        </button>

        <h1 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-900">
          Identity
        </h1>

        <button onClick={() => navigate("/settings")} className="p-2 group">
          <Settings
            size={18}
            className="text-slate-300 group-hover:text-[#ff356c] transition-colors"
          />
        </button>
      </div>

      {/* --- B. USER INFO (Luxury Boutique Style) --- */}
      <div className="px-8 py-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-6">
          {/* Avatar with Minimal Pink Border */}
          <div className="relative">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border border-slate-100 p-1 overflow-hidden">
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-50 flex items-center justify-center">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={32} className="text-slate-200" strokeWidth={1} />
                )}
              </div>
            </div>
            <button className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-sm border border-slate-50 text-slate-400 hover:text-[#ff356c] transition-colors">
              <Camera size={12} />
            </button>
          </div>

          {/* Identity Text */}
          <div className="space-y-1">
            <h2 className="text-3xl font-light tracking-tighter text-slate-900 leading-none">
              {userName.split(" ")[0]}{" "}
              <span className="italic font-serif text-[#ff356c]">
                {userName.split(" ")[1] || ""}
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
              {userEmail}
            </p>

            {/* Status Badge */}
            <div className="pt-2 flex items-center gap-2">
              <ShieldCheck size={12} className="text-[#ff356c]" />
              <span className="text-[9px] font-black text-slate-900 uppercase tracking-[0.2em]">
                Verified Member
              </span>
            </div>
          </div>
        </div>

        {/* Premium Indicator (Mnmukt Gold/Pink) */}
        {user?.isPremium && (
          <div className="self-start md:self-center flex items-center gap-2 border border-red-100 bg-red-50/30 px-4 py-2 rounded-full">
            <Star size={10} fill="#ff356c" className="text-[#ff356c]" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#ff356c]">
              Elite Connoisseur
            </span>
          </div>
        )}
      </div>

      {/* --- C. UTILITY ROW (Minimalist HUD Style) --- */}
      <div className="grid grid-cols-3 border-t border-slate-50">
        <button
          onClick={() => navigate("/orders")}
          className="py-8 text-center hover:bg-slate-50 transition-colors border-r border-slate-50">
          <span className="block text-xl font-light text-slate-900 mb-1">
            {cartCount || 0}
          </span>
          <span className="text-[9px] text-slate-300 font-black uppercase tracking-[0.3em]">
            Cart Items
          </span>
        </button>

        <button
          onClick={() => navigate("/wishlist")}
          className="py-8 text-center hover:bg-slate-50 transition-colors border-r border-slate-50">
          <span className="block text-xl font-light text-slate-900 mb-1">
            {wishlistCount || 0}
          </span>
          <span className="text-[9px] text-slate-300 font-black uppercase tracking-[0.3em]">
            Wishlist
          </span>
        </button>

        <button
          onClick={() => navigate("/wallet")}
          className="py-8 text-center hover:bg-slate-50 transition-colors">
          <span className="block text-xl font-light text-[#ff356c] mb-1">
            ₹{user?.wallet || 0}
          </span>
          <span className="text-[9px] text-slate-300 font-black uppercase tracking-[0.3em]">
            Credits
          </span>
        </button>
      </div>
    </div>
  );
};

export default ProfileHeader;
