import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

/* Layout */
import AdminTaruvedaLayout from "../layouts/AdminTaruvedaLayout";

/* Lazy Pages */
const TaruvedaProductList = lazy(
  () => import("../pages/taruveda/TaruvedaProductList"),
);

const TaruvedaAdminCreateProduct = lazy(
  () => import("../pages/taruveda/TaruvedaAdminCreateProduct"),
);

/* Lightweight Loader */

const RouteLoader = () => (
  <div className="flex items-center justify-center py-24">
    <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
  </div>
);

const TaruvedaRoutes = () => {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        <Route element={<AdminTaruvedaLayout />}>
          {/* Dashboard / Default */}
          <Route index element={<TaruvedaProductList />} />

          {/* Product List */}
          <Route path="products" element={<TaruvedaProductList />} />

          {/* Create Product */}
          <Route path="products/new" element={<TaruvedaAdminCreateProduct />} />

          {/* Edit Product */}
          <Route
            path="products/edit/:id"
            element={<TaruvedaAdminCreateProduct />}
          />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default TaruvedaRoutes;
