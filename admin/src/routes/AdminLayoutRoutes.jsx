import { Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import AdminLayout from "../layouts/AdminLayout";

// ---------------- LAZY-LOADED PAGES ----------------
const ProductsManagementPage = lazy(
  () => import("../pages/product/ProductsManagementPage"),
);
const ProductCreatePage = lazy(
  () => import("../pages/product/ProductCreatePages"),
);
const TestimonialsAdminPage = lazy(
  () => import("../pages/testimonials/TestimonialsAdminPage"),
);
const AdminOrdersPage = lazy(() => import("../pages/AdminOrdersPage"));
const AdminCollectionAddPage = lazy(
  () => import("../pages/collection/AdminCollectionAddPage"),
);
const AdminCollectionListPage = lazy(
  () => import("../pages/collection/AdminCollectionListPage"),
);
const AdminCategories = lazy(
  () => import("../pages/categories/AdminAllCategories"),
);
const CategoryCreatePage = lazy(
  () => import("../pages/categories/CategoryCreatePage"),
);

// ---------------- PROFESSIONAL LOADING SPINNER ----------------
// Flipkart Seller Hub Style - Pure CSS (Zero Icon Dependencies for faster render)
const LoadingSpinner = ({ message = "Loading module..." }) => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#f1f3f6] w-full p-4">
    <div className="flex flex-col items-center gap-4 bg-white px-8 py-6 rounded-sm border border-gray-200 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] animate-in fade-in zoom-in-95 duration-300">
      {/* Tailwind CSS Spinner matching the #2874f0 brand blue */}
      <div className="w-8 h-8 border-[3px] border-[#e0e0e0] border-t-[#2874f0] rounded-full animate-spin"></div>
      <p className="text-[13px] font-medium text-[#878787] tracking-wide">
        {message}
      </p>
    </div>
  </div>
);

// ---------------- ROUTE CONFIGURATION ----------------
const AdminLayoutRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        {/* DASHBOARD / PRODUCTS (Default Route) */}
        <Route
          index
          element={
            <Suspense
              fallback={
                <LoadingSpinner message="Loading Product Catalog..." />
              }>
              <ProductsManagementPage />
            </Suspense>
          }
        />

        {/* CATEGORY ROUTES */}
        <Route
          path="categories"
          element={
            <Suspense
              fallback={<LoadingSpinner message="Loading Categories..." />}>
              <AdminCategories />
            </Suspense>
          }
        />
        <Route
          path="categories/create"
          element={
            <Suspense
              fallback={
                <LoadingSpinner message="Preparing Category Editor..." />
              }>
              <CategoryCreatePage />
            </Suspense>
          }
        />
        <Route
          path="categories/edit/:id"
          element={
            <Suspense
              fallback={
                <LoadingSpinner message="Loading Category Details..." />
              }>
              <CategoryCreatePage />
            </Suspense>
          }
        />

        {/* COLLECTION ROUTES */}
        <Route
          path="collection/list"
          element={
            <Suspense
              fallback={<LoadingSpinner message="Loading Collections..." />}>
              <AdminCollectionListPage collectionName="itemsCollection" />
            </Suspense>
          }
        />
        <Route
          path="collection/add"
          element={
            <Suspense
              fallback={
                <LoadingSpinner message="Preparing Collection Editor..." />
              }>
              <AdminCollectionAddPage collectionName="itemsCollection" />
            </Suspense>
          }
        />
        <Route
          path="collection/add/:id"
          element={
            <Suspense
              fallback={
                <LoadingSpinner message="Loading Collection Details..." />
              }>
              <AdminCollectionAddPage collectionName="itemsCollection" />
            </Suspense>
          }
        />

        {/* PRODUCT ROUTES */}
        <Route
          path="products"
          element={
            <Suspense
              fallback={
                <LoadingSpinner message="Loading Product Catalog..." />
              }>
              <ProductsManagementPage />
            </Suspense>
          }
        />
        <Route
          path="products/create"
          element={
            <Suspense
              fallback={
                <LoadingSpinner message="Preparing Product Editor..." />
              }>
              <ProductCreatePage />
            </Suspense>
          }
        />
        <Route
          path="products/edit/:id"
          element={
            <Suspense
              fallback={
                <LoadingSpinner message="Loading Product Details..." />
              }>
              <ProductCreatePage />
            </Suspense>
          }
        />

        {/* ORDERS & TESTIMONIALS */}
        <Route
          path="orders"
          element={
            <Suspense
              fallback={
                <LoadingSpinner message="Loading Order Management..." />
              }>
              <AdminOrdersPage />
            </Suspense>
          }
        />
        <Route
          path="testimonials"
          element={
            <Suspense
              fallback={<LoadingSpinner message="Loading Testimonials..." />}>
              <TestimonialsAdminPage />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
};

export default AdminLayoutRoutes;
