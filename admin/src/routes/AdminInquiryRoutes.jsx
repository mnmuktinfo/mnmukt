import { Route, Routes } from "react-router-dom";
import { lazy } from "react";
import AdminInquiryLayout from "../layouts/AdminInquiryLayout";
// import AdminCustomers from "../features/customers/AdminCustomers";
// import AdminMessages from "../features/message/pages/AdminMessages";

const AdminMessages = lazy(() => import("../pages/AdminMessages"));
const AdminCustomers = lazy(
  () => import("../pages/customer/AdminCustomersPage"),
);

const AdminInquiryRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminInquiryLayout />}>
        <Route index element={<AdminMessages />} />
        <Route path="messages" element={<AdminMessages />} />
        <Route path="messages/new" element={<AdminMessages />} />

        <Route path="lists" element={<AdminCustomers />} />
      </Route>
    </Routes>
  );
};

export default AdminInquiryRoutes;
