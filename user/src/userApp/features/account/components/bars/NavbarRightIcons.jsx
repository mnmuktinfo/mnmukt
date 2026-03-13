import React from "react";
import { useAuth } from "../../../auth/context/UserContext";

const NavbarRightIcons = ({ menuItems }) => {
  const { isLoggedIn } = useAuth();

  return (
    <div className="flex items-center gap-6 relative">
      {menuItems.map((item, index) => (
        <button
          key={index}
          onClick={() => {
            if (item.protected && !isLoggedIn) {
              return; // Could open a signup popup here
            }
            item.onClick();
          }}
          className={`hover:opacity-70 ${
            item.visibleDesktop === false ? "md:hidden" : ""
          } ${item.visibleMobile === false ? "hidden md:block" : ""}`}>
          <item.icon size={item.size || 24} className="text-black" />

          {/* Badge (Cart or notifications) */}
          {item.showBadge && item.badgeValue > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {item.badgeValue}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default NavbarRightIcons;
