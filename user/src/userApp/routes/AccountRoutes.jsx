import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import LoadingScreen from "../components/loading/LoadingScreen";

/* ─── Lazy: Account Pages ────────────────────────────────────────────────── */
const ProfilePage = lazy(() => import("../pages/ProfilePage"));
const OrdersPage = lazy(() => import("../pages/OrdersPage"));
const OrderDetailPage = lazy(() => import("../pages/OrderDetailPage"));
const EditProfilePage = lazy(
  () => import("../features/userProfile/pages/EditProfilePage"),
);

/* ─── Inline Loader ──────────────────────────────────────────────────────── */
const InlineLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh] w-full bg-[#f4f4f5]">
    <LoadingScreen text="Loading..." />
  </div>
);

export default function AccountRoutes() {
  return (
    <Routes>
      <Route>
        <Route
          index
          element={
            <Suspense fallback={<InlineLoader />}>
              <ProfilePage />
            </Suspense>
          }
        />
        <Route
          path="profile"
          element={
            <Suspense fallback={<InlineLoader />}>
              <ProfilePage />
            </Suspense>
          }
        />
        <Route
          path="orders"
          element={
            <Suspense fallback={<InlineLoader />}>
              <OrdersPage />
            </Suspense>
          }
        />
        <Route
          path="orders/:orderId"
          element={
            <Suspense fallback={<InlineLoader />}>
              <OrderDetailPage />
            </Suspense>
          }
        />
      </Route>
      <Route
        path="edit"
        element={
          <Suspense fallback={<InlineLoader />}>
            <EditProfilePage />
          </Suspense>
        }
      />
    </Routes>
  );
}
