import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./AppRoutes";

import { AuthProvider } from "./userApp/features/auth/context/UserContext";
import { CartProvider } from "./userApp/features/cart/context/CartContext";
import { WishlistProvider } from "./userApp/features/wishList/context/WishlistContext";
import { PopupProvider } from "./userApp/context/SignUpPopContext";
import { TaruvedaCartProvider } from "./userApp/context/TaruvedaCartContext";

const App = () => {
  (function () {
    if (typeof window === "undefined") return;

    const stopStyle = `     color:#ff0000;
    font-size:60px;
    font-weight:bold;
    text-shadow:2px 2px black;
  `;

    const brandStyle = `     color:pink;
    font-size:22px;
    font-weight:bold;
  `;

    const textStyle = `     font-size:15px;
    color:white;
  `;

    console.log("%cSTOP!", stopStyle);

    console.log("%cWelcome to MNMUKT.com Developer Console", brandStyle);

    console.log("%cThis area is intended for developers only.", textStyle);

    console.log(
      "%cIf someone told you to paste code here to get free discounts, hack accounts, or unlock features, it is a scam.",
      textStyle,
    );

    console.log(
      "%cPasting unknown code can give attackers access to your account or personal data.",
      textStyle,
    );

    console.log(
      "%cIf you are not a developer, you should close this window and continue shopping at MNMUKT.com.",
      "color:#ff0000;font-size:16px;font-weight:bold;",
    );
  })();

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
