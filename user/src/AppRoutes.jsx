import { Suspense, lazy } from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./userApp/features/auth/context/UserContext";

/* ─── Eager Components (only what renders on EVERY page) ─────────────────── */
import UserLayout from "./userApp/layouts/UserLayout";
import LoadingScreen from "./userApp/components/loading/LoadingScreen";
import NotFoundPage from "./userApp/pages/NotFoundPage";
import ErrorBoundary from "./shared/components/ErrorBoundary";

/* ─── Lazy: Auth ─────────────────────────────────────────────────────────── */
const AuthRoutes = lazy(() => import("./userApp/routes/AuthRoutes"));

/* ─── Lazy: Standalone Public (no layout) ────────────────────────────────── */
const EmailVerificationHelp = lazy(
  () => import("./userApp/features/auth/pages/EmailHelpPage"),
);
const OrderConfirmationPage = lazy(
  () => import("./userApp/components/pop-up/OrderConfirmationPage"),
);

/* ─── Lazy: Public Storefront ────────────────────────────────────────────── */
const HomePage = lazy(() => import("./userApp/pages/HomePage"));
const CollectionPage = lazy(
  () => import("./userApp/features/p/CollectionPage"),
);
const CategoriesPage = lazy(
  () => import("./userApp/features/category/pages/CategoriesPage"),
);
const ProductDetailsPage = lazy(
  () => import("./userApp/pages/ProductDetailsPage"),
);
const ContactUsPage = lazy(() => import("./userApp/pages/ContactUsPage"));
const AboutUsPage = lazy(() => import("./userApp/pages/AboutUsPage")); // ✅ Fixed: was eager before

/* ─── Lazy: Protected Pages ──────────────────────────────────────────────── */
const WishlistPage = lazy(
  () => import("./userApp/features/wishList/pages/WishlistPage"),
);
const NotificationPreferencesPage = lazy(
  () => import("./userApp/pages/NotificationPreferences"),
);

/* ─── Lazy: Sub-routers ──────────────────────────────────────────────────── */
const AccountRoutes = lazy(() => import("./userApp/routes/AccountRoutes"));
const CheckoutRoutes = lazy(() => import("./userApp/routes/CheckoutRoutes"));
const TaruvedaRoutes = lazy(
  () => import("./userApp/features/taruveda/routes/TaruvedaRoutes"),
);

/* ════════════════════════════════════════════════════════════
   LOADERS
════════════════════════════════════════════════════════════ */

/**
 * Full-screen loader — used only for:
 *  - Auth routes (own layout, user hasn't landed yet)
 *  - Heavy sub-routers with their own layout (/user/*, /checkout/*, /taruveda-*)
 *  - ProtectedRoute while auth state is resolving
 *
 * Keeps the loading UX intentional and avoids flashing a blank screen
 * for pages that are just inside UserLayout.
 */
const FullScreenLoader = () => (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
    <LoadingScreen text="Curating your experience..." />
  </div>
);

/**
 * Inline loader — used for all pages inside UserLayout.
 * Navbar and Footer stay mounted; only the page content area shows a spinner.
 * This prevents the layout from unmounting/remounting on every navigation.
 */
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

  // Show full-screen loader while auth state resolves (e.g. token refresh)
  if (authLoading) return <FullScreenLoader />;

  if (!isLoggedIn || !user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

/* ════════════════════════════════════════════════════════════
   APP ROUTES
════════════════════════════════════════════════════════════ */
const AppRoutes = () => (
  <Routes>
    {/* ── A. AUTH (own layout inside AuthRoutes) ────────────────────────── */}
    {/*
        FullScreenLoader is correct here: the user has no layout yet,
        and AuthRoutes loads its own shell.
    */}
    <Route
      path="/auth/*"
      element={
        <Suspense fallback={<FullScreenLoader />}>
          <AuthRoutes />
        </Suspense>
      }
    />

    {/* ── B. TARUVEDA (own layout inside TaruvedaRoutes) ────────────────── */}
    <Route
      path="/taruveda-organic-shampoo-oil/*"
      element={
        <Suspense fallback={<FullScreenLoader />}>
          <TaruvedaRoutes />
        </Suspense>
      }
    />

    {/* ── C. STANDALONE PUBLIC (no Navbar/Footer) ──────────────────────── */}
    {/*
        These pages have no shared layout wrapper, so each needs its own
        Suspense. InlineLoader is fine here — no layout is mounted anyway.
    */}
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

    {/* ── D. PUBLIC STOREFRONT (Navbar + Footer via UserLayout) ─────────── */}
    {/*
        UserLayout is eager — it always mounts immediately so the Navbar
        and Footer are never delayed. Only the page-content slot (Outlet)
        suspends while the lazy chunk downloads.

        One Suspense boundary wraps the Outlet inside UserLayout itself
        (or per-route as below) so the shell stays stable.

        Rule: Use InlineLoader for everything inside UserLayout.
    */}
    <Route element={<UserLayout />}>
      {/* Home */}
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

      {/* Collections */}
      <Route
        path="/collections/:collectionType"
        element={
          <Suspense fallback={<InlineLoader />}>
            <CollectionPage />
          </Suspense>
        }
      />

      {/* Product detail */}
      <Route
        path="/product/:slug"
        element={
          <Suspense fallback={<InlineLoader />}>
            <ProductDetailsPage />
          </Suspense>
        }
      />

      {/* Categories */}
      <Route
        path="/categories"
        element={
          <Suspense fallback={<InlineLoader />}>
            <CategoriesPage />
          </Suspense>
        }
      />

      {/* Contact */}
      <Route
        path="/contact-us"
        element={
          <Suspense fallback={<InlineLoader />}>
            <ContactUsPage />
          </Suspense>
        }
      />

      {/* About — ✅ Fixed: now lazy, was eagerly imported before */}
      <Route
        path="/about-us"
        element={
          <Suspense fallback={<InlineLoader />}>
            <AboutUsPage />
          </Suspense>
        }
      />

      {/* ── E. PROTECTED STOREFRONT (same Navbar/Footer) ──────────────── */}
      {/*
          ProtectedRoute sits inside UserLayout so the Navbar stays
          mounted even while auth state is resolving. The FullScreenLoader
          inside ProtectedRoute will overlay the page during auth check.
      */}
      <Route element={<ProtectedRoute />}>
        <Route
          path="/wishlist"
          element={
            <Suspense fallback={<InlineLoader />}>
              <WishlistPage />
            </Suspense>
          }
        />
        <Route
          path="/notifications"
          element={
            <Suspense fallback={<InlineLoader />}>
              <NotificationPreferencesPage />
            </Suspense>
          }
        />
      </Route>

      {/* ── G. 404 (inside UserLayout so Navbar shows) ────────────────── */}
      <Route path="*" element={<NotFoundPage />} />
    </Route>

    {/* ── F. PROTECTED SUB-ROUTERS (own layouts inside) ────────────────── */}
    {/*
        These have their own full-screen layouts (/user/*, /checkout/*),
        so FullScreenLoader is correct — the sub-router renders its own shell.
    */}
    <Route element={<ProtectedRoute />}>
      <Route
        path="/user/*"
        element={
          <Suspense fallback={<FullScreenLoader />}>
            <AccountRoutes />
          </Suspense>
        }
      />
      <Route
        path="/checkout/*"
        element={
          <Suspense fallback={<FullScreenLoader />}>
            <CheckoutRoutes />
          </Suspense>
        }
      />
    </Route>
  </Routes>
);

export default AppRoutes;
