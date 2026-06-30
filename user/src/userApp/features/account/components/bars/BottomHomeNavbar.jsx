import React, { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../auth/context/UserContext";

import {
  HomeIcon as HomeOutline,
  ShoppingCartIcon as ShopOutline,
  HeartIcon as HeartOutline,
  ChatBubbleOvalLeftIcon as SupportOutline,
  UserIcon as UserOutline,
} from "@heroicons/react/24/outline";

import {
  HomeIcon as HomeSolid,
  ShoppingCartIcon as ShopSolid,
  HeartIcon as HeartSolid,
  ChatBubbleOvalLeftIcon as SupportSolid,
  UserIcon as UserSolid,
} from "@heroicons/react/24/solid";

// Custom Return Icon to match design
const ReturnOutline = ({ className, style }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}>
    <rect
      x="9"
      y="9"
      width="6"
      height="7"
      rx="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 11h6" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 6a8.5 8.5 0 0 1 11.5 4.5"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 7.5v3h-3" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16 18a8.5 8.5 0 0 1-11.5-4.5"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 16.5v-3h3" />
  </svg>
);

const ReturnSolid = ({ className, style }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
    viewBox="0 0 24 24"
    fill="currentColor">
    <rect x="9" y="9" width="6" height="7" rx="1" />
    <path
      fillRule="evenodd"
      d="M8.2 5.8a8.5 8.5 0 0 1 11.5 4.5h2a10.5 10.5 0 0 0-14.2-5.5L6 3.3v4.2h4.2L8.2 5.8zm7.6 12.4a8.5 8.5 0 0 1-11.5-4.5h-2a10.5 10.5 0 0 0 14.2 5.5l1.5 1.5v-4.2h-4.2l2 2z"
      clipRule="evenodd"
    />
  </svg>
);

/**
 * BottomNavbar Component
 * Mobile-first navigation bar with user icon, wishlist badge, and protected routes
 * @param {number} wishlistCount - Number of items in wishlist (default: 0)
 * @param {number} cartCount - Number of items in cart (default: 0)
 * @param {Function} onCartClick - Callback when cart icon is clicked
 */
const BottomNavbar = ({
  wishlistCount = 0,
  cartCount = 0,
  onCartClick = () => {},
}) => {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Handles protected routes that require authentication
   */
  const handleProtectedRoute = (path) => {
    if (isLoggedIn || user) {
      navigate(path);
    } else {
      navigate("/auth/login", {
        state: { from: location.pathname },
        replace: true,
      });
    }
  };

  /**
   * Navigation items configuration with proper badge handling
   */
  const navItems = useMemo(
    () => [
      {
        id: "home",
        name: "Home",
        path: "/",
        IconOutline: HomeOutline,
        IconSolid: HomeSolid,
        protected: false,
      },
      {
        id: "shop",
        name: "Shop",
        path: "/collections/all",
        IconOutline: ShopOutline,
        IconSolid: ShopSolid,
        protected: false,
      },
      {
        id: "returns",
        name: "Return",
        path: "/returns",
        IconOutline: ReturnOutline,
        IconSolid: ReturnSolid,
        protected: false,
      },
      {
        id: "wishlist",
        name: "Wishlist",
        path: "/wishlist",
        IconOutline: HeartOutline,
        IconSolid: HeartSolid,
        badge: Math.max(0, wishlistCount), // Ensure non-negative
        protected: true,
      },

      {
        id: "support",
        name: "Support",
        path: "/support",
        IconOutline: SupportOutline,
        IconSolid: SupportSolid,
        protected: true,
      },
    ],
    [wishlistCount],
  );

  /**
   * Render badge with proper styling
   */
  const renderBadge = (count) => {
    if (!count || count <= 0) return null;

    const displayCount = count > 99 ? "99+" : count;

    return (
      <span
        className="absolute -top-1.5 -right-2 text-white text-[9px] font-bold rounded-full min-w-[16px] h-[16px] px-1 flex items-center justify-center shadow-sm transition-all duration-200"
        style={{
          backgroundColor: "#ef4444",
          lineHeight: "1",
        }}>
        {displayCount}
      </span>
    );
  };

  /**
   * Render individual nav item
   */
  const renderNavItem = (item) => {
    const isActive = location.pathname === item.path;
    const Icon = isActive ? item.IconSolid : item.IconOutline;

    const handleClick = () => {
      if (item.protected) {
        handleProtectedRoute(item.path);
      } else {
        navigate(item.path);
      }
    };

    return (
      <li key={item.id} className="flex-1 h-full">
        <button
          onClick={handleClick}
          className="w-full h-full flex flex-col items-center justify-center gap-1 transition-transform active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 rounded-lg"
          aria-current={isActive ? "page" : undefined}
          aria-label={item.name}>
          {/* Icon Container with Badge */}
          <div className="relative flex items-center justify-center mt-1">
            <Icon
              className="w-[22px] h-[22px] transition-colors duration-200"
              style={{
                color: isActive ? "#111827" : "#374151",
              }}
              aria-hidden="true"
            />

            {/* Badge - Display for wishlist and cart */}
            {renderBadge(item.badge)}
          </div>

          {/* Label */}
          <span
            className="text-[11px] font-normal transition-colors duration-200"
            style={{
              color: isActive ? "#111827" : "#4b5563",
            }}>
            {item.name}
          </span>
        </button>
      </li>
    );
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 pb-[env(safe-area-inset-bottom)] flex justify-center pointer-events-none">
      <nav
        className="bg-white rounded-[2rem] shadow-[0_4px_25px_rgba(0,0,0,0.08)] border border-gray-100 w-full max-w-md pointer-events-auto overflow-hidden"
        aria-label="Mobile navigation">
        <ul className="flex justify-around items-center h-[64px] px-2">
          {navItems.map(renderNavItem)}
        </ul>
      </nav>
    </div>
  );
};

export default React.memo(BottomNavbar);
