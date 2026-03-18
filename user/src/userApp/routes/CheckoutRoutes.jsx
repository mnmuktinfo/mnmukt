import React from "react";
import { Route, Routes } from "react-router-dom";
import CheckoutLayout from "../layouts/CheckoutLayout";
import CartPage from "../features/cart/pages/CartPage";
import AddressPage from "../pages/AddressPage";

const CheckoutRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<CheckoutLayout />}>
        <Route path="cart" element={<CartPage />} />
        <Route path="address" element={<AddressPage />} />

        <Route index element={<CartPage />} />
      </Route>
    </Routes>
  );
};

export default CheckoutRoutes;
