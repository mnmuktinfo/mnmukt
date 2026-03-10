import { Route, Routes } from "react-router-dom";
import { lazy } from "react";
import AdminOrderLayout from "../layouts/AdminOrdersLayout";
import AdminOrdersPage from "../pages/AdminOrdersPage";

const AdminMessages = lazy(() => import("../pages/AdminMessages"));
const AdminCustomers = lazy(() => import("../pages/AdminCustomersPage"));

const AdminOrderRoutes = () => {
  return (
    <Routes>
      <Route>
        <Route index element={<AdminOrdersPage />} />
        <Route path="" element={<AdminOrdersPage />} />

        {/* You can add more specific order pages here later */}
        <Route path="returns" element={<div>Returns Page Placeholder</div>} />
        <Route path="drafts" element={<div>Drafts Page Placeholder</div>} />
      </Route>
    </Routes>
  );
};

export default AdminOrderRoutes;
