// ==========================================
// 1. LOCAL ASSETS
// ==========================================
import appLogo from "./appLogo.png";
import whiteAppLogo from "./whiteAppLogo.png";

// ==========================================
// 2. REMOTE ASSETS (CONSTANTS)
// ==========================================

// --- Logos ---
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
// 4. TARUVEDA HOMEPAGE ASSETS
// ==========================================

const TARUVEDA_BANNERS = {
  heroDesktop: [
    "https://organicindia.com/cdn/shop/files/OI_PayDay_Sale_desktop-banner_5832x1792.jpg_2.jpg?v=1774613017",
    "https://organicindia.com/cdn/shop/files/OI_PayDay_Sale_desktop-banner_5832x1792.jpg_2.jpg?v=1774613017",
    "https://ueirorganic.com/cdn/shop/files/Website_1007.jpg?v=1752125714&width=1000",
  ],

  heroMobile: [
    "https://ueirorganic.com/cdn/shop/files/Mobile.jpg_1_3ec8dd9b-8173-4486-9db3-c97ce804ef1e.jpg?v=1770726065&width=1100",
    "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc",
  ],

  ingredientStory:
    "https://images.unsplash.com/photo-1598449426314-8b02525e8733",

  comboBanner: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273",

  benefitsBanner:
    "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb",
};

const TARUVEDA_CATEGORIES = [
  {
    name: "Hair Care",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348",
  },
  {
    name: "Skin Care",
    image: "https://images.unsplash.com/photo-1570194065650-d99fb4d8a3b0",
  },
  {
    name: "Body Care",
    image: "https://images.unsplash.com/photo-1600185365483-26d7f0c3b7c3",
  },
  {
    name: "Combos",
    image: "https://images.unsplash.com/photo-1600180758890-6b94519a8ba5",
  },
];

const TARUVEDA_TESTIMONIAL_IMAGES = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
  "https://images.unsplash.com/photo-1554151228-14d9def656e4",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1",
];

// ==========================================
// 5. MAIN EXPORT
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
   */
  hero: {
    desktopSlides: HERO_SLIDES_DESKTOP,
    mobileSlides: HERO_SLIDES_MOBILE,
  },

  /**
   * Taruveda Brand Pages
   */
  taruveda: {
    heroDesktop: TARUVEDA_BANNERS.heroDesktop,
    heroMobile: TARUVEDA_BANNERS.heroMobile,
    ingredientStory: TARUVEDA_BANNERS.ingredientStory,
    comboBanner: TARUVEDA_BANNERS.comboBanner,
    benefitsBanner: TARUVEDA_BANNERS.benefitsBanner,
    categories: TARUVEDA_CATEGORIES,
    testimonials: TARUVEDA_TESTIMONIAL_IMAGES,
  },
};
