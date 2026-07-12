import React from "react";
import { useNavigate } from "react-router-dom";

import { useCart } from "../../features/cart/context/CartContext";
import { OrderPricingService } from "../../features/orders/services/core/orderPricing.service";

import CartView from "./CartView";

/**
 * CartDrawer
 * ----------
 * Slide-in side panel showing the current cart.
 * - Slides in from the right when `isOpen` is true, slides back out when false.
 * - Only renders the cart list/summary (CartView) — the old in-drawer
 *   "Address" step has been moved to its own dedicated page, so this
 *   component no longer needs to handle multiple steps.
 */
const CartDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  // Cart items + mutation helpers (quantity update, remove) come from
  // the shared CartContext, so this stays in sync with the rest of the app.
  const { cart, updateQuantity, remove } = useCart();

  // Recalculate pricing (subtotal, discounts, etc.) on every render so
  // the drawer always reflects the latest cart contents.
  const pricing = OrderPricingService.calculatePricing(cart);

  // Runs when the user clicks "Proceed" inside CartView.
  const handleProceedToCheckout = () => {
    // 1. Close the drawer so it doesn't stay open behind the checkout page.
    onClose();

    // 2. Go to the unified checkout page, passing the cart items and a
    //    "type" flag so checkout knows this came from the cart flow
    //    (as opposed to a single-item "buy now" flow).
    navigate("/checkout/buy-now", {
      state: {
        items: cart,
        type: "cart",
      },
    });
  };

  return (
    <>
      {/* Backdrop overlay behind the drawer.
          - Fades in/out with `opacity` based on `isOpen`.
          - `pointer-events-none` when closed so it can't block clicks
            on the rest of the page.
          - Clicking it closes the drawer. */}
      <div
        className={`fixed inset-0 z-[400] bg-black/50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer panel.
          - `translate-x-full` pushes it off-screen (right side) when closed.
          - `translate-x-0` slides it fully into view when open. */}
      <div
        className={`fixed inset-y-0 right-0 z-[500] w-full max-w-md bg-white shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}>
        {/* Only CartView is rendered here — the address step now lives
            on its own route, so no multi-step view is needed inside the drawer. */}
        <CartView
          cart={cart}
          pricing={pricing}
          isLoading={false} // Checkout is no longer triggered from this drawer, so there's nothing to show a loading state for here
          onUpdateQuantity={updateQuantity}
          onRemove={remove}
          onProceedToAddress={handleProceedToCheckout} // Prop name kept for CartView's existing API, but it now redirects straight to checkout
          onClose={onClose}
        />
      </div>
    </>
  );
};

export default CartDrawer;
