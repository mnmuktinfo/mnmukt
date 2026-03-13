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
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import { useAuth } from "../features/auth/context/UserContext";
import { useCart } from "../features/cart/context/CartContext";
import { useWishlist } from "../features/wishList/context/WishlistContext";

/* ─────────────────────────────────────────
   QUICK TILE
───────────────────────────────────────── */
const QuickTile = ({ icon: Icon, label, badge, onClick }) => (
  <button
    onClick={onClick}
    className="flex-1 flex flex-col items-center gap-2.5 py-4 px-2 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all active:scale-95">
    <div className="relative">
      <Icon size={20} strokeWidth={1.5} className="text-gray-600" />
      {badge > 0 && (
        <span className="absolute -top-1.5 -right-2 bg-gray-800 text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center leading-none">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </div>
    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider leading-none">
      {label}
    </span>
  </button>
);

/* ─────────────────────────────────────────
   MENU ROW
───────────────────────────────────────── */
const MenuRow = ({ icon: Icon, label, sub, onClick, danger = false }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3.5 px-4 py-3.5 border-b border-gray-100 last:border-0 transition-colors text-left ${
      danger ? "hover:bg-red-50" : "hover:bg-gray-50"
    }`}>
    <div
      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
        danger ? "bg-red-50" : "bg-gray-100"
      }`}>
      <Icon
        size={15}
        strokeWidth={1.5}
        className={danger ? "text-red-500" : "text-gray-500"}
      />
    </div>
    <div className="flex-1 min-w-0">
      <p
        className={`text-[13px] font-medium ${danger ? "text-red-600" : "text-gray-800"}`}>
        {label}
      </p>
      {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
    <ChevronRight
      size={14}
      className="text-gray-300 shrink-0"
      strokeWidth={2}
    />
  </button>
);

/* ─────────────────────────────────────────
   SECTION WRAPPER
───────────────────────────────────────── */
const Section = ({ title, children }) => (
  <div>
    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2 px-1">
      {title}
    </p>
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {children}
    </div>
  </div>
);

/* ─────────────────────────────────────────
   SKELETON
───────────────────────────────────────── */
const Skeleton = () => (
  <div className="min-h-screen bg-gray-50 px-4 py-8">
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-6">
      <div className="md:w-[280px] h-48 bg-white border border-gray-200 rounded-xl animate-pulse" />
      <div className="flex-1 space-y-4">
        <div className="h-20 bg-white border border-gray-200 rounded-xl animate-pulse" />
        <div className="h-52 bg-white border border-gray-200 rounded-xl animate-pulse" />
        <div className="h-32 bg-white border border-gray-200 rounded-xl animate-pulse" />
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────
   PROFILE PAGE
───────────────────────────────────────── */
const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, authLoading, actionLoading, logout } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();

  if (authLoading) return <Skeleton />;
  if (!user) {
    navigate("/auth/login");
    return null;
  }

  const firstName = user.name?.split(" ")[0] || "User";
  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";
  const cartCount = cart?.length || 0;
  const wishlistCount = wishlist?.length || 0;

  const accountItems = [
    {
      label: "Personal Details",
      icon: User,
      path: "/user/edit",
      sub: "Name, DOB & gender",
    },
    {
      label: "Addresses",
      icon: MapPin,
      path: "/user/addresses",
      sub: "Saved delivery locations",
    },
    {
      label: "Payments",
      icon: CreditCard,
      path: "/user/payments",
      sub: "Cards & UPI",
    },
    {
      label: "Notifications",
      icon: Bell,
      path: "/notifications",
      sub: "Orders & alerts",
    },
    { label: "Settings", icon: Settings, path: "/settings" },
  ];

  const supportItems = [
    {
      label: "Help & Support",
      icon: Headset,
      path: "/contact-us",
      sub: "Contact our team",
    },
    { label: "Privacy & Terms", icon: ShieldCheck, path: "/privacy-policy" },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <main className="max-w-5xl mx-auto px-4 py-6 md:py-10">
        <div className="flex flex-col md:flex-row gap-6">
          {/* ── LEFT: Identity card ──────────────── */}
          <aside className="w-full md:w-[280px] shrink-0 space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-full bg-gray-800 text-white flex items-center justify-center text-[20px] font-bold mx-auto mb-3">
                {initials}
              </div>

              {/* Name */}
              <h2 className="text-[15px] font-semibold text-gray-900">
                {firstName}
              </h2>
              <p className="text-[11px] text-gray-400 truncate px-2 mt-0.5">
                {user.email}
              </p>

              {/* Divider */}
              <div className="border-t border-gray-100 mt-4 pt-4 flex">
                <button
                  onClick={() => navigate("/checkout/cart")}
                  className="flex-1 flex flex-col items-center gap-1 hover:bg-gray-50 py-1.5 rounded-lg transition-colors">
                  <span className="text-[18px] font-bold text-gray-800 leading-none">
                    {cartCount}
                  </span>
                  <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">
                    In Bag
                  </span>
                </button>
                <div className="w-px bg-gray-100" />
                <button
                  onClick={() => navigate("/wishlist")}
                  className="flex-1 flex flex-col items-center gap-1 hover:bg-gray-50 py-1.5 rounded-lg transition-colors">
                  <span className="text-[18px] font-bold text-gray-800 leading-none">
                    {wishlistCount}
                  </span>
                  <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">
                    Saved
                  </span>
                </button>
              </div>
            </div>

            {/* Mobile quick tiles */}
            <div className="flex gap-2 md:hidden">
              <QuickTile
                icon={Package}
                label="Orders"
                badge={0}
                onClick={() => navigate("/user/orders")}
              />
              <QuickTile
                icon={Heart}
                label="Wishlist"
                badge={wishlistCount}
                onClick={() => navigate("/wishlist")}
              />
              <QuickTile
                icon={Sparkles}
                label="Rewards"
                badge={0}
                onClick={() => navigate("/user/rewards")}
              />
            </div>
          </aside>

          {/* ── RIGHT: Content ───────────────────── */}
          <section className="flex-1 min-w-0 space-y-5">
            {/* Desktop quick tiles */}
            <div className="hidden md:flex gap-3">
              <QuickTile
                icon={ShoppingBag}
                label="My Orders"
                badge={0}
                onClick={() => navigate("/user/orders")}
              />
              <QuickTile
                icon={Heart}
                label="Wishlist"
                badge={wishlistCount}
                onClick={() => navigate("/wishlist")}
              />
              <QuickTile
                icon={Sparkles}
                label="Rewards"
                badge={0}
                onClick={() => navigate("/user/rewards")}
              />
            </div>

            {/* Account settings */}
            <Section title="Account">
              {accountItems.map((item) => (
                <MenuRow
                  key={item.path}
                  {...item}
                  onClick={() => navigate(item.path)}
                />
              ))}
            </Section>

            {/* Support */}
            <Section title="Support & Legal">
              {supportItems.map((item) => (
                <MenuRow
                  key={item.path}
                  {...item}
                  onClick={() => navigate(item.path)}
                />
              ))}
            </Section>

            {/* Sign out */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <MenuRow
                icon={LogOut}
                label={actionLoading ? "Signing out…" : "Sign Out"}
                danger
                onClick={handleLogout}
              />
            </div>

            {/* Footer */}
            <p className="text-center text-[10px] text-gray-300 font-medium uppercase tracking-widest py-2">
              Mnmukt · v2.0.4
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
