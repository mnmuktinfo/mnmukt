import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "../context/CartContext";
import { useProducts } from "../../product/hook/useProducts";
import CartItemCard from "../components/cards/CartItemCard";
import CartControlHeader from "../components/header/CartControlHeader";
import CartSummary from "../components/CartSummary";
import CheckOutBottomBar from "../components/bars/CheckOutBottomBar";
import EmptyCart from "../components/EmptyCart";
import CartSkeleton from "../components/skeleton/CartSkeleton";
import { useNavigate } from "react-router-dom";
import LoginPopup from "../../../components/pop-up/LoginPoup";
import { useAuth } from "../../auth/context/UserContext";

const CartPage = () => {
  const navigate = useNavigate();

  const { isLoggedIn } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { cart, updateQuantity, updateSize, remove, clear } = useCart();
  const { getProductsByIds } = useProducts();

  const [products, setProducts] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [selected, setSelected] = useState([]);

  /*
  ────────────────────────────────────────
  Stable ID Signature
  Only changes when items added/removed
  ────────────────────────────────────────
  */
  const cartIds = useMemo(
    () =>
      cart
        .map((i) => String(i.productId ?? i.id))
        .sort()
        .join(","),
    [cart],
  );

  /*
  ────────────────────────────────────────
  Prevent duplicate fetches
  ────────────────────────────────────────
  */
  const prevCartIds = useRef("");

  useEffect(() => {
    if (!cart.length) {
      setProducts([]);
      setLoadingDetails(false);
      prevCartIds.current = "";
      return;
    }

    // prevent re-fetch if same items
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

        const data = await getProductsByIds(ids);

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
  }, [cartIds, getProductsByIds, cart.length]);

  /*
  ────────────────────────────────────────
  Product Map (O(1) lookup)
  Avoids products.find() loops
  ────────────────────────────────────────
  */
  const productMap = useMemo(() => {
    const map = new Map();
    products.forEach((p) => map.set(String(p.id), p));
    return map;
  }, [products]);

  /*
  ────────────────────────────────────────
  Merge cart + product data
  ────────────────────────────────────────
  */
  const mergedCart = useMemo(() => {
    return cart
      .map((cartItem) => {
        const id = String(cartItem.productId ?? cartItem.id);
        const product = productMap.get(id);

        if (!product) return null;

        return {
          ...product,
          selectedQuantity: cartItem.selectedQuantity || 1,
          selectedSize: cartItem.selectedSize || "",
        };
      })
      .filter(Boolean);
  }, [cart, productMap]);

  /*
  ────────────────────────────────────────
  Auto-select all items once
  ────────────────────────────────────────
  */
  const hasAutoSelected = useRef(false);

  useEffect(() => {
    if (mergedCart.length > 0 && !hasAutoSelected.current) {
      setSelected(mergedCart.map((i) => i.id));
      hasAutoSelected.current = true;
    }
  }, [mergedCart]);

  /*
  ────────────────────────────────────────
  Selection handlers
  ────────────────────────────────────────
  */
  const handleSelectItem = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const handleSelectAll = () =>
    setSelected(
      selected.length === mergedCart.length ? [] : mergedCart.map((i) => i.id),
    );

  /*
  ────────────────────────────────────────
  Selected items
  ────────────────────────────────────────
  */
  const selectedItems = useMemo(
    () => mergedCart.filter((i) => selected.includes(i.id)),
    [mergedCart, selected],
  );

  /*
  ────────────────────────────────────────
  Price calculations
  ────────────────────────────────────────
  */
  const subtotal = useMemo(
    () =>
      selectedItems.reduce(
        (sum, i) => sum + (i.price || 0) * (i.selectedQuantity || 1),
        0,
      ),
    [selectedItems],
  );

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
      // Show login popup instead of navigating
      setIsLoginOpen(true);
      return;
    }

    navigate("/checkout/address", {
      state: {
        items: selectedItems,
        totalAmount: subtotal,
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
    <div className="min-h-screen pb-24 lg:pb-8 text-gray-800">
      <div className="max-w-[1200px] mx-auto px-2 py-8 flex flex-col lg:flex-row gap-8">
        {/* Left Column: Product Cards */}
        <div className="flex-1 space-y-4">
          <div className="bg-white border border-gray-200 rounded-sm shadow-sm">
            <CartControlHeader
              cartItems={mergedCart}
              selectedItems={selected}
              onToggleSelect={handleSelectAll}
              onClearCart={clear}
              totalPrice={subtotal}
            />

            <div className="divide-y divide-gray-100">
              {mergedCart.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-white hover:bg-gray-50/50 transition-colors">
                  <CartItemCard
                    product={item}
                    selected={selected.includes(item.id)}
                    onSelect={() => handleSelectItem(item.id)}
                    onRemove={() => remove(item.id)}
                    onQtyChange={(qty) => updateQuantity(item.id, qty)}
                    onSizeChange={(size) => updateSize(item.id, size)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="w-full lg:w-[400px]">
          <div className="sticky top-24">
            <CartSummary
              subtotal={subtotal}
              originalTotalPrice={subtotal}
              platformFee={0}
              selectedItems={selectedItems}
              onPlaceOrder={handleCheckout}
            />
          </div>
        </div>
      </div>

      {/* Mobile Checkout Bar */}
      <CheckOutBottomBar
        selectedItems={selectedItems}
        totalPrice={subtotal}
        onPlaceOrder={handleCheckout}
        disabled={!selectedItems.length || !isLoggedIn}
      />

      <LoginPopup isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
};

export default CartPage;
