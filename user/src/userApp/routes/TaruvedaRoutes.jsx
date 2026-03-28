import { Routes, Route } from "react-router-dom";
import TaruvedaLayout from "../layouts/TaruvedaLayout";
import { TaruVedaCartPage, TaruvedaProductPage } from "../features/taruveda";
import TaruVedaCheckoutPage from "../features/taruveda/pages/TaruVedaCheckoutPage";

export default function TaruvedaRoutes() {
  return (
    <Routes>
      <Route element={<TaruvedaLayout />}>
        <Route index element={<TaruvedaProductPage />} />
        <Route path="cart" element={<TaruVedaCartPage />} />
        <Route path="checkout" element={<TaruVedaCheckoutPage />} />
      </Route>
    </Routes>
  );
}
