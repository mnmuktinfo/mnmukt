import React, { useEffect } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import PWAInstallButton from "./shared/components/PWAInstallButton";

import { AuthProvider } from "./userApp/features/auth/context/UserContext";
import { CartProvider } from "./userApp/features/cart/context/CartContext";
import { WishlistProvider } from "./userApp/features/wishList/context/WishlistContext";
import { PopupProvider } from "./userApp/context/SignUpPopContext";
import { TaruvedaCartProvider } from "./userApp/context/TaruvedaCartContext";

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  useEffect(() => {
    if (!isAdminRoute && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then(() => console.log("SW Registered for User"))
        .catch((err) => console.log("SW Error:", err));
    }
  }, [isAdminRoute]);

  return (
    <>
      <AppRoutes />
      {!isAdminRoute && <PWAInstallButton />}
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <PopupProvider>
              <TaruvedaCartProvider>
                <AppContent />
              </TaruvedaCartProvider>
            </PopupProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
