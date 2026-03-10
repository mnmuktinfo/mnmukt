import { lazy } from "react";

/* =========================
   Pages (Lazy Loaded)
========================== */
export const TaruvedaProductPage = lazy(
  () => import("./pages/TaruvedaProductPage"),
);
export const TaruVedaCartPage = lazy(() => import("./pages/TaruVedaCartPage"));
export const TaruVedaCheckoutPage = lazy(
  () => import("./pages/TaruVedaCheckoutPage"),
);

/* =========================
   Hooks (Keep synchronous)
========================== */
// export { default as useTaruvedaCart } from "./hooks/useTaruvedaCart";

/* =========================
   Components (Optional lazy load)
========================== */
// export const ProductCard = lazy(() => import("./components/ProductCard"));
// export const FilterBar = lazy(() => import("./components/FilterBar"));

/* =========================
   Services (Always synchronous)
========================== */
// export * from "./services/taruveda.service";
