import { Suspense, lazy } from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./userApp/features/auth/context/UserContext";

/* ─── Eager: needed before any route renders ────────────────────────────────
   These must NOT be lazy — they render on every page load.              */
import UserLayout from "./userApp/layouts/UserLayout";
import LoadingScreen from "./userApp/components/loading/LoadingScreen";
import NotFoundPage from "./userApp/pages/NotFoundPage";

/* ─── Lazy: auth (lightest bundle — load immediately) ───────────────────── */
const AuthRoutes = lazy(() => import("./userApp/routes/AuthRoutes"));

/* ─── Lazy: storefront ───────────────────────────────────────────────────── */
const HomePage = lazy(() => import("./userApp/pages/HomePage"));
const CategoriesPage = lazy(
  () => import("./userApp/features/category/pages/CategoriesPage"),
);
const ProductDetailsPage = lazy(
  () => import("./userApp/pages/ProductDetailsPage"),
);
const ContactUsPage = lazy(() => import("./userApp/pages/ContactUsPage"));

/* ─── Lazy: protected storefront ─────────────────────────────────────────── */
const WishlistPage = lazy(
  () => import("./userApp/features/wishList/pages/WishlistPage"),
);
const SettingsPage = lazy(() => import("./userApp/pages/SettingsPage"));
const NotificationPreferencesPage = lazy(
  () => import("./userApp/pages/NotificationPreferences"),
);

/* ─── Lazy: sub-routers ──────────────────────────────────────────────────── */
const AccountRoutes = lazy(() => import("./userApp/routes/AccountRoutes"));
const CheckoutRoutes = lazy(() => import("./userApp/routes/CheckoutRoutes"));
const TaruvedaRoutes = lazy(() => import("./userApp/routes/TaruvedaRoutes"));

/* ════════════════════════════════════════════════════════════
   LOADERS
   Inline spinner — shown only within a layout section,
   NOT full-screen, so Navbar never flashes away mid-nav.
════════════════════════════════════════════════════════════ */
const FullScreenLoader = () => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#FBF8F3",
    }}>
    <LoadingScreen />
  </div>
);

// Lightweight inline loader — used inside layouts so Navbar stays visible
const InlineLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <LoadingScreen />
  </div>
);

/* ════════════════════════════════════════════════════════════
   PROTECTED ROUTE
   ✅ FIX Minor: removed memo — useAuth() re-renders it anyway
════════════════════════════════════════════════════════════ */
const ProtectedRoute = ({ adminOnly = false }) => {
  const { isLoggedIn, user, authLoading } = useAuth();
  const location = useLocation();

  // Wait for Firebase to confirm auth state before deciding
  if (authLoading) return <FullScreenLoader />;

  if (!isLoggedIn || !user)
    return <Navigate to="/auth/login" state={{ from: location }} replace />;

  if (adminOnly && user.role !== "admin") return <Navigate to="/" replace />;

  return <Outlet />;
};

/* ════════════════════════════════════════════════════════════
   APP ROUTES
════════════════════════════════════════════════════════════ */
const AppRoutes = () => (
  // ✅ FIX 3: Top-level Suspense only for auth routes (no layout)
  // Each section below has its OWN Suspense so Navbar never disappears
  <Routes>
    {/* ── A. AUTH (no layout, full-screen loader is fine here) ── */}
    <Route
      path="/auth/*"
      element={
        <Suspense fallback={<FullScreenLoader />}>
          <AuthRoutes />
        </Suspense>
      }
    />

    {/* ── B. PUBLIC STOREFRONT (Navbar + Footer always visible) ── */}
    <Route element={<UserLayout />}>
      <Route
        index
        element={
          // ✅ SPEED: HomePage loads independently — other pages don't block it
          <Suspense fallback={<InlineLoader />}>
            <HomePage />
          </Suspense>
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
    </Route>

    {/* ── C. PROTECTED STOREFRONT (still has Navbar via UserLayout) ── */}
    {/* ✅ FIX 2: wishlist, settings, notifications moved to protected */}
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

    {/* ── D. PROTECTED SUB-ROUTERS ── */}
    <Route element={<ProtectedRoute />}>
      {/* ✅ FIX 1: removed duplicate user/orders routes — they belong
          INSIDE AccountRoutes. user/* wildcard was swallowing them. */}
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

    {/* ── E. 404 ── */}
    <Route element={<UserLayout />}>
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
);

export default AppRoutes;
