import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, LayoutGrid, Leaf, Heart, User, ShoppingBag } from "lucide-react";
import { useAuth } from "../../../auth/context/UserContext";

const BottomNavbar = ({ cartCount = 0 }) => {
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
    { name: "Categories", path: "/categories", icon: LayoutGrid },
    { name: "Taruveda", path: "/taruveda-organic-shampoo-oil", icon: Leaf },
    { name: "Wishlist", path: "/wishlist", icon: Heart },
    { name: "Profile", path: "/user/profile", icon: User, protected: true },
  ];

  const BRAND_COLOR = "#B4292F";

  return (
    <nav className="fixed md:hidden bottom-0 left-0 w-full bg-white border-t border-gray-100 pb-safe z-50">
      <ul className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <li key={item.name} className="flex-1 h-full">
              <button
                type="button"
                onClick={() =>
                  item.protected
                    ? handleProtected(item.path)
                    : navigate(item.path)
                }
                className="w-full h-full flex flex-col items-center justify-center relative transition-all duration-200 active:scale-90">
                {/* Active Indicator Line (Amazon Style) */}
                {isActive && (
                  <div
                    className="absolute top-0 w-12 h-1 rounded-b-lg transition-all"
                    style={{ backgroundColor: BRAND_COLOR }}
                  />
                )}

                <div className="relative">
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={`transition-colors duration-200 ${
                      isActive ? "" : "text-gray-500"
                    }`}
                    style={{ color: isActive ? BRAND_COLOR : undefined }}
                  />

                  {/* Optional: Cart Badge for Shopify vibe */}
                  {item.name === "Wishlist" && cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-[#B4292F] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                      {cartCount}
                    </span>
                  )}
                </div>

                <span
                  className={`text-[10px] mt-1 font-semibold tracking-wide transition-colors ${
                    isActive ? "text-gray-900" : "text-gray-400"
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
