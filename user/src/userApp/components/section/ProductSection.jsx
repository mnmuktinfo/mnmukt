import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ProductCard from "../cards/ProductCard";

const ProductSection = ({
  title,
  subtitle,
  products = [],
  loading = false,
}) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();

  if (!loading && (!products || products.length === 0)) return null;

  return (
    <>
      <section className="w-full bg-white py-16 md:py-24 font-sans border-b border-gray-100">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10">
          {/* Header */}
          <div className="flex flex-col items-center justify-center text-center mb-12 md:mb-16">
            {subtitle && (
              <span className="text-[#da127d] uppercase tracking-[0.2em] text-xs font-semibold mb-3 block">
                {subtitle}
              </span>
            )}

            <h2
              style={{ fontFamily: "'Playfair Display', serif" }}
              className="text-3xl md:text-4xl lg:text-5xl tracking-wide text-gray-900">
              {title}
            </h2>

            <div className="w-16 h-[1px] bg-[#da127d] mx-auto mt-6 opacity-50"></div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-8 md:gap-y-14">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex flex-col w-full animate-pulse">
                    <div className="w-full aspect-[3/4] bg-gray-100 rounded-sm mb-4" />
                    <div className="h-3 bg-gray-200 w-3/4 mb-2 mx-auto rounded" />
                    <div className="h-3 bg-gray-200 w-1/2 mb-4 mx-auto rounded" />
                    <div className="h-4 bg-gray-200 w-1/4 mx-auto rounded" />
                  </div>
                ))
              : products.slice(0, 8).map((product) => (
                  <div
                    key={product.id || product.sku || product.name}
                    className="w-full group animate-in fade-in zoom-in-95 duration-700">
                    <ProductCard
                      product={product}
                      onMoveToCart={() => setSelectedProduct(product)}
                    />
                  </div>
                ))}
          </div>

          {/* View All */}
          {!loading && products.length > 4 && (
            <div className="mt-16 flex flex-col items-center justify-center">
              <button
                onClick={() => navigate("/products")}
                aria-label={`View all ${title} products`}
                className="border border-[#da127d] text-[#da127d] hover:bg-[#da127d] hover:text-white px-10 py-3.5 text-[12px] font-semibold uppercase tracking-widest transition-colors duration-300">
                View All {title}
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default ProductSection;
