import { Route, Routes } from "react-router-dom";
import { lazy } from "react";
import AdminInquiryLayout from "../layouts/AdminInquiryLayout";

const AdminMessages = lazy(() => import("../pages/AdminMessages"));
const AdminCustomers = lazy(() => import("../pages/AdminCustomersPage"));

const AdminInquiryRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminInquiryLayout />}>
        <Route index element={<AdminMessages />} />
        <Route path="messages" element={<AdminMessages />} />

        <Route path="lists" element={<AdminCustomers />} />
      </Route>
    </Routes>
  );
};

export default AdminInquiryRoutes;
