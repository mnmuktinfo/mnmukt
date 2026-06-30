// ✅ ICONS (for mobile menu only)
import {
  FaBox,
  FaShoppingCart,
  FaHome,
  FaInfoCircle,
  FaStore,
  FaPalette,
  FaTshirt,
  FaImages,
  FaExchangeAlt,
  FaPhoneAlt,
  FaUser,
  FaSignInAlt,
} from "react-icons/fa";


// ✅ 1. CATEGORY MENU (Fashion Navigation)
// Used in Desktop & Mobile dropdown — NO ICONS
export const categoryMenuItems = [
  { label: "New In", path: "/collections/new-in" },
  { label: "Mulmul Wedding", path: "/collections/mulmul-wedding" },
  { label: "Mulmul Classic", path: "/collections/mulmul-classic" },
  { label: "Studio (Western)", path: "/collections/studio" },
  { label: "Accessories", path: "/collections/accessories" },

  { label: "Shop", path: "/collections/all" },
  { label: "Collections", path: "/collections/all" },
  { label: "Bestsellers", path: "/collections/bestsellers" },
  { label: "Celebrities", path: "/collections/celebrities" },
];


// ✅ 2. UTILITY MENU (About, Contact, Returns…)
// Clean, readable, NO ICONS
export const utilityMenuItems = [
  { label: "Home", path: "/" },
  { label: "About Us", path: "/about-us" },
  { label: "Shop", path: "/collections/all" },

  { label: "Artsy Collection", path: "/collections/artsy" },
  { label: "Basics Collection", path: "/collections/basics" },
  { label: "Rang Collection", path: "/collections/rang" },
  { label: "Babli On You", path: "/collections/babli-on-you" },

  { label: "Return / Exchange", path: "/return-exchange" },
  { label: "Contact Us", path: "/contact" },

  { label: "My Account", path: "/account" },
  { label: "Login / Sign Up", path: "/login" },
];


// ✅ 3. DESKTOP MENU (Final merged clean navigation)
export const desktopMenuItems = [
  ...categoryMenuItems,
  ...utilityMenuItems, // categories + utility links
];


// ✅ 4. MOBILE MENU (with icons)
export const mobileMenuItems=[]
// export const mobileMenuItems = [
//   { path: "/", label: "Home", icon: <FaHome className="mr-2" /> },

//   { path: "/collections/all", label: "Collection", icon: <FaBox className="mr-2" /> },

//   { path: "/cart", label: "My Cart", icon: <FaShoppingCart className="mr-2" /> },

//   { path: "/orders", label: "My Orders", icon: <FaBox className="mr-2" /> },

//   { path: "/account", label: "My Account", icon: <FaUser className="mr-2" /> },

//   { path: "/login", label: "Login / Sign Up", icon: <FaSignInAlt className="mr-2" /> },
// ];
