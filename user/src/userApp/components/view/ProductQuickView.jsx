import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../userApp/context/CartContext";
import { useQuickView } from "../../hook/useQuickView";
import Notification from "../../../shared/components/Notification";

import QuickViewImage from "../quickView/QuickViewImages";
import QuickViewColors from "../quickView/QuickViewColors";
import QuickViewSizes from "../quickView/QuickViewSizes";
import QuickViewQuantity from "../quickView/QuickViewQuantity";

import { useState } from "react";
import ProductImageGallery from "../product/ProductImageGallery";

const ProductQuickView = ({ product, open, onClose }) => {
  const navigate = useNavigate();
  const { add } = useCart();
  const [notif, setNotif] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const {
    activeImage,
    setActiveImage,
    selectedSize,
    setSelectedSize,
    selectedColor,
    setSelectedColor,
    qty,
    setQty,
  } = useQuickView(product);

  if (!product) return null;

  const addToCartHandler = async () => {
    await add({
      productId: product.id,
      name: product.name,
      size: selectedSize,
      sizes: product.sizes,
      price: Number(product.price),
      originalPrice: Number(product.originalPrice),
      quantity: qty,
      stock: product.stock,
      image: product.images?.[0],
      slug: product.slug,
    });

    setNotif({
      type: "success",
      message: `${product.name} added to cart`,
    });

    setTimeout(() => {
      onClose();
    }, 500);
  };

  return (
    <>
      {notif && (
        <Notification
          type={notif.type}
          message={notif.message}
          duration={1500}
          onClose={() => setNotif(null)}
        />
      )}

      {/* OVERLAY */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 transition-all duration-300
        ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }
        md:flex md:items-center md:justify-center
      `}
        onClick={onClose}>
        {/* MAIN WRAPPER (mobile bottom sheet + desktop modal) */}
        <div
          onClick={(e) => e.stopPropagation()}
          className={`bg-white shadow-2xl w-full transition-all duration-300
            md:max-w-4xl md:max-h-[85vh] md:rounded-xl md:relative

            /* Mobile styles */
            // fixed md:static bottom-0 left-0 right-0
            // max-h-100vh rounded-t-2xl md:rounded-xl

            ${
              open
                ? "translate-y-0 opacity-100"
                : "translate-y-full md:scale-95 opacity-0"
            }
          `}>
          {/* Mobile drag handle */}
          <div className="md:hidden w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-2" />

          {/* CLOSE BUTTON */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-black z-10">
            <X size={26} />
          </button>

          {/* CONTENT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 overflow-y-auto max-h-[80vh]">
            {/* Product Images */}
            <div className="">
              <ProductImageGallery
                images={product.images}
                activeIndex={activeImageIndex}
                onImageChange={setActiveImageIndex}
                productName={product.name}
              />
            </div>
            <div className="pr-2">
              <h2 className="text-xl uppercase font-[Poppins]">
                {product.name}
              </h2>

              <p className="text-2xl font-bold text-pink-600 mt-3">
                MRP ₹{product.price}
              </p>

              <QuickViewColors
                colors={product.colors}
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
              />

              <QuickViewSizes
                sizes={product.sizes}
                selectedSize={selectedSize}
                setSelectedSize={setSelectedSize}
              />

              <QuickViewQuantity qty={qty} setQty={setQty} />

              <button
                onClick={addToCartHandler}
                className="w-full mt-6 bg-black text-white py-3 rounded-xl font-semibold">
                Add to Cart
              </button>

              <button
                onClick={() => navigate(`/product/${product.slug}`)}
                className="mt-4 w-full py-3 border rounded-xl font-semibold">
                View Full Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductQuickView;
