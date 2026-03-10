import React, { useState } from "react";
import { Heart, ShoppingBag, Zap, Check } from "lucide-react";
import { useWishlist } from "../../features/wishList/context/WishlistContext";
import { useCart } from "../../features/cart/context/CartContext";
import { useNavigate } from "react-router-dom";
import NotificationProduct from "./NotificationProduct";

const ProductCard = ({ product }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAdded, setIsAdded] = useState(false);

  // 🔥 New state for handling the notification
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  const {
    isWishlisted,
    toggleWishlist,
    loading: wishlistLoading,
  } = useWishlist();
  const { addToCart, syncing: cartSyncing } = useCart();
  const navigate = useNavigate();

  const isLiked = isWishlisted(product.id);
  const images = product.images?.length > 0 ? product.images : [product.image];

  const formatPrice = (price) => new Intl.NumberFormat("en-IN").format(price);
  const discount =
    product.originalPrice && product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100,
        )
      : 0;

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    try {
      await addToCart({
        id: product.id,
        selectedSize: "", // Consider adding a size picker later
        selectedQuantity: 1,
      });

      setIsAdded(true);

      // 🔥 Show Custom Notification
      setNotification({
        show: true,
        message: "Added to Cart list",
        type: "success",
      });

      setTimeout(() => setIsAdded(false), 2000);
    } catch (err) {
      setNotification({
        show: true,
        message: "Network Error: Failed to add",
        type: "error",
      });
    }
  };

  return (
    <>
      {/* 🔥 Render Notification if state is true */}
      {notification.show && (
        <NotificationProduct
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ ...notification, show: false })}
        />
      )}

      <div
        onClick={() => navigate(`/product/${product.slug}`)}
        className="w-40 md:w-80 group cursor-pointer relative mb-8">
        {/* Badges */}
        <div className="absolute top-2 left-2 z-20 flex flex-col gap-2">
          {discount > 0 && (
            <span className="bg-[#f05e85] text-white px-2 py-1 text-[10px] tracking-[0.2em] uppercase">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          disabled={wishlistLoading}
          className="absolute top-1 right-1 z-20 bg-white/80 backdrop-blur-md rounded-full p-1.5 shadow-sm hover:text-[#ff356c] transition-all">
          <Heart
            size={18}
            className={
              isLiked ? "fill-[#ff356c] text-[#ff356c]" : "text-slate-400"
            }
          />
        </button>

        {/* Image Area */}
        <div className="relative aspect-4/5 overflow-hidden bg-slate-50">
          <img
            src={images[activeIndex]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />

          {/* Add to Cart HUD Button */}
          <button
            onClick={handleAddToCart}
            disabled={cartSyncing || isAdded}
            className={`absolute bottom-4 right-4 z-20 rounded-full p-3 shadow-2xl transition-all duration-500 
              ${isAdded ? "bg-green-600 rotate-360" : "bg-slate-950 hover:bg-[#ff356c]"} text-white`}>
            {isAdded ? <Check size={18} /> : <ShoppingBag size={18} />}
          </button>
        </div>

        {/* Info Area */}
        <div className="mt-4 space-y-2">
          <h3 className="text-sm uppercase tracking-widest text-slate-900 line-clamp-1">
            {product.name}
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-sm font-light text-slate-950">
              ₹{formatPrice(product.price)}
            </span>
            {discount > 0 && (
              <span className="text-[11px] text-slate-300 line-through tracking-tighter">
                ₹{formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductCard;
