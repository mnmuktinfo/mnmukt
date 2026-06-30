import { Suspense, lazy, useMemo } from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./userApp/features/auth/context/UserContext";

/* ─── Eager Components (only critical path items) ───────────────────────── */
import UserLayout from "./userApp/layouts/UserLayout";
import LoadingScreen from "./userApp/components/loading/LoadingScreen";
import NotFoundPage from "./userApp/pages/NotFoundPage";
import ErrorBoundary from "./shared/components/ErrorBoundary";
import HtmlSitemap from "./userApp/pages/SItemap";

/* ─── Code-split Lazy Imports ────────────────────────────────────────────── */

// Auth
const AuthRoutes = lazy(() => import("./userApp/routes/AuthRoutes"));

// Public Standalone (no layout)
const EmailVerificationHelp = lazy(
  () => import("./userApp/features/auth/pages/EmailHelpPage"),
);
const OrderConfirmationPage = lazy(
  () => import("./userApp/components/pop-up/OrderConfirmationPage"),
);

// Public Storefront (inside UserLayout)
const HomePage = lazy(() => import("./userApp/pages/HomePage"));
const ProductDetailsPage = lazy(
  () => import("./userApp/pages/ProductDetailsPage"),
);
const CollectionPage = lazy(
  () => import("./userApp/features/p/CollectionPage"),
);
const ContactUsPage = lazy(() => import("./userApp/pages/ContactUsPage"));
const AboutUsPage = lazy(() => import("./userApp/pages/AboutUsPage"));
const SingleItemCheckout = lazy(
  () => import("./userApp/pages/Singleitemcheckout"),
);
// Protected Pages
const WishlistPage = lazy(
  () => import("./userApp/features/wishList/pages/WishlistPage"),
);
const NotificationPreferencesPage = lazy(
  () => import("./userApp/pages/NotificationPreferences"),
);

// Sub-routers with own layouts (full-screen)
const AccountRoutes = lazy(() => import("./userApp/routes/AccountRoutes"));
const CheckoutRoutes = lazy(() => import("./userApp/routes/CheckoutRoutes"));
const TaruvedaRoutes = lazy(
  () => import("./userApp/features/taruveda/routes/TaruvedaRoutes"),
);

/* ════════════════════════════════════════════════════════════
   LOADERS & BOUNDARIES
════════════════════════════════════════════════════════════ */

/**
 * Full-screen loader
 * Used for: Auth routes, sub-routers with own layouts, ProtectedRoute auth checks
 */
const FullScreenLoader = () => (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
    <LoadingScreen text="Curating your experience..." />
  </div>
);

/**
 * Inline loader
 * Used for: Page content inside UserLayout (Navbar/Footer remain mounted)
 */
const InlineLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh] w-full bg-[#f4f4f5]">
    <LoadingScreen text="Loading..." />
  </div>
);

/**
 * Consistent error boundary for all pages
 * Memoized to prevent unnecessary re-renders
 */
const PageErrorBoundary = ({ children }) => (
  <ErrorBoundary>{children}</ErrorBoundary>
);

/* ════════════════════════════════════════════════════════════
   PROTECTED ROUTE GATEWAY
════════════════════════════════════════════════════════════ */
const ProtectedRoute = () => {
  const { isLoggedIn, user, authLoading } = useAuth();
  const location = useLocation();

  // Show full-screen loader while auth state resolves
  if (authLoading) return <FullScreenLoader />;

  if (!isLoggedIn || !user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

/* ════════════════════════════════════════════════════════════
   ROUTE COMPONENTS (memoized to prevent recreation)
════════════════════════════════════════════════════════════ */

/**
 * Lazy page with consistent error boundary and suspense
 */
const LazyPage = ({ Component, fallback = <InlineLoader /> }) => (
  <PageErrorBoundary>
    <Suspense fallback={fallback}>
      <Component />
    </Suspense>
  </PageErrorBoundary>
);

/**
 * Lazy sub-router with full-screen loader
 */
const LazySubRouter = ({ Component }) => (
  <Suspense fallback={<FullScreenLoader />}>
    <Component />
  </Suspense>
);

/* ════════════════════════════════════════════════════════════
   APP ROUTES
════════════════════════════════════════════════════════════ */
const AppRoutes = () => {
  // Memoize route structure to prevent unnecessary rebuilds
  const memoizedRoutes = useMemo(
    () => (
      <Routes>
        {/* ─── 1. AUTH (Highest Priority - Own Layout) ─────────────────── */}
        <Route
          path="/auth/*"
          element={<LazySubRouter Component={AuthRoutes} />}
        />

        {/* ─── 2. SINGLE PRODUCT CHECKOUT (Direct Path) ───────────────── */}
        <Route
          path="/:productSlug"
          element={
            <Suspense fallback={<InlineLoader />}>
              <SingleItemCheckout />
            </Suspense>
          }
        />

        {/* ─── 3. SITEMAP (Static, No Layout) ─────────────────────────── */}
        <Route path="/sitemap" element={<HtmlSitemap />} />

        {/* ─── 4. TARUVEDA (Own Layout) ───────────────────────────────── */}
        <Route
          path="/taruveda-organic-shampoo-oil/*"
          element={<LazySubRouter Component={TaruvedaRoutes} />}
        />

        {/* ─── 5. STANDALONE PUBLIC (No Nav/Footer) ──────────────────── */}
        <Route
          path="/help/email-verification"
          element={
            <Suspense fallback={<InlineLoader />}>
              <EmailVerificationHelp />
            </Suspense>
          }
        />
        <Route
          path="/order-success/:orderId"
          element={
            <Suspense fallback={<InlineLoader />}>
              <OrderConfirmationPage />
            </Suspense>
          }
        />

        {/* ─── 6. PUBLIC STOREFRONT (UserLayout + Navbar/Footer) ──────── */}
        <Route element={<UserLayout />}>
          {/* Home */}
          <Route index element={<LazyPage Component={HomePage} />} />

          {/* Most specific product route first */}
          <Route
            path="/product/:slug"
            element={<LazyPage Component={ProductDetailsPage} />}
          />

          {/* Collections */}
          <Route
            path="/collections/:collectionType"
            element={<LazyPage Component={CollectionPage} />}
          />



          {/* Info Pages */}
          <Route
            path="/contact-us"
            element={<LazyPage Component={ContactUsPage} />}
          />
          <Route
            path="/about-us"
            element={<LazyPage Component={AboutUsPage} />}
          />

          {/* ─── 7. PROTECTED PAGES (Still inside UserLayout) ──────── */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/wishlist"
              element={<LazyPage Component={WishlistPage} />}
            />
            <Route
              path="/notifications"
              element={<LazyPage Component={NotificationPreferencesPage} />}
            />
          </Route>

          {/* 404 (Last inside UserLayout) */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* ─── 8. PROTECTED SUB-ROUTERS (Own Full-Screen Layouts) ────── */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/user/*"
            element={<LazySubRouter Component={AccountRoutes} />}
          />
          <Route
            path="/checkout/*"
            element={<LazySubRouter Component={CheckoutRoutes} />}
          />
        </Route>
      </Routes>
    ),
    [],
  );

  return memoizedRoutes;
};

export default AppRoutes;
