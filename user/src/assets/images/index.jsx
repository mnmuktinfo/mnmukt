// ==========================================
// 1. LOCAL ASSETS
// ==========================================
import appLogo from "./appLogo.png";
import whiteAppLogo from "./whiteAppLogo.png";

// ==========================================
// 2. REMOTE ASSETS (CONSTANTS)
// ==========================================

// --- Logos ---

// m
const GOOGLE_ICON_BASE64 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAA7VBMVEVHcEz/RkL/R0D+SEr/RUD/RkOwjlb/SD7/SE3/SUj/Vzb/VDf9TFb8TVeHoFb/YTD/byn8TVn/jRr/fSL/mxL/SEj+yQn/ohH/tQv+VUb/vQn/wwn+zgj9wQm3xQ39zgT6zQYwhv/7zgowhv8uhv0ek+Avhv7yzAPjywIvhv0whv7PyQHUygIth/y3yAEnivSlxwGSxgUak94fj+h5xAlgwxMLqp8NnsQVlte6xwBNwh45wC0xwDMLt28IrJgJpa0kjPCaxQEpvzsevkkWvVANumQQu18JtXkIsIgTvVYOvGALuWtJwh4OvF8OvF9ccfxCAAAAT3RSTlMAUZvT7P8T//+wiv//kAv6/mD//+V2jv//JKf//0EmxOr/rP7+MEX//x10/6eu//3+/9v///7I//+K//+KS/3/YeX//7dsnv7/////5s3tMAqBMAAAAXFJREFUeAF0jUUCwCAMwDp3d/f9/4krnVt6goQCFzheECVJFHgOPpB5RZHYIKqqyU+vGwpCXkVM07pp2zEQ8hSYiCBf1rsuFrQCvaSahHe+9wMqWHJuOD2E/lYoWsRxkUbBxcdJshY6bEQ3L6fpWmTnXXbxkBcpJTb8UBZFgUX156uyLLHI4Y+YgqL+DZqS0R7n7o4NLQX9GQwbI5tugpKI7wF5Rjd/BiNCCQZfX5BfCwyWrsnagGEYiKKpMkLqgJmZmXn/caKTzGoM7+v4IEiWPQdJ4fMhFujHCzjH7Wny6xFwMB9UKBa4KN3Tl4kh9AZYVJRbpXhVVRGX0asEXNP1a7MM0wQJA+0WFcQtyz7bcFzPAwn+8AkPwmjDcZK6WJGR75zwsCirOo7rpu0SojC2oQUeIF72/TCMY4sUKSj2wX9iXgAHwYgEoKBPizOBgx4EhwnCtxOtDnYTzn1Gnw3wzYQT3zDJrpmXYVjmpj7d/gPknlJE6eZSewAAAABJRU5ErkJggg==";

// --- Auth Banners ---
const AUTH_BANNERS = {
  login: "https://images.meesho.com/images/marketing/1744698265981.webp",
  signup: "https://images.meesho.com/images/marketing/1744698265981.webp",
  offer:
    "https://www.biba.in/on/demandware.static/-/Library-Sites-BibaSharedLibrary/en_IN/dw166ba4ee/login-sept19.jpg",
};

// --- Hero / Fallback Images ---
const HERO_DEFAULTS = {
  mobile:
    "https://www.libas.in/cdn/shop/files/mobile-banner_1_6f485ab4-0aaa-4411-9be5-1e2539965dff.jpg?v=1769691939&width=832",
  desktop:
    "https://babli.in/cdn/shop/files/Desktop_Banner_6975bce7-2e4e-43af-b227-10b31b949ea9.jpg?v=1755754950",
};

// --- Hero Slides (Desktop) ---
const HERO_SLIDES_DESKTOP = [
  "https://www.biba.in/dw/image/v2/BKQK_PRD/on/demandware.static/-/Library-Sites-BibaSharedLibrary/en_IN/dw7aca7f1f/A-A-SS26/SS26-Banner-1.jpg",
  "https://shopmulmul.com/cdn/shop/files/NEWTHEMEDESKTOPBANNER_fa6268db-6709-4513-986b-8f4e5974d324.jpg?v=1761974947&width=2000",
  "https://www.biba.in/dw/image/v2/BKQK_PRD/on/demandware.static/-/Library-Sites-BibaSharedLibrary/en_IN/dw65dfbd3b/A-A-Flat40/FLAT40/Flat-40-Girls.jpg",
];

// --- Hero Slides (Mobile) ---
const HERO_SLIDES_MOBILE = [
  "https://www.libas.in/cdn/shop/files/mobile-banner_1_6f485ab4-0aaa-4411-9be5-1e2539965dff.jpg?v=1769691939&width=832",
  "https://www.libas.in/cdn/shop/files/extra-love_converted_764e875d-1b2b-4b70-b1bd-7d9c08491659.webp?v=1767596304",
  "https://images.biba.in/on/demandware.static/-/Library-Sites-BibaSharedLibrary/en_IN/dw39b62c8a/A-AW25/wedding-m-oct4.jpg",
];

// ==========================================
// 3. MAIN EXPORT
// ==========================================
export const IMAGES = {
  /**
   * Brand Identity & Logos
   */
  brand: {
    logo: appLogo,
    logoWhite: whiteAppLogo,
    googleIcon: GOOGLE_ICON_BASE64,
  },

  /**
   * Authentication Screens (Login/Signup)
   */
  auth: {
    loginBanner: AUTH_BANNERS.login,
    signupBanner: AUTH_BANNERS.signup,
    signupOfferBanner: AUTH_BANNERS.offer,
  },

  /**
   * Homepage Hero Section
   * Grouped into arrays for easier mapping in Carousels
   */
  hero: {
    // Individual fallbacks
    defaultDesktop: HERO_DEFAULTS.desktop,
    defaultMobile: HERO_DEFAULTS.mobile,

    // Slider Arrays
    desktopSlides: HERO_SLIDES_DESKTOP,
    mobileSlides: HERO_SLIDES_MOBILE,
  },
};
