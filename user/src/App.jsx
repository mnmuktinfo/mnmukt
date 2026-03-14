import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./AppRoutes";

import { AuthProvider } from "./userApp/features/auth/context/UserContext";
import { CartProvider } from "./userApp/features/cart/context/CartContext";
import { WishlistProvider } from "./userApp/features/wishList/context/WishlistContext";
import { PopupProvider } from "./userApp/context/SignUpPopContext";
import { TaruvedaCartProvider } from "./userApp/context/TaruvedaCartContext";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <PopupProvider>
              <TaruvedaCartProvider>
                <AppRoutes />
              </TaruvedaCartProvider>
            </PopupProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
