import React from "react";
import ProductCard from "../cards/ProductCard";

const RelatedProducts = ({ products }) => {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-20 border-t border-gray-50">
      <div className="flex justify-between items-end mb-12 gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">
            Curated For You
          </span>
          <h2 className="text-3xl font-serif text-gray-900 italic">
            You may also like
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
};

export default RelatedProducts;
