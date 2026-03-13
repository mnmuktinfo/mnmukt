import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ProductCard from "../cards/ProductCard";
import MoveToCartPopUp from "../../features/wishList/components/pop-up/MoveToCartPopUp";
import Notification from "../../../shared/components/Notification";
import { useProducts } from "../../features/product/hook/useProducts";

const ProductSection = ({
  title,
  subtitle,
  products = [],
  loading = false,
}) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();
  const { prefetchBySlug } = useProducts();

  const showNotification = (msg, type = "info") => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 2000);
  };

  if (!loading && (!products || products.length === 0)) return null;

  return (
    <>
      {/* Global Notification */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
          duration={2000}
        />
      )}

      <section className="w-full bg-white py-10 md:py-14 font-sans">
        <div className="max-w-[1400px] mx-auto   ">
          {/* ── Header Area ── */}
          <div className="flex flex-col items-center justify-center text-center mb-8">
            <h2
              style={{
                fontFamily: "Playfair Display, serif",
              }}
              className="text-center text-3xl md:text-4xl tracking-wide mb-12 text-gray-900">
              {" "}
              {title}
            </h2>
            {subtitle && (
              <p className="text-[11px] md:text-[12px] text-gray-500 uppercase tracking-widest mt-1 font-medium">
                {subtitle}
              </p>
            )}
          </div>

          {/* ── Product Grid ── */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-8 md:gap-x-5 md:gap-y-10">
            {/* Loading Skeletons */}
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex flex-col w-full animate-pulse">
                    <div className="w-full aspect-[3/4] bg-gray-200 mb-3" />
                    <div className="h-3 bg-gray-200 w-3/4 mb-1.5" />
                    <div className="h-2.5 bg-gray-200 w-1/2 mb-3" />
                    <div className="h-3 bg-gray-200 w-1/4" />
                  </div>
                ))
              : /* Actual Products */
                products.slice(0, 8).map((product) => (
                  <div
                    key={product.id || product.sku || product.name}
                    className="w-full animate-in fade-in zoom-in-95 duration-500"
                    onMouseEnter={() => {
                      if (product?.slug) {
                        prefetchBySlug(product.slug);
                      }
                    }}>
                    <ProductCard
                      product={product}
                      onMoveToCart={() => setSelectedProduct(product)}
                    />
                  </div>
                ))}
          </div>

          {/* ── View All Footer ── */}
          {!loading && products.length > 4 && (
            <div className="mt-12 flex flex-col items-center justify-center">
              <button
                onClick={() => navigate("/products")}
                aria-label={`View all ${title} products`}
                className="border border-gray-300 text-gray-800 hover:border-gray-900 hover:bg-gray-900 hover:text-white px-10 py-3.5 text-[11px] font-bold uppercase tracking-widest transition-all duration-300">
                View All
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Cart Popup */}
      {selectedProduct && (
        <MoveToCartPopUp
          open={true}
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onCompleted={() => {
            showNotification("Added to bag!", "success");
            setSelectedProduct(null);
          }}
        />
      )}
    </>
  );
};

export default ProductSection;
