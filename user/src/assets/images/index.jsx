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

// --- Hero Slides (Desktop) ---
const HERO_SLIDES_DESKTOP = [
  "https://babli.in/cdn/shop/files/HANDMADE-WITH-LOVE.jpg?v=1768278946&width=2000",
  "https://babli.in/cdn/shop/files/WhatsApp_Image_2026-03-11_at_7.30.23_PM.jpg?v=1773238019&width=1600",
  "https://letsdressup.in/cdn/shop/files/Holi_Special_4000px.jpg?v=1772523580",
  "https://babli.in/cdn/shop/files/69a684099361e_IMG_7712.jpg?v=1772526574&width=2000",
];

// --- Hero Slides (Mobile) ---
const HERO_SLIDES_MOBILE = [
  "https://prod-img.thesouledstore.com/public/theSoul/storage/mobile-cms-media-prod/banner-images/shorts_app_2_HmL3M5Q.jpg?w=360&dpr=3.0",
  "https://prod-img.thesouledstore.com/public/theSoul/storage/mobile-cms-media-prod/banner-images/app-banner_3_BWeXCqK.jpg?w=360&dpr=3.0",
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

    // Slider Arrays
    desktopSlides: HERO_SLIDES_DESKTOP,
    mobileSlides: HERO_SLIDES_MOBILE,
  },
};
