import { Routes, Route } from "react-router-dom";
import TaruvedaLayout from "../layouts/TaruvedaLayout";
import {
  TaruVedaCartPage,
  TaruVedaCheckoutPage,
  TaruvedaProductPage,
} from "../features/taruveda";

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
