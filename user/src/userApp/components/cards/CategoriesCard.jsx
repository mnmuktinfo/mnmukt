import React from "react";
import { useNavigate } from "react-router-dom";

const CategoriesCard = ({ cat }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/category/${cat.slug}`)}
      className="group w-full flex flex-col cursor-pointer transition-all duration-300">
      {/* --- Image Shell (Sharp Corners / No Border) --- */}
      <div className="relative aspect-4/5 w-full overflow-hidden bg-[#f3f3f3]">
        <img
          src={cat.image}
          alt={cat.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Subtle Overlay on Hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      </div>

      {/* --- Label Area (Matches image_6a0984.jpg) --- */}
      <div className="pt-3 pb-2 text-left">
        <h3 className="text-[14px] md:text-[16px]  text-[#1a1a1a] uppercase tracking-[0.15em] transition-colors group-hover:text-[#007673]">
          {cat.name}
        </h3>

        {/* Optional "Shop Now" line that appears on hover */}
        <div className="mt-1 h-[2px] w-0 bg-[#007673] transition-all duration-300 group-hover:w-12" />
      </div>
    </div>
  );
};

export default CategoriesCard;
