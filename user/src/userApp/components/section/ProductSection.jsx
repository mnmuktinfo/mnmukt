import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ViewAllButton from "../button/ViewAllButton";
import ProductCard from "../cards/ProductCard";
import MoveToCartPopUp from "../../features/wishList/components/pop-up/MoveToCartPopUp";
import Notification from "../../../shared/components/Notification";

const ProductSection = ({ title, subtitle, products = [] }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  const showNotification = (msg, type = "info") => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 2000);
  };

  return (
    <section className="w-full px-4 md:px-12 py-6">
      {/* Notification */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
          duration={2000}
        />
      )}

      {/* Title */}
      <div className="text-center mb-8">
        <h2
          style={{
            fontFamily: "Playfair Display, serif",
          }}
          className="text-center text-3xl md:text-4xl tracking-wide  text-gray-900">
          {title}
        </h2>
        {subtitle && (
          <p className="text-gray-600 mt-2 text-sm md:text-base tracking-wide">
            {subtitle}
          </p>
        )}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6">
        {products.slice(0, 8).map((product) => (
          <ProductCard
            key={product.id || product.sku || product.name} // ensure unique keys
            product={product}
            onMoveToCart={() => setSelectedProduct(product)}
          />
        ))}
      </div>

      {/* View All Button */}
      <div className="flex justify-center mt-15">
        <ViewAllButton
          label="View All Products"
          onClick={() => navigate("/products")}
          fullWidth={false}
          bgColor="#ff356c"
          hoverBgColor="#e62e5f"
        />
      </div>

      {/* Move To Cart Popup */}
      {selectedProduct && (
        <MoveToCartPopUp
          open={true}
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onCompleted={() => {
            showNotification("Added to cart!", "success");
            setSelectedProduct(null);
          }}
        />
      )}
    </section>
  );
};

export default ProductSection;
