import React from "react";
import { Heart } from "lucide-react";
import { COLORS } from "../../../../style/theme";
import ImageSlider from "../slider/ImageSlider";

const LovedItemCard = ({ product }) => {
  return (
    <div className="group flex flex-col mb-10 cursor-pointer">
      <div className="relative">
        {/* Heart / Wishlist */}
        <button className="absolute top-3 right-3 bg-white p-1 rounded-full shadow-md hover:scale-110 transition">
          <Heart size={18} color="#d33" />
        </button>

        {/* Product Image Slider */}
        <ImageSlider images={product.images} />
      </div>

      {/* Product Name */}
      <h3
        className="mt-3 text-base font-medium text-center"
        style={{ color: COLORS.textAlt }}>
        {product.name}
      </h3>

      {/* Product Price */}
      <p
        className="text-sm font-semibold text-center"
        style={{ color: COLORS.text }}>
        ₹ {product.price}
      </p>
    </div>
  );
};

export default LovedItemCard;
