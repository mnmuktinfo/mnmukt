import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import CheckoutLayout from "../layouts/CheckoutLayout";
import LoadingScreen from "../components/loading/LoadingScreen";

/* ─── Lazy: Checkout Pages ───────────────────────────────────────────────── */
const CartPage = lazy(() => import("../features/cart/pages/CartPage"));
const AddressPage = lazy(() => import("../pages/AddressPage"));

/* ─── Inline Loader ──────────────────────────────────────────────────────── */
const InlineLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh] w-full bg-[#f4f4f5]">
    <LoadingScreen text="Loading..." />
  </div>
);

const CheckoutRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<CheckoutLayout />}>
        <Route
          index
          element={
            <Suspense fallback={<InlineLoader />}>
              <CartPage />
            </Suspense>
          }
        />
        <Route
          path="cart"
          element={
            <Suspense fallback={<InlineLoader />}>
              <CartPage />
            </Suspense>
          }
        />
        <Route
          path="address"
          element={
            <Suspense fallback={<InlineLoader />}>
              <AddressPage />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
};

export default CheckoutRoutes;
