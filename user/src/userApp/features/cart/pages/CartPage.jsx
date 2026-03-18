import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "../context/CartContext";
import { useProducts } from "../../product/hook/useProducts";
import { useQueryClient } from "@tanstack/react-query";

import CartItemCard from "../components/cards/CartItemCard";
import CartControlHeader from "../components/header/CartControlHeader";
import CartSummary from "../components/CartSummary";
import EmptyCart from "../components/EmptyCart";
import CartSkeleton from "../components/skeleton/CartSkeleton";

import { Link, useNavigate } from "react-router-dom";
import LoginPopup from "../../../components/pop-up/LoginPoup";
import { useAuth } from "../../auth/context/UserContext";

const CartPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { isLoggedIn } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const { cart, updateQuantity, updateSize, remove, clear } = useCart();
  const { getProductsByIds } = useProducts();

  const [products, setProducts] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [selected, setSelected] = useState([]);

  /*
  ────────────────────────────────────────
  Stable Product ID Signature
  ────────────────────────────────────────
  */
  const cartIds = useMemo(
    () =>
      cart
        .map((i) => String(i.id))
        .sort()
        .join(","),
    [cart],
  );

  const prevCartIds = useRef("");

  /*
  ────────────────────────────────────────
  Fetch Product Details
  ────────────────────────────────────────
  */
  useEffect(() => {
    if (!cart.length) {
      setProducts([]);
      setLoadingDetails(false);
      prevCartIds.current = "";
      return;
    }

    if (cartIds === prevCartIds.current) return;

    let cancelled = false;

    const fetchDetails = async () => {
      setLoadingDetails(true);

      try {
        const ids = cartIds.split(",").filter(Boolean);

        if (!ids.length) {
          setProducts([]);
          return;
        }

        const cachedProducts = ids
          .map((id) => queryClient.getQueryData(["products", "id", id]))
          .filter(Boolean);

        const missingIds = ids.filter(
          (id) => !queryClient.getQueryData(["products", "id", id]),
        );

        let fetchedProducts = [];

        if (missingIds.length) {
          fetchedProducts = await getProductsByIds(missingIds);
        }

        const data = [...cachedProducts, ...fetchedProducts];

        if (!cancelled) {
          setProducts(data.filter(Boolean));
          prevCartIds.current = cartIds;
        }
      } catch (err) {
        console.error("CartPage: failed to load products:", err);
      } finally {
        if (!cancelled) setLoadingDetails(false);
      }
    };

    fetchDetails();

    return () => {
      cancelled = true;
    };
  }, [cartIds, cart.length, getProductsByIds, queryClient]);

  /*
  ────────────────────────────────────────
  Product Map (O(1) lookup)
  ────────────────────────────────────────
  */
  const productMap = useMemo(() => {
    const map = new Map();
    products.forEach((p) => map.set(String(p.id), p));
    return map;
  }, [products]);

  /*
  ────────────────────────────────────────
  Merge Cart + Product Data
  ────────────────────────────────────────
  */
  const mergedCart = useMemo(() => {
    return cart
      .map((cartItem) => {
        const id = String(cartItem.id);
        const product = productMap.get(id);

        if (!product) return null;

        return {
          ...product,
          cartKey: cartItem.cartKey,
          selectedQuantity: cartItem.selectedQuantity || 1,
          selectedSize: cartItem.selectedSize || "",
        };
      })
      .filter(Boolean);
  }, [cart, productMap]);

  /*
  ────────────────────────────────────────
  Auto Select Items
  ────────────────────────────────────────
  */
  const hasAutoSelected = useRef(false);

  useEffect(() => {
    if (mergedCart.length > 0 && !hasAutoSelected.current) {
      setSelected(mergedCart.map((i) => i.cartKey));
      hasAutoSelected.current = true;
    }
  }, [mergedCart]);

  /*
  ────────────────────────────────────────
  Selection Handlers
  ────────────────────────────────────────
  */
  const handleSelectItem = (cartKey) =>
    setSelected((prev) =>
      prev.includes(cartKey)
        ? prev.filter((x) => x !== cartKey)
        : [...prev, cartKey],
    );

  const handleSelectAll = () =>
    setSelected(
      selected.length === mergedCart.length
        ? []
        : mergedCart.map((i) => i.cartKey),
    );

  const selectedItems = useMemo(
    () => mergedCart.filter((i) => selected.includes(i.cartKey)),
    [mergedCart, selected],
  );

  /*
  ────────────────────────────────────────
  Centralized Price Calculations
  ────────────────────────────────────────
  */

  const pricing = useMemo(() => {
    let subtotal = 0;
    let originalTotalPrice = 0;

    selectedItems.forEach((item) => {
      const qty = item.selectedQuantity || 1;
      const price = item.price || 0;
      // Note: Assuming your product object uses 'mrp' or 'originalPrice'.
      // If it doesn't exist, it defaults to the standard price.
      const mrp = item.mrp || item.originalPrice || price;

      subtotal += price * qty;
      originalTotalPrice += mrp * qty;
    });

    // 1. Calculate GST (Example: Flat 18% on subtotal)
    // Adjust this math if your products have individual GST rates
    const gstRate = 0.18;
    const gstAmount = Number((subtotal * gstRate).toFixed(2));

    // 2. Calculate Platform/Shipping Fee (Example: Free over ₹999, else ₹50)
    const platformFee = subtotal > 0 && subtotal < 999 ? 50 : 0;

    // 3. Final Total
    const totalPayable = subtotal + platformFee;

    return {
      subtotal,
      originalTotalPrice,
      platformFee,
      totalPayable,
    };
  }, [selectedItems]);

  /*
  ────────────────────────────────────────
  Checkout
  ────────────────────────────────────────
  */
  const handleCheckout = () => {
    if (!selectedItems.length) {
      alert("Please select at least one item to checkout.");
      return;
    }

    if (!isLoggedIn) {
      setIsLoginOpen(true);
      return;
    }

    navigate("/checkout/address", {
      state: {
        items: selectedItems,
        pricing,
        totalAmount: pricing.totalPayable,
        totalItems: selectedItems.length,
      },
    });
  };

  /*
  ────────────────────────────────────────
  Guards
  ────────────────────────────────────────
  */
  if (loadingDetails && cart.length > 0) return <CartSkeleton />;
  if (!cart.length) return <EmptyCart />;

  /*
  ────────────────────────────────────────
  UI
  ────────────────────────────────────────
  */
  return (
    <div className="min-h-screen mt-5 pb-24 lg:pb-8 text-gray-800">
      {/* Breadcrumbs */}
      <div className="hidden  md:flex text-gray-500 text-sm  flex-wrap gap-1 mb-4 px-4 md:px-0">
        <Link to="/" className="hover:text-gray-800">
          Home
        </Link>
        <span>/</span>
        <span className="text-gray-800 truncate max-w-[150px]">Mnmukt</span>
      </div>

      {/* Header */}
      <header className="hidden  md:flex flex-col items-center text-center mb-16 px-4 md:px-0">
        <span className="text-[#da127d] text-[10px] sm:text-xs uppercase tracking-widest font-semibold mb-2">
          Personal Edit
        </span>

        <h1
          className="text-xl sm:text-2xl md:text-4xl lg:text-5xl text-gray-900 font-light mb-2"
          style={{ fontFamily: "'Playfair Display', serif" }}>
          My Cart
        </h1>

        <p className="text-sm text-gray-400 tracking-wide">
          {cart.length} {cart.length > 1 ? "items" : "item"} saved
        </p>
      </header>

      <div className="mx-auto px-2 pb-8 flex flex-col lg:flex-row gap-8">
        {/* Left Column */}
        <div className="flex-1 space-y-4">
          <div className="bg-white border border-gray-200 rounded-sm shadow-sm">
            <CartControlHeader
              cartItems={mergedCart}
              selectedItems={selected}
              onToggleSelect={handleSelectAll}
              onClearCart={clear}
              totalPrice={pricing.totalPayable} // Updated to show final price
            />

            <div className="divide-y divide-gray-100">
              {mergedCart.map((item) => (
                <div
                  key={item.cartKey}
                  className=" bg-white hover:bg-gray-50/50 transition-colors">
                  <CartItemCard
                    product={item}
                    selected={selected.includes(item.cartKey)}
                    onSelect={() => handleSelectItem(item.cartKey)}
                    onRemove={() => remove(item.cartKey)}
                    onQtyChange={(qty) => updateQuantity(item.cartKey, qty)}
                    onSizeChange={(size) => updateSize(item.cartKey, size)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-full lg:w-[400px]">
          <div className="sticky top-24">
            <CartSummary
              subtotal={pricing.subtotal}
              originalTotalPrice={pricing.originalTotalPrice}
              // gstAmount={pricing.gstAmount}
              platformFee={pricing.platformFee}
              selectedItems={selectedItems}
              onPlaceOrder={handleCheckout}
            />
          </div>
        </div>
      </div>

      {/* Mobile Checkout Bar
      <CheckOutBottomBar
        selectedItems={selectedItems}
        totalPrice={pricing.totalPayable} // Updated to pass the final calculated total
        onPlaceOrder={handleCheckout}
        disabled={!selectedItems.length}
      /> */}

      <LoginPopup isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
};

export default CartPage;
