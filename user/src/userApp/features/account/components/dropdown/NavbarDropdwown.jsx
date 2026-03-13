import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { NavLink, useNavigate } from "react-router-dom";
import {
  X,
  ChevronRight,
  User,
  LogOut,
  Settings,
  HelpCircle,
  Home,
  Package,
  Heart,
  LayoutGrid,
} from "lucide-react";
import { useAuth } from "../../../auth/context/UserContext";

const NAV_ITEMS = [
  { label: "Home", icon: Home, path: "/" },
  { label: "Archive", icon: LayoutGrid, path: "/categories" },
];

const ACTIVITY_ITEMS = [
  { label: "My Orders", icon: Package, path: "/user/orders" },
  { label: "Wishlist", icon: Heart, path: "/wishlist" },
];

const NavbarDropdown = ({ isOpen, onClose, menuItems = [] }) => {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const asideRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const handleLogout = async () => {
    await logout();
    onClose();
    navigate("/");
  };
  const go = (path) => {
    onClose();
    navigate(path);
  };

  const firstName = user?.name?.split(" ")[0] || "User";

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[9998] bg-black/30 transition-opacity duration-200 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* Drawer */}
      <aside
        ref={asideRef}
        className={`fixed top-0 left-0 h-full z-[9999] bg-white flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          width: "min(85vw, 300px)",
          boxShadow: isOpen ? "4px 0 20px rgba(0,0,0,0.08)" : "none",
        }}>
        {/* ── Header ───────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="text-[13px] font-semibold text-gray-800">Menu</span>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* ── User info ───────────────────────────── */}
        <div className="px-5 py-4 border-b border-gray-100">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-[13px] font-bold text-gray-600 shrink-0">
                {firstName[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-gray-800 truncate">
                  {firstName}
                </p>
                {user?.email && (
                  <p className="text-[11px] text-gray-400 truncate">
                    {user.email}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={() => go("/auth/login")}
              className="flex items-center gap-2 text-[13px] font-medium text-gray-600 hover:text-gray-900 transition-colors">
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                <User size={16} strokeWidth={1.5} className="text-gray-400" />
              </div>
              <span>Sign In</span>
              <ChevronRight size={14} className="text-gray-400" />
            </button>
          )}
        </div>

        {/* ── Scrollable body ─────────────────────── */}
        <div className="flex-1 overflow-y-auto py-2">
          <SectionLabel text="Navigate" />
          {NAV_ITEMS.map((item) => (
            <DrawerItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              onClick={() => go(item.path)}
            />
          ))}

          {menuItems.length > 0 && (
            <>
              <SectionLabel text="Collections" />
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-5 py-2.5 text-[13px] transition-colors ${
                      isActive
                        ? "text-gray-900 font-medium bg-gray-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`
                  }>
                  <span>{item.label}</span>
                  <ChevronRight size={13} className="text-gray-300" />
                </NavLink>
              ))}
            </>
          )}

          {isLoggedIn && (
            <>
              <SectionLabel text="Activity" />
              {ACTIVITY_ITEMS.map((item) => (
                <DrawerItem
                  key={item.path}
                  icon={item.icon}
                  label={item.label}
                  onClick={() => go(item.path)}
                />
              ))}
            </>
          )}

          <SectionLabel text="More" />
          <DrawerItem
            icon={HelpCircle}
            label="Support"
            onClick={() => go("/contact-us")}
          />
          <DrawerItem
            icon={Settings}
            label="Settings"
            onClick={() => go("/settings")}
          />
        </div>

        {/* ── Footer ──────────────────────────────── */}
        <div className="px-4 py-4 border-t border-gray-100">
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-red-100 text-[12px] font-medium text-red-500 hover:bg-red-50 transition-colors">
              <LogOut size={14} strokeWidth={1.5} />
              Sign Out
            </button>
          ) : (
            <button
              onClick={() => go("/auth/signup")}
              className="w-full py-2.5 rounded-lg bg-gray-900 text-white text-[12px] font-medium hover:bg-gray-700 transition-colors">
              Create Account
            </button>
          )}
        </div>
      </aside>
    </>,
    document.body,
  );
};

/* ── Helpers ──────────────────────────────────────── */

const SectionLabel = ({ text }) => (
  <p className="px-5 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
    {text}
  </p>
);

const DrawerItem = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-5 py-2.5 text-[13px] text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
    <Icon size={15} strokeWidth={1.5} className="text-gray-400 shrink-0" />
    <span>{label}</span>
  </button>
);

export default NavbarDropdown;
