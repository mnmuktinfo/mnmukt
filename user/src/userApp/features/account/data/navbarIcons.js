import { Search, Heart, ShoppingBag, User } from "lucide-react";

export const rightSideDesktopNavbarIcons = (navigate, cartCount = 0) => [
  // {
  //   icon: Search,
  //   onClick: () => navigate("/search"),
  //   size: 22,

  // },
  {
    icon: Heart,
    onClick: () => navigate("/wishlist"),
    size: 22,

  },
  {
    icon: ShoppingBag,
    onClick: () => navigate("/checkout/cart"),
    showBadge: true,
    badgeValue: cartCount,
    size: 22,
      protected: true

  },
  {
    icon: User,
    onClick: () => navigate("/user/profile"),
    size: 26,
      protected: true

  },
];
