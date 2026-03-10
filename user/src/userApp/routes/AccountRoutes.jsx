import { Route, Routes } from "react-router-dom";
import AccountLayout from "../layouts/AccountLayout";
import EditProfilePage from "../features/userProfile/pages/EditProfilePage";
import ProfilePage from "../pages/ProfilePage";

export default function AccountRoutes() {
  return (
    <Routes>
      <Route element={<AccountLayout />}>
        <Route index element={<ProfilePage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="edit" element={<EditProfilePage />} />
    </Routes>
  );
}
