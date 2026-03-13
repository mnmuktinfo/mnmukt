import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, LayoutGrid, Leaf, Heart, User } from "lucide-react";
import { useAuth } from "../../../auth/context/UserContext";

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
    { name: "Home", path: "/", icon: Home },
    { name: "Explore", path: "/categories", icon: LayoutGrid },
    { name: "Taruveda", path: "/taruveda-organic-shampoo-oil", icon: Leaf },
    { name: "Saved", path: "/wishlist", icon: Heart, badge: wishlistCount },
    { name: "Profile", path: "/user/profile", icon: User, protected: true },
  ];

  return (
    <nav className="fixed md:hidden bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-200 z-[100] pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.04)] font-sans">
      <ul className="flex justify-between items-center h-[64px] px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <li key={item.name} className="flex-1 h-full relative">
              <button
                type="button"
                onClick={() =>
                  item.protected
                    ? handleProtected(item.path)
                    : navigate(item.path)
                }
                className="w-full h-full flex flex-col items-center justify-center gap-1 relative transition-transform active:scale-90 group">
                {/* Premium Active Top Border */}
                <div
                  className={`absolute top-0 left-1/2 -translate-x-1/2 h-[2px] bg-[#007673] transition-all duration-300 ease-out ${
                    isActive ? "w-8 opacity-100" : "w-0 opacity-0"
                  }`}
                />

                {/* Icon Wrapper */}
                <div className="relative mt-1">
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2 : 1.5}
                    className={`transition-all duration-300 ${
                      isActive
                        ? "text-[#007673]"
                        : "text-gray-400 group-hover:text-gray-600"
                    }`}
                    style={{
                      fill:
                        isActive && item.name !== "Explore"
                          ? "#007673"
                          : "transparent",
                    }}
                  />

                  {/* Badge */}
                  {item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-[#007673] text-white text-[9px] font-bold rounded-full min-w-[16px] h-[16px] px-1 flex items-center justify-center tracking-tighter border-2 border-white shadow-sm z-10">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </div>

                {/* Label */}
                <span
                  className={`text-[9px] font-bold uppercase tracking-widest transition-colors duration-300 ${
                    isActive
                      ? "text-[#007673]"
                      : "text-gray-400 group-hover:text-gray-600"
                  }`}>
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

export default BottomNavbar;
