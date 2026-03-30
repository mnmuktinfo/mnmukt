import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import TaruvedaLayout from "../layouts/TaruvedaLayout";
import LoadingScreen from "../../../components/loading/LoadingScreen";

/* ─── Lazy: Taruveda Pages ───────────────────────────────────────────────── */
/*
  No .then() needed — these files use "export default".
  .then((m) => ({ default: m.ComponentName })) is only for named exports,
  and returns undefined when the export doesn't exist, causing the crash.
*/
const TaruvedaHomePage = lazy(() => import("../pages/TaruvedaHomePage"));
const TaruVedaCartPage = lazy(() => import("../pages/TaruVedaCartPage"));
const TaruVedaCheckoutPage = lazy(
  () => import("../pages/TaruVedaCheckoutPage"),
);

/* ─── Inline Loader ──────────────────────────────────────────────────────── */
const InlineLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh] w-full bg-[#f4f4f5]">
    <LoadingScreen text="Loading..." />
  </div>
);

export default function TaruvedaRoutes() {
  return (
    <Routes>
      <Route element={<TaruvedaLayout />}>
        <Route
          index
          element={
            <Suspense fallback={<InlineLoader />}>
              <TaruvedaHomePage />
            </Suspense>
          }
        />
        <Route
          path="cart"
          element={
            <Suspense fallback={<InlineLoader />}>
              <TaruVedaCartPage />
            </Suspense>
          }
        />
        <Route
          path="checkout"
          element={
            <Suspense fallback={<InlineLoader />}>
              <TaruVedaCheckoutPage />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}
