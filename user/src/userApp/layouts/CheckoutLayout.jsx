import React from "react";
import { Outlet } from "react-router-dom";
import CheckoutNavbar from "../features/cart/components/bars/CheckoutNavbar";

const CheckoutLayout = () => {
  return (
    <div className="w-full min-h-screen   bg-white">
      <CheckoutNavbar />

      <div className="max-w-7xl mx-auto   ">
        <Outlet />
      </div>
    </div>
  );
};

export default CheckoutLayout;
