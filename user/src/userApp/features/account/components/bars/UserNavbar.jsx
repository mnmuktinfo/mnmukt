// 1. IMPORT useState
import React, { useState } from "react";
import DesktopNavbar from "./DesktopNavbarDesign";
import MobileTopbar from "./MobileNavbarDesign";
import promoData from "../../data/promoData.json";
import { categoryMenuItems } from "../../data/categoryMenuItems";

import { useCart } from "../../../../features/cart/context/CartContext";
import { useWishlist } from "../../../../features/wishList/context/WishlistContext";
import CartDrawer from "../../../../components/cards/CartDrawer";

const UserNavbar = () => {
  const { cart } = useCart();
  const { wishlist } = useWishlist();

  const [isCartOpen, setIsCartOpen] = useState(false);

  const cartCount = cart?.length || 0;
  const wishlistCount = wishlist?.length || 0;

  // Function to open the cart
  const handleOpenCart = () => setIsCartOpen(true);

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block">
        <DesktopNavbar
          cartCount={cartCount}
          wishlistCount={wishlistCount}
          promoData={promoData}
          categoryMenuItems={categoryMenuItems}
          onCartClick={handleOpenCart} // 👈 Pass down the open function
        />
      </div>

      {/* Mobile View */}
      <div className="block md:hidden">
        <MobileTopbar
          promoData={promoData}
          cartCount={cartCount}
          wishlistCount={wishlistCount}
          onCartClick={handleOpenCart} // 👈 Pass down the open function
        />
      </div>

      {/* Render CartDrawer OUTSIDE the hidden divs 
        so it works for both Desktop and Mobile!
      */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default UserNavbar;
