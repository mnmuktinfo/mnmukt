import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../cards/ProductCard";
import TaruVedaProductCard from "../../features/taruveda/components/TaruVedaProductCard";

const ProductSection = ({
  title,
  subtitle,
  products = [],
  loading = false,
  type = "",
  themeColor = "",
  buttonClass = "bg-white text-black border border-[#da127d] hover:opacity-90",
}) => {
  const navigate = useNavigate();

  if (!loading && (!products || products.length === 0)) return null;

  // ✅ show only 4 products
  const visibleProducts = useMemo(() => {
    return products.slice(0, 4);
  }, [products]);

  return (
    <section
      style={{ backgroundColor: themeColor || "#ffffff" }}
      className="max-w-[1600px] py-5 md:py-10  mx-auto px-4 sm:px-6 lg:px-10">
      <div>
        {/* ── PREMIUM HEADER ── */}
        <div className="flex flex-col items-center text-center mb-5 md:mb-10">
          {title && (
            <h2 className="text-[20px] md:text-[25px] font-medium text-[#1a1a1a] tracking-[0.01em] leading-tight">
              {title}
            </h2>
          )}

          {subtitle && (
            <p className="mt-2 text-[15px] md:text-[17px] text-[#2b2a2a] font-normal tracking-[0.02em]">
              {subtitle}
            </p>
          )}
        </div>

        {/* ── GRID ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-8 md:gap-y-14">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col w-full animate-pulse">
                  <div className="w-full aspect-4/5 bg-gray-100 mb-4" />
                  <div className="h-3 bg-gray-200 w-3/4 mb-2 mx-auto" />
                  <div className="h-3 bg-gray-200 w-1/2 mb-4 mx-auto" />
                  <div className="h-4 bg-gray-200 w-1/4 mx-auto" />
                </div>
              ))
            : visibleProducts.map((product) => (
                <div
                  key={product.id || product.sku || product.name}
                  className="w-full">
                  {type === "taruveda" ? (
                    <TaruVedaProductCard product={product} />
                  ) : (
                    <ProductCard product={product} />
                  )}
                </div>
              ))}
        </div>

        {/* ── VIEW COLLECTION BUTTON ── */}
        {!loading && products.length > 3 && (
          <div className="mt-12 flex justify-center">
            <button
              onClick={() => navigate("/products")}
              className={`px-8 py-3 text-[12px] uppercase tracking-[0.18em] transition-all duration-300 ${buttonClass}`}>
              View Collection
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default React.memo(ProductSection);
