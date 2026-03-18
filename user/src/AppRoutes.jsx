import { Suspense, lazy } from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./userApp/features/auth/context/UserContext";

/* ─── Eager Components (Render on load) ─────────────────────────────────── */
import UserLayout from "./userApp/layouts/UserLayout";
import LoadingScreen from "./userApp/components/loading/LoadingScreen";
import NotFoundPage from "./userApp/pages/NotFoundPage";
import ErrorBoundary from "./shared/components/ErrorBoundary";
import AboutUsPage from "./userApp/pages/AboutUsPage";
import OrderConfirmationPage from "./userApp/components/pop-up/OrderConfirmationPage";

/* ─── Lazy: Auth ────────────────────────────────────────────────────────── */
const AuthRoutes = lazy(() => import("./userApp/routes/AuthRoutes"));

/* ─── Lazy: Public Storefront ───────────────────────────────────────────── */
const HomePage = lazy(() => import("./userApp/pages/HomePage"));
const CategoriesPage = lazy(
  () => import("./userApp/features/category/pages/CategoriesPage"),
);
const ProductDetailsPage = lazy(
  () => import("./userApp/pages/ProductDetailsPage"),
);
const ContactUsPage = lazy(() => import("./userApp/pages/ContactUsPage"));

/* ─── Lazy: Protected Storefront ────────────────────────────────────────── */
const WishlistPage = lazy(
  () => import("./userApp/features/wishList/pages/WishlistPage"),
);
const SettingsPage = lazy(() => import("./userApp/pages/SettingsPage"));
const NotificationPreferencesPage = lazy(
  () => import("./userApp/pages/NotificationPreferences"),
);

/* ─── Lazy: Sub-routers (Own Layouts) ───────────────────────────────────── */
const AccountRoutes = lazy(() => import("./userApp/routes/AccountRoutes"));
const CheckoutRoutes = lazy(() => import("./userApp/routes/CheckoutRoutes"));
const TaruvedaRoutes = lazy(() => import("./userApp/routes/TaruvedaRoutes"));

/* ════════════════════════════════════════════════════════════
   PREMIUM LOADERS
════════════════════════════════════════════════════════════ */

// Full-screen loader for auth/heavy initial routes.
// Uses solid white background for that clean, high-end feel.
const FullScreenLoader = () => (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
    <LoadingScreen text="Curating your experience..." />
  </div>
);

// Lightweight inline loader used inside UserLayout so Navbar stays visible.
const InlineLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh] w-full bg-[#f4f4f5]">
    <LoadingScreen text="Loading..." />
  </div>
);

/* ════════════════════════════════════════════════════════════
   PROTECTED ROUTE GATEWAY
════════════════════════════════════════════════════════════ */
const ProtectedRoute = () => {
  const { isLoggedIn, user, authLoading } = useAuth();
  const location = useLocation();

  // Wait for Firebase to confirm auth state
  if (authLoading) return <FullScreenLoader />;

  // Redirect to login if not authenticated, saving the intended destination
  if (!isLoggedIn || !user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

/* ════════════════════════════════════════════════════════════
   MAIN APP ROUTER
════════════════════════════════════════════════════════════ */
const AppRoutes = () => (
  <Routes>
    {/* ── A. AUTH ── */}
    <Route
      path="/auth/*"
      element={
        <Suspense fallback={<FullScreenLoader />}>
          <AuthRoutes />
        </Suspense>
      }
    />

    {/* ── B. PUBLIC STOREFRONT (Navbar + Footer visible) ── */}
    <Route element={<UserLayout />}>
      <Route
        index
        element={
          <ErrorBoundary>
            <Suspense fallback={<InlineLoader />}>
              <HomePage />
            </Suspense>
          </ErrorBoundary>
        }
      />
      <Route
        path="product/:slug"
        element={
          <Suspense fallback={<InlineLoader />}>
            <ProductDetailsPage />
          </Suspense>
        }
      />
      <Route
        path="categories"
        element={
          <Suspense fallback={<InlineLoader />}>
            <CategoriesPage />
          </Suspense>
        }
      />
      <Route
        path="contact-us"
        element={
          <Suspense fallback={<InlineLoader />}>
            <ContactUsPage />
          </Suspense>
        }
      />
      <Route
        path="about-us"
        a
        element={
          <Suspense fallback={<InlineLoader />}>
            <AboutUsPage />
          </Suspense>
        }
      />
    </Route>

    {/* ── C. PROTECTED STOREFRONT (Navbar + Footer visible) ── */}
    <Route element={<UserLayout />}>
      <Route element={<ProtectedRoute />}>
        <Route
          path="wishlist"
          element={
            <Suspense fallback={<InlineLoader />}>
              <WishlistPage />
            </Suspense>
          }
        />
        <Route
          path="settings"
          element={
            <Suspense fallback={<InlineLoader />}>
              <SettingsPage />
            </Suspense>
          }
        />
        <Route
          path="notifications"
          element={
            <Suspense fallback={<InlineLoader />}>
              <NotificationPreferencesPage />
            </Suspense>
          }
        />
      </Route>
    </Route>

    {/* ── D. PROTECTED SUB-ROUTERS (These have their own layouts inside) ── */}
    <Route element={<ProtectedRoute />}>
      <Route
        path="user/*"
        element={
          <Suspense fallback={<FullScreenLoader />}>
            <AccountRoutes />
          </Suspense>
        }
      />
      <Route
        path="checkout/*"
        element={
          <Suspense fallback={<FullScreenLoader />}>
            <CheckoutRoutes />
          </Suspense>
        }
      />
      <Route
        path="taruveda-organic-shampoo-oil/*"
        element={
          <Suspense fallback={<FullScreenLoader />}>
            <TaruvedaRoutes />
          </Suspense>
        }
      />
    </Route>

    <Route path="/order-success/:orderId" element={<OrderConfirmationPage />} />

    {/* ── E. 404 NOT FOUND (Navbar + Footer visible) ── */}
    <Route element={<UserLayout />}>
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
);

export default AppRoutes;
