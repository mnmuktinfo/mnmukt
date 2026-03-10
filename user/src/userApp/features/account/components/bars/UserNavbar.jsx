import React from "react";
import DesktopNavbar from "./DesktopNavbarDesign";
import MobileTopbar from "./MobileNavbarDesign";
import promoData from "../../data/promoData.json";

import { categoryMenuItems } from "../../data/categoryMenuItems";

// 1. Import your custom hooks (adjust the paths to your actual context files)
import { useCart } from "../../../../features/cart/context/CartContext";
import { useWishlist } from "../../../../features/wishList/context/WishlistContext";

const UserNavbar = () => {
  // 2. Extract values from context
  // Destructuring based on your commented-out code
  const { cart } = useCart();
  const { wishlist } = useWishlist();

  // 3. Calculate counts (assuming items are stored in an array)
  const cartCount = cart?.length || 0;
  const wishlistCount = wishlist?.length || 0;
  // console.log(cartCount);
  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block">
        <DesktopNavbar
          cartCount={cartCount}
          wishlistCount={wishlistCount}
          promoData={promoData}
          categoryMenuItems={categoryMenuItems}
        />
      </div>

      {/* Mobile View */}
      <div className="block md:hidden">
        <MobileTopbar
          promoData={promoData}
          cartCount={cartCount}
          wishlistCount={wishlistCount}
        />
      </div>
    </>
  );
};

export default UserNavbar;
