import React from "react";
import { useAuth } from "../../../auth/context/UserContext";
import { usePopup } from "../../../../context/SignUpPopContext";

const NavbarRightIcons = ({
  scrolled,
  menuOpen,
  setMenuOpen,
  menuItems,
  DropdownComponent,
  categoryMenuItems,
}) => {
  const { isLoggedIn } = useAuth();
  // const { openSignupPopup } = usePopup();

  return (
    <div className="flex items-center gap-6 relative">
      {menuItems.map((item, index) => (
        <button
          key={index}
          onClick={() => {
            // 👇 If item is protected & user is not logged in → open signup popup
            if (item.protected && !isLoggedIn) {
              // return openSignupPopup();
            }

            // Normal action
            item.onClick();
          }}
          className={`hover:opacity-70 ${
            item.visibleDesktop === false ? "md:hidden" : ""
          } ${item.visibleMobile === false ? "hidden md:block" : ""}`}>
          <item.icon
            size={item.size || 24}
            className={`${scrolled ? "text-black" : "text-white"}`}
          />

          {/* Badge (Cart or notifications) */}
          {item.showBadge && item.badgeValue > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {item.badgeValue}
            </span>
          )}
        </button>
      ))}

      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="hover:opacity-70 md:hidden">
        <span className={`${scrolled ? "text-black" : "text-white"}`}>☰</span>
      </button>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="absolute top-14 right-0 w-56 bg-white text-black rounded-lg shadow-xl md:hidden">
          <DropdownComponent
            isOpen={menuOpen}
            onClose={() => setMenuOpen(false)}
            menuItems={categoryMenuItems}
          />
        </div>
      )}
    </div>
  );
};

export default NavbarRightIcons;
