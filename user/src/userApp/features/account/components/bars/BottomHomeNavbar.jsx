import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../auth/context/UserContext";

import {
  HomeIcon as HomeOutline,
  Squares2X2Icon as ExploreOutline,
  SparklesIcon as TaruvedaOutline,
  HeartIcon as HeartOutline,
  UserIcon as UserOutline,
} from "@heroicons/react/24/outline";

import {
  HomeIcon as HomeSolid,
  Squares2X2Icon as ExploreSolid,
  SparklesIcon as TaruvedaSolid,
  HeartIcon as HeartSolid,
  UserIcon as UserSolid,
} from "@heroicons/react/24/solid";

const THEME_COLOR = "#da127d"; // ✅ YOUR SITE PINK (match everywhere)

const BottomNavbar = ({ wishlistCount = 0 }) => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleProtected = (path) => {
    if (isLoggedIn) {
      navigate(path);
    } else {
      navigate("/auth/login", {
        state: { from: location.pathname },
        replace: true,
      });
    }
  };

  const navItems = [
    { name: "Home", path: "/", IconOutline: HomeOutline, IconSolid: HomeSolid },
    {
      name: "Explore",
      path: "/categories",
      IconOutline: ExploreOutline,
      IconSolid: ExploreSolid,
    },
    {
      name: "Taruveda",
      path: "/taruveda-organic-shampoo-oil",
      IconOutline: TaruvedaOutline,
      IconSolid: TaruvedaSolid,
    },
    {
      name: "Saved",
      path: "/wishlist",
      IconOutline: HeartOutline,
      IconSolid: HeartSolid,
      badge: wishlistCount,
    },
    {
      name: "Profile",
      path: "/user/profile",
      IconOutline: UserOutline,
      IconSolid: UserSolid,
      protected: true,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 w-full bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)]">
      <ul className="flex justify-around items-center h-[60px] px-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = isActive ? item.IconSolid : item.IconOutline;

          return (
            <li key={item.name} className="flex-1 h-full">
              <button
                onClick={() =>
                  item.protected
                    ? handleProtected(item.path)
                    : navigate(item.path)
                }
                className="w-full h-full flex flex-col items-center justify-center gap-1 transition-transform active:scale-95">
                {/* ICON */}
                <div className="relative flex items-center justify-center mt-1">
                  <Icon
                    className="w-6 h-6 transition-colors duration-200"
                    style={{
                      color: isActive ? THEME_COLOR : "#4b5563",
                    }}
                  />

                  {/* BADGE */}
                  {item.badge > 0 && (
                    <span
                      className="absolute -top-1.5 -right-2.5 text-white text-[9px] font-bold rounded-full min-w-[16px] h-[16px] px-1 flex items-center justify-center border-[1.5px] border-white shadow-sm"
                      style={{ backgroundColor: THEME_COLOR }}>
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </div>

                {/* LABEL */}
                <span
                  className="text-[11px] font-medium transition-colors duration-200"
                  style={{
                    color: isActive ? THEME_COLOR : "#6b7280",
                  }}>
                  {item.name}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default React.memo(BottomNavbar);
