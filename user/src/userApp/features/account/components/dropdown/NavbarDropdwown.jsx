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
  { label: "Explore", icon: LayoutGrid, path: "/categories" },
];

const ACTIVITY_ITEMS = [
  { label: "My Orders", icon: Package, path: "/user/orders" },
  { label: "Wishlist", icon: Heart, path: "/wishlist" },
];

const NavbarDropdown = ({ isOpen, onClose, menuItems = [] }) => {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const asideRef = useRef(null);

  // Prevent background scrolling when menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key
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

  const firstName = user?.name?.split(" ")[0] || "Guest";

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[9998] bg-gray-100/40 backdrop-blur-sm transition-all duration-500 ease-in-out ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* Drawer Menu */}
      <aside
        ref={asideRef}
        className={`fixed top-0 left-0 h-full z-[9999] bg-white flex flex-col transition-transform duration-500 ease-out shadow-xl rounded-r-2xl md:rounded-r-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: "min(85vw, 360px)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-8 pb-6 border-b border-gray-200">
          <h2 className="text-2xl text-gray-800 tracking-wide font-serif">
            Menu
          </h2>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-all duration-300 active:scale-95">
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* User Profile */}
        <div className="px-6 py-6 border-b border-gray-200 bg-gray-50">
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-lg font-semibold text-gray-600 shadow-sm">
                {firstName[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[16px] text-gray-800 truncate">{`Welcome, ${firstName}`}</p>
                {user?.email && (
                  <p className="text-[12px] text-gray-500 truncate mt-0.5">
                    {user.email}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={() => go("/auth/login")}
              className="w-full flex items-center justify-between group p-3 -m-3 rounded-xl hover:bg-gray-50 transition-colors duration-300">
              <div className="flex items-center gap-4 text-gray-700 group-hover:text-gray-900 transition-colors">
                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:bg-gray-200 transition-colors duration-300">
                  <User
                    size={20}
                    strokeWidth={1.5}
                    className="text-gray-400 group-hover:text-gray-700 transition-colors"
                  />
                </div>
                <div className="text-left">
                  <span className="block text-[15px] font-medium font-serif">
                    Sign In
                  </span>
                  <span className="block text-[11px] text-gray-400 mt-0.5 uppercase tracking-wider">
                    Access your account
                  </span>
                </div>
              </div>
              <ChevronRight
                size={18}
                className="text-gray-300 group-hover:text-gray-700 transition-transform group-hover:translate-x-1"
              />
            </button>
          )}
        </div>

        {/* Scrollable Nav */}
        <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          <SectionLabel text="Discover" />
          {NAV_ITEMS.map((item) => (
            <DrawerItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              onClick={() => go(item.path)}
              hoverColor="gray-100"
            />
          ))}

          {menuItems.length > 0 && (
            <>
              <div className="my-4 border-t border-gray-100" />
              <SectionLabel text="Collections" />
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-6 py-3.5 text-[14px] transition-all duration-300 border-l-2 ${
                      isActive
                        ? "text-gray-800 font-medium bg-gray-50 border-gray-300"
                        : "text-gray-600 border-transparent hover:text-gray-800 hover:bg-gray-50 hover:border-gray-200"
                    }`
                  }>
                  <span className="tracking-wide">{item.label}</span>
                  <ChevronRight size={14} className="opacity-40" />
                </NavLink>
              ))}
            </>
          )}

          {isLoggedIn && (
            <>
              <div className="my-4 border-t border-gray-100" />
              <SectionLabel text="Your Account" />
              {ACTIVITY_ITEMS.map((item) => (
                <DrawerItem
                  key={item.path}
                  icon={item.icon}
                  label={item.label}
                  onClick={() => go(item.path)}
                  hoverColor="gray-100"
                />
              ))}
            </>
          )}

          <div className="my-4 border-t border-gray-100" />
          <SectionLabel text="Support" />
          <DrawerItem
            icon={HelpCircle}
            label="Customer Care"
            onClick={() => go("/contact-us")}
            hoverColor="gray-100"
          />
          <DrawerItem
            icon={Settings}
            label="Settings"
            onClick={() => go("/settings")}
            hoverColor="gray-100"
          />
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-6 border-t border-gray-200 bg-gray-50">
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-sm border border-gray-300 text-[12px] font-bold uppercase tracking-[0.15em] text-gray-700 hover:text-white hover:bg-gray-800 hover:border-gray-800 transition-all duration-300">
              <LogOut size={16} strokeWidth={1.5} />
              Sign Out
            </button>
          ) : (
            <button
              onClick={() => go("/auth/signup")}
              className="w-full py-4 rounded-sm bg-gray-200 text-gray-800 text-[12px] font-bold uppercase tracking-[0.2em] hover:bg-gray-300 transition-colors duration-300 shadow-sm">
              Create Account
            </button>
          )}
        </div>
      </aside>
    </>,
    document.body,
  );
};

/* ── Sub-components ── */
const SectionLabel = ({ text }) => (
  <p className="px-6 pt-5 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
    {text}
  </p>
);

const DrawerItem = ({
  icon: Icon,
  label,
  onClick,
  hoverColor = "gray-100",
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-6 py-3.5 text-[14px] text-gray-700 hover:text-gray-900 hover:bg-${hoverColor} border-l-2 border-transparent transition-all duration-300 group`}>
    <Icon
      size={18}
      strokeWidth={1.5}
      className="text-gray-400 group-hover:text-gray-700 transition-colors shrink-0"
    />
    <span className="tracking-wide">{label}</span>
  </button>
);

export default NavbarDropdown;
