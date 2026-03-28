import { lazy } from "react";

/* =========================
   Pages (Lazy Loaded)
========================== */
export const TaruvedaProductPage = lazy(
  () => import("./pages/TaruvedaProductPage"),
);
export const TaruVedaCartPage = lazy(() => import("./pages/TaruVedaCartPage"));
