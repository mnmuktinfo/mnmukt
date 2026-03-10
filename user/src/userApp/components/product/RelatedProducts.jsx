import React, { useEffect, useState, useCallback } from "react";
import { ArrowRight } from "lucide-react";
import { useProducts } from "../../features/product/hook/useProducts";
import ProductCard from "../cards/ProductCard";

const RelatedProducts = ({ currentProductId, categoryId, collectionType }) => {
  const { getProductsByCategory, getProductsByCollection } = useProducts();
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRelatedProducts = useCallback(async () => {
    try {
      setLoading(true);
      let products = [];

      // Prioritize Category fetching, fallback to Collection
      if (categoryId) {
        products = await getProductsByCategory(categoryId);
      } else if (collectionType) {
        products = await getProductsByCollection(collectionType);
      }

      // Filter current, shuffle for variety, and limit to 4
      const filtered = products
        .filter((product) => product.id !== currentProductId)
        .sort(() => 0.5 - Math.random()) // Soft shuffle for premium "discovery" feel
        .slice(0, 4);

      setRelatedProducts(filtered);
    } catch (error) {
      console.error("Error loading related products:", error);
    } finally {
      setLoading(false);
    }
  }, [
    currentProductId,
    categoryId,
    collectionType,
    getProductsByCategory,
    getProductsByCollection,
  ]);

  useEffect(() => {
    loadRelatedProducts();
  }, [loadRelatedProducts]);

  if (!loading && relatedProducts.length === 0) return null;

  return (
    <section className="py-20 border-t border-gray-50">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">
            Curated For You
          </span>
          <h2 className="text-3xl font-serif text-gray-900 italic">
            You may also like
          </h2>
        </div>

        <button className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black hover:opacity-60 transition-all border-b border-black pb-1">
          View Collection
          <ArrowRight
            size={14}
            className="transition-transform group-hover:translate-x-1"
          />
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-8">
        {loading ? (
          <RelatedSkeleton />
        ) : (
          relatedProducts.map((product) => (
            <div
              key={product.id}
              className="animate-in fade-in zoom-in-95 duration-500">
              <ProductCard product={product} />
            </div>
          ))
        )}
      </div>
    </section>
  );
};

// Internal Skeleton for Shopify-style loading
const RelatedSkeleton = () => (
  <>
    {[...Array(4)].map((_, index) => (
      <div key={index} className="space-y-4">
        <div className="bg-gray-50 aspect-[3/4] rounded-2xl animate-pulse overflow-hidden" />
        <div className="space-y-2 px-1">
          <div className="h-3 bg-gray-50 rounded w-1/3 animate-pulse" />
          <div className="h-4 bg-gray-50 rounded w-full animate-pulse" />
          <div className="h-4 bg-gray-50 rounded w-1/4 animate-pulse" />
        </div>
      </div>
    ))}
  </>
);

export default RelatedProducts;
