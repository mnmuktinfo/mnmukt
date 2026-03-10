import React from "react";
import ItemCard from "./ItemCard";

const ProductsGrid = ({
  products,
  onProductClick,
  onAddToCart,
  onAddToWishlist,
}) => {
  if (!products || products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No products found
        </h3>
        <p className="text-gray-600 mb-4">
          Try adjusting your filters to see more results.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ItemCard
          key={product._id}
          product={product}
          onClick={() => onProductClick(product)}
          onAddToCart={onAddToCart}
          onAddToWishlist={onAddToWishlist}
        />
      ))}
    </div>
  );
};

export default ProductsGrid;
