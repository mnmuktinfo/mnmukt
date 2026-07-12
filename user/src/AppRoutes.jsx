import { Suspense, lazy, useMemo, useEffect } from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "./userApp/features/auth/context/UserContext";

/* ─── Eager Components (only true critical path) ─────────────────────────
   Keep this list to layout/shell pieces the very first paint needs.
   Everything else — including page content — should be lazy so it
   doesn't inflate the initial bundle and hurt LCP/TTI (Core Web Vitals
   feed directly into Google's ranking signals). */
import UserLayout from "./userApp/layouts/UserLayout";
import LoadingScreen from "./userApp/components/loading/LoadingScreen";
import NotFoundPage from "./userApp/pages/NotFoundPage";
import ErrorBoundary from "./shared/components/ErrorBoundary";

/* ─── Code-split Lazy Imports ────────────────────────────────────────────── */

// Auth
const AuthRoutes = lazy(() => import("./userApp/routes/AuthRoutes"));

// Public Standalone (no layout)
const EmailVerificationHelp = lazy(
  () => import("./userApp/features/auth/pages/EmailHelpPage"),
);
const HtmlSitemap = lazy(() => import("./userApp/pages/SItemap"));
const SharedTrackingPage = lazy(
  () => import("./userApp/pages/SharedTrackingPage"),
);
const CheckoutPage = lazy(() => import("./userApp/pages/CheckoutPage"));

// Public Storefront (inside UserLayout)
const HomePage = lazy(() => import("./userApp/pages/HomePage"));
const ProductDetailsPage = lazy(
  () => import("./userApp/pages/ProductDetailsPage"),
);
const CollectionPage = lazy(
  () => import("./userApp/features/p/CollectionPage"),
);
const ContactUsPage = lazy(() => import("./userApp/pages/ContactUsPage"));
// Single source of truth for the About Us / Our Story page — was
// previously imported both eagerly (as `OurStory`) and lazily (as
// `AboutUsPage`) from the same file, which duplicated the component in
// the bundle and left the eager copy wired to the route while the lazy
// copy sat unused. Only lazy-load it, like every other content page.
const AboutUsPage = lazy(() => import("./userApp/pages/AboutUsPage"));
const OrderTrackingPage = lazy(
  () => import("./userApp/pages/OrderTrackingPage"),
);
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

const DressesPage = lazy(() => import("./userApp/pages/DressesPage"));
const CoordSetsPage = lazy(() => import("./userApp/pages/CoordSetsPage"));
const NewArrivalsPage = lazy(() => import("./userApp/pages/NewArrivalsPage"));

// Sub-routers with own layouts (full-screen)
const AccountRoutes = lazy(() => import("./userApp/routes/AccountRoutes"));
const CheckoutRoutes = lazy(() => import("./userApp/routes/CheckoutRoutes"));

/* ════════════════════════════════════════════════════════════
   LOADERS & BOUNDARIES
════════════════════════════════════════════════════════════ */

/**
 * Full-screen loader
 * Used for: Auth routes, sub-routers with own layouts, ProtectedRoute auth checks
 */
const FullScreenLoader = () => (
  <div
    className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
    role="status"
    aria-live="polite">
    <LoadingScreen text="Curating your experience..." />
  </div>
);

/**
 * Inline loader
 * Used for: Page content inside UserLayout (Navbar/Footer remain mounted)
 */
const InlineLoader = () => (
  <div
    className="flex items-center justify-center min-h-[60vh] w-full bg-[#f4f4f5]"
    role="status"
    aria-live="polite">
    <LoadingScreen text="Loading..." />
  </div>
);

/**
 * Consistent error boundary for all pages
 */
const PageErrorBoundary = ({ children }) => (
  <ErrorBoundary>{children}</ErrorBoundary>
);

/* ════════════════════════════════════════════════════════════
   SCROLL RESTORATION
   Without this, client-side navigations keep the previous page's
   scroll position, which reads as broken UX and hurts engagement
   signals (bounce rate, time on page) that factor into SEO.
════════════════════════════════════════════════════════════ */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
};

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

/**
 * 404 page wrapper — ensures crawlers get an explicit noindex signal
 * instead of indexing a "not found" URL under the real content.
 * (For true HTTP 404 status codes, the server/SSR layer must also
 * return a 404 status; this covers the client-rendered <head>.)
 */
const NotFoundWithMeta = () => (
  <>
    <Helmet>
      <title>Page Not Found | Mnmukt</title>
      <meta name="robots" content="noindex, follow" />
    </Helmet>
    <NotFoundPage />
  </>
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

        {/* ─── 2. SITEMAP (Static, No Layout) ─────────────────────────── */}
        <Route
          path="/sitemap"
          element={
            <Suspense fallback={<InlineLoader />}>
              <HtmlSitemap />
            </Suspense>
          }
        />

        {/* ─── 3. STANDALONE PUBLIC (No Nav/Footer) ──────────────────── */}
        <Route
          path="/help/email-verification"
          element={
            <Suspense fallback={<InlineLoader />}>
              <EmailVerificationHelp />
            </Suspense>
          }
        />

        <Route
          path="/track-shared/:shareToken"
          element={
            <Suspense fallback={<InlineLoader />}>
              <SharedTrackingPage />
            </Suspense>
          }
        />
        <Route
          path="/checkout/buy-now"
          element={
            <Suspense fallback={<InlineLoader />}>
              <CheckoutPage />
            </Suspense>
          }
        />

        {/* ─── 4. LEGACY / ALIAS REDIRECTS ────────────────────────────
            301-style client redirect so any old links, bookmarks, or
            previously-indexed URLs consolidate onto the one canonical
            path instead of creating duplicate-content URLs. */}
        <Route
          path="/our-story"
          element={<Navigate to="/about-us" replace />}
        />

        {/* ─── 5. PUBLIC STOREFRONT (UserLayout + Navbar/Footer) ──────── */}
        <Route element={<UserLayout />}>
          {/* Home */}
          <Route index element={<LazyPage Component={HomePage} />} />

          {/* Most specific product route first */}
          <Route
            path="/product/:slug"
            element={<LazyPage Component={ProductDetailsPage} />}
          />

          {/* Tracking */}
          <Route
            path="/order-tracking/:orderId"
            element={<LazyPage Component={OrderTrackingPage} />}
          />

          {/* Collections */}
          <Route
            path="/collections/:collectionType"
            element={<LazyPage Component={CollectionPage} />}
          />

          <Route
            path="/dresses"
            element={<LazyPage Component={DressesPage} />}
          />

          <Route
            path="/co-ord-sets"
            element={<LazyPage Component={CoordSetsPage} />}
          />

          <Route
            path="/new-arrivals"
            element={<LazyPage Component={NewArrivalsPage} />}
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

          {/* ─── 6. PROTECTED PAGES (Still inside UserLayout) ──────── */}
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
          <Route path="*" element={<NotFoundWithMeta />} />
        </Route>

        {/* ─── 7. PROTECTED SUB-ROUTERS (Own Full-Screen Layouts) ────── */}
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

        {/* ─── 8. SINGLE PRODUCT CHECKOUT (Catch-all, must stay last) ───
            A bare "/:productSlug" needs to lose to every static route
            above it (auth, sitemap, contact-us, about-us, etc.) or a
            typo'd URL silently renders as a product page instead of a
            real 404 — bad for both users and crawlers. React Router v6
            ranks static segments above dynamic ones regardless of
            declaration order, but keeping it last in source keeps the
            intent obvious and avoids relying on that ranking alone. */}
        <Route
          path="/:productSlug"
          element={
            <Suspense fallback={<InlineLoader />}>
              <SingleItemCheckout />
            </Suspense>
          }
        />
      </Routes>
    ),
    [],
  );

  return (
    <>
      <ScrollToTop />
      {memoizedRoutes}
    </>
  );
};

export default AppRoutes;
