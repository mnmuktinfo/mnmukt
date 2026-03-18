import { Route, Routes } from "react-router-dom";
import EditProfilePage from "../features/userProfile/pages/EditProfilePage";
import ProfilePage from "../pages/ProfilePage";
import OrdersPage from "../pages/OrdersPage";
import OrderDetailPage from "../pages/OrderDetailPage";

export default function AccountRoutes() {
  return (
    <Routes>
      <Route>
        <Route index element={<ProfilePage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:orderId" element={<OrderDetailPage />} />
      </Route>
      <Route path="edit" element={<EditProfilePage />} />
    </Routes>
  );
}
