import { Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import AdminLayout from "../layouts/AdminLayout";
import ProductsManagementPage from "../pages/ProductsManagementPage";
import ProductCreatePage from "../pages/ProductCreatePages";
import AdminOrdersPage from "../pages/AdminOrdersPage";
import TestimonialsAdminPage from "../pages/TestimonialsAdminPage";
import TaruvedaAdminCreateProduct from "../pages/TaruvedaAdminCreateProduct";

// Standardizing imports
const AdminDashboard = lazy(() => import("../pages/AdminDashboard"));
const AdminCategories = lazy(() => import("../pages/AdminAllCategories"));
const CategoryCreatePage = lazy(() => import("../pages/CategoryCreatePage"));
const AdminLayoutRoutes = () => {
  return (
    // Added Suspense to prevent the "Hanging" feeling during lazy load
    <Suspense fallback={<div>Loading Registry...</div>}>
      <Routes>
        <Route element={<AdminLayout />}>
          {/* Use absolute paths or relative paths consistently */}
          <Route index element={<AdminDashboard />} />

          {/* CATEGORY PROTOCOLS */}
          <Route path="categories" element={<AdminCategories />} />
          <Route path="categories/create" element={<CategoryCreatePage />} />
          <Route path="categories/edit/:id" element={<CategoryCreatePage />} />
          {/* <Route path="Collection" element={<AdminCollectionPage />} /> */}

          {/* PRODUCT PROTOCOLS */}
          <Route path="products" element={<ProductsManagementPage />} />
          <Route path="products/create" element={<ProductCreatePage />} />
          <Route path="products/edit/:id" element={<ProductCreatePage />} />

          {/* ORDER & CONTENT */}
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="testimonials" element={<TestimonialsAdminPage />} />

          <Route
            path="taruveda/create"
            element={<TaruvedaAdminCreateProduct />}
          />

          {/* AUTH */}
        </Route>
      </Routes>
    </Suspense>
  );
};
export default AdminLayoutRoutes;
