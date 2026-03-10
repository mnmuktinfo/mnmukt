// routes/index.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

/* ----------------- LAYOUTS ----------------- */
import UserLayout from "../user/layouts/UserLayout";
import AdminLayout from "../user/layouts/AdminLayout";

/* ----------------- USER PAGES ----------------- */
import ViewItems from "../user/pages/HomePage";
import ItemDetails from "../pages/User/ItemDetails";
import CartPage from "../pages/Cart/CartPage";
import CheckoutPage from "../pages/User/CheckoutPage";
import CategoryPage from "../pages/User/CategoryPage";
import EnquiryForm from "../pages/User/EnquiryForm";
import AccountPage from "../pages/User/Account";

/* ----------------- ADMIN PAGES ----------------- */
import AdminDashboard from "../pages/Admin/AdminDashboard";
import AdminUsersPage from "../pages/Admin/AdminUsersPage";
import AdminCategoryPage from "../pages/Admin/AdminCategoryPage";
import AddItem from "../pages/Admin/AddItems";

/* ----------------- AUTH PAGES ----------------- */
import LoginPage from "../pages/AuthPages/LoginPage";
import SignupPage from "../pages/AuthPages/SignupPage";
import AboutUs from "../pages/User/AboutUs";
import EmailVerificationNotice from "../user/pages/EmailVerificationNotice";
import NotFoundPage from "../user/pages/NotFoundPage";
import HomePage from "../user/pages/HomePage";
import CollectionPage from "../user/pages/CollectionsPage";
import WishlistPage from "../user/pages/WishlistPage";

/* ----------------- CHECK LOGIN ----------------- */
const user = JSON.parse(localStorage.getItem("user"));
console.log(user);
const isAdmin = user?.role === "admin";

/* =================================================
   ✅ SINGLE ROUTES FILE — CLEAN + EASY TO READ
   ================================================= */
const AppRoutes = () => {
  return (
    <Routes>
      {/* ✅ PUBLIC AUTH ROUTES */}
      <Route
        path="/account/email-verification"
        element={<EmailVerificationNotice />}
      />

      <Route path="account/login" element={<LoginPage />} />
      <Route path="account/register" element={<SignupPage />} />

      {/* ✅ USER ROUTES (only if logged in) */}
      {user && (
        <Route path="/" element={<UserLayout />}>
          <Route index element={<HomePage />} />

          <Route
            path="item/:id/:name/:category/:subcategory"
            element={<ItemDetails />}
          />
          <Route path="item" element={<CollectionPage />} />

          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="cart" element={<CartPage />} />

          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="additem" element={<AddItem />} />
          <Route path="category/:categoryName" element={<CategoryPage />} />
          <Route path=":id/:name/:type/enquiry" element={<EnquiryForm />} />
          <Route path="about" element={<AboutUs />} />
        </Route>
      )}

      {/* ✅ IF USER NOT LOGGED IN → HOME PAGE */}
      {!user && <Route path="/" element={<HomePage />} />}

      {/* ✅ ADMIN ROUTES */}
      {isAdmin && (
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="categories" element={<AdminCategoryPage />} />
          <Route path="items" element={<AddItem />} />
        </Route>
      )}

      {/* ✅ SHARED ROUTES */}
      <Route path="/account" element={<AccountPage />} />

      {/* ✅ FALLBACK */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
