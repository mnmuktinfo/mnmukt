import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Heart,
  CreditCard,
  Headset,
  MapPin,
  User,
  ShieldCheck,
  ChevronRight,
  LogOut,
  Bell,
  Settings,
  Star,
} from "lucide-react";
import ProfileHeader from "../components/section/ProfileHeader";
import { useAuth } from "../features/auth/context/UserContext";
import { useCart } from "../features/cart/context/CartContext";
import { useWishlist } from "../features/wishList/context/WishlistContext";
const ProfilePage = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const { cart } = useCart();
  const { wishlist } = useWishlist();

  // 3. Calculate counts (assuming items are stored in an array)
  const cartCount = cart?.length || 0;
  const wishlistCount = wishlist?.length || 0;
  // --- SKELETON LOADING (Mnmukt Style) ---
  if (loading)
    return (
      <div className="bg-white min-h-screen p-8 animate-pulse">
        <div className="w-12 h-12 bg-slate-50 rounded-full mb-8" />
        <div className="h-10 w-48 bg-slate-50 mb-12" />
        <div className="space-y-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 border-b border-slate-50" />
          ))}
        </div>
      </div>
    );

  // --- GUEST GUARD (Mnmukt Style) ---
  if (!user)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 text-center">
        <div className="w-16 h-16 border border-slate-100 rounded-full flex items-center justify-center mb-8">
          <User size={24} className="text-slate-200" />
        </div>
        <h2 className="text-3xl font-light tracking-tighter text-slate-900 mb-2">
          Your{" "}
          <span className="italic font-serif text-[#ff356c]">Account.</span>
        </h2>
        <p className="text-slate-400 text-sm mb-10 max-w-xs">
          Sign in to access your curated collections and track your recent
          acquisitions.
        </p>
        <button
          onClick={() => navigate("/auth/login")}
          className="bg-slate-950 text-white px-12 py-4 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-[#ff356c] transition-all">
          Authenticate
        </button>
      </div>
    );

  const accountLinks = [
    { label: "Personal Details", icon: User, path: "/user/edit" },
    { label: "Shipping Directory", icon: MapPin, path: "/user/addresses" },
    { label: "Payment Vault", icon: CreditCard, path: "/user/payments" },
    { label: "Notifications", icon: Bell, path: "/notifications" },
    { label: "Preferences", icon: Settings, path: "/settings" },
  ];

  const supportLinks = [
    { label: "Concierge", icon: Headset, path: "/contact-us" },
    { label: "Privacy Protocol", icon: ShieldCheck, path: "/privacy-policy" },
    { label: "Legal Terms", icon: Star, path: "/terms" },
  ];

  return (
    <div className="bg-white min-h-screen pb-24 font-sans">
      {/* 1. DYNAMIC HEADER */}
      <ProfileHeader
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        user={user}
        loading={loading}
      />

      <div className="max-w-2xl mx-auto px-6">
        {/* 2. PRIMARY NAVIGATION (Clean Horizontal) */}
        <div className="grid grid-cols-2 gap-4 mb-16 mt-8">
          <button
            onClick={() => navigate("/user/orders")}
            className="flex flex-col items-start gap-4 p-6 border border-slate-50 bg-slate-50/30 hover:bg-white hover:border-slate-200 transition-all group">
            <Package size={20} className="text-[#ff356c]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">
              Purchases
            </span>
          </button>
          <button
            onClick={() => navigate("/wishlist")}
            className="flex flex-col items-start gap-4 p-6 border border-slate-50 bg-slate-50/30 hover:bg-white hover:border-slate-200 transition-all group">
            <Heart size={20} className="text-[#ff356c]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">
              Wishlist
            </span>
          </button>
        </div>

        {/* 3. MENU GROUPS (Minimalist List) */}
        <div className="space-y-16">
          {/* Account Group */}
          <div>
            <h3 className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em] mb-6">
              Security & Identity
            </h3>
            <div className="flex flex-col">
              {accountLinks.map((item, i) => (
                <button
                  key={i}
                  onClick={() => navigate(item.path)}
                  className="flex items-center justify-between py-5 border-b border-slate-50 group transition-all">
                  <div className="flex items-center gap-6">
                    <item.icon
                      size={18}
                      className="text-slate-300 group-hover:text-[#ff356c] transition-colors"
                    />
                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-950">
                      {item.label}
                    </span>
                  </div>
                  <ChevronRight
                    size={14}
                    className="text-slate-200 group-hover:translate-x-1 transition-transform"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Support Group */}
          <div>
            <h3 className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em] mb-6">
              Orders
            </h3>
            <div className="flex flex-col">
              {supportLinks.map((item, i) => (
                <button
                  key={i}
                  onClick={() => navigate(item.path)}
                  className="flex items-center justify-between py-5 border-b border-slate-50 group">
                  <div className="flex items-center gap-6">
                    <item.icon
                      size={18}
                      className="text-slate-300 group-hover:text-[#ff356c] transition-colors"
                    />
                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-950">
                      {item.label}
                    </span>
                  </div>
                  <ChevronRight size={14} className="text-slate-200" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4. LOGOUT & FOOTER */}
        <div className="mt-20">
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="w-full flex items-center justify-center gap-4 py-5 text-[#ff356c] font-black text-[10px] uppercase tracking-[0.5em] border border-slate-100 hover:bg-red-50 transition-colors">
            <LogOut size={16} />
            De-Authenticate
          </button>

          <div className="mt-16 flex flex-col items-center">
            <div className="w-1 h-8 bg-slate-100 mb-4" />
            <p className="text-[9px] font-black text-slate-900 uppercase tracking-[0.6em]">
              MNMUKT
            </p>
            <p className="text-[8px] text-slate-300 mt-2 uppercase tracking-widest">
              Digital Essence 2.0.4
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
