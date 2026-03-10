import { useEffect, useMemo, useState } from "react";
import { useCart } from "../context/CartContext";
import { useProducts } from "../../product/hook/useProducts";
import CartItemCard from "../components/cards/CartItemCard";
import CartControlHeader from "../components/header/CartControlHeader";
import CartSummary from "../components/CartSummary";
import CheckOutBottomBar from "../components/bars/CheckOutBottomBar";
import EmptyCart from "../components/EmptyCart";
import CartSkeleton from "../components/skeleton/CartSkeleton";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, updateSize, remove, clear } = useCart();
  // console.log(cart);
  // Ensure you are importing the SAFE version of getProductById or getProductsByIds
  const { getProductById } = useProducts();
  // console.log(cart);
  const [products, setProducts] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(true); // Local loading state
  const [selected, setSelected] = useState([]);

  // 1️⃣ OPTIMIZED FETCHING: Only fetch when Item IDs change (not quantities)
  // We create a string signature of IDs to track changes efficiently
  const cartIds = useMemo(
    () =>
      cart
        .map((item) => item.id)
        .sort()
        .join(","),
    [cart],
  );

  useEffect(() => {
    if (!cart.length) {
      setLoadingDetails(false);
      return;
    }

    const fetchDetails = async () => {
      setLoadingDetails(true);
      try {
        // Safe mapping with String conversion to prevent crashes
        const promises = cart.map((item) => getProductById(String(item.id)));
        const data = await Promise.all(promises);

        // Filter out nulls (deleted products)
        setProducts(data.filter(Boolean));
      } catch (err) {
        console.error("Error loading cart details:", err);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchDetails();
  }, [cartIds]); // 🔥 Only runs if items are added/removed, NOT on qty change

  // 2️⃣ MERGE CART: Combine local cart data with fetched product details
  const mergedCart = useMemo(() => {
    return cart
      .map((cartItem) => {
        // Robust ID comparison (String vs Number safe)
        const product = products.find(
          (p) => String(p.id) === String(cartItem.id),
        );
        if (!product) return null;

        return {
          ...product,
          selectedQuantity: cartItem.selectedQuantity || 1, // Fallback to 1
          selectedSize: cartItem.selectedSize || "",
        };
      })
      .filter(Boolean);
  }, [cart, products]);

  // 3️⃣ SMART SELECTION: Only select all on FIRST load
  useEffect(() => {
    if (mergedCart.length > 0 && selected.length === 0) {
      // Only auto-select if nothing is selected (First load)
      setSelected(mergedCart.map((i) => i.id));
    }
  }, [products]); // Run only when products arrive

  const handleSelectItem = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selected.length === mergedCart.length) {
      setSelected([]); // Unselect All
    } else {
      setSelected(mergedCart.map((i) => i.id)); // Select All
    }
  };

  // 3️⃣ NEW CHECKOUT FUNCTION
  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one item to checkout.");
      return;
    }

    // We pass the data via 'state' so it doesn't clutter the URL
    // selectedItems already contains: id, name, price, selectedQuantity, selectedSize
    navigate("/checkout/address", {
      state: {
        items: selectedItems,
        totalAmount: subtotal,
        totalItems: selectedItems.length,
      },
    });
  };
  // 4️⃣ RENDERING
  if (loadingDetails && cart.length > 0) return <CartSkeleton />;
  if (!cart.length) return <EmptyCart />;

  const selectedItems = mergedCart.filter((i) => selected.includes(i.id));

  const subtotal = selectedItems.reduce(
    (sum, i) => sum + (i.price || 0) * (i.selectedQuantity || 1),
    0,
  );

  return (
    <div className="max-w-7xl  mb-6 mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
      {/* LEFT - CART ITEMS */}
      <div className="flex-1 space-y-6">
        <CartControlHeader
          cartItems={mergedCart}
          selectedItems={selected}
          onToggleSelect={handleSelectAll}
          onClearCart={clear}
          totalPrice={subtotal}
        />

        <div className="space-y-4">
          {mergedCart.map((item) => (
            <CartItemCard
              key={item.id}
              product={item}
              selected={selected.includes(item.id)}
              onSelect={() => handleSelectItem(item.id)}
              onRemove={() => remove(item.id)}
              onQtyChange={(newQty) => updateQuantity(item.id, newQty)}
              onSizeChange={(newSize) => updateSize(item.id, newSize)}
            />
          ))}
        </div>
      </div>

      {/* RIGHT - SUMMARY (Sticky on Desktop) */}
      <div className="hidden lg:block lg:w-96">
        <div className="sticky top-24">
          <CartSummary
            subtotal={subtotal}
            originalTotalPrice={subtotal} // You can add logic for discount calculation here
            platformFee={0} // Usually 0 unless specified
            selectedItems={selectedItems}
            onPlaceOrder={handleCheckout}
          />
        </div>
      </div>

      {/* MOBILE BOTTOM BAR */}
      <CheckOutBottomBar
        selectedItems={selectedItems}
        totalPrice={subtotal}
        onPlaceOrder={handleCheckout}
      />
    </div>
  );
};

export default CartPage;
