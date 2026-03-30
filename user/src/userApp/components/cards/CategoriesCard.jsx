import React from "react";
import { useNavigate } from "react-router-dom";

const CategoriesCard = ({ cat }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/category/${cat.slug || cat.id}`)}
      className="group w-full flex flex-col items-center cursor-pointer">
      {/* ── Image Container (Rounded corners, no borders) ── */}
      <div className="relative w-full aspect-4/5 overflow-hidden bg-gray-100 shadow-sm transition-shadow duration-300 group-hover:shadow-md">
        <img
          src={cat.image || cat.img}
          alt={cat.name || cat.label}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        {/* Very subtle dark tint on hover to indicate clickability */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      </div>

      {/* ── Clean Text Label Below Image ── */}
      <h3 className="mt-4 text-[13px] md:text-[14px] font-medium text-gray-900 text-center transition-colors duration-300 group-hover:text-[#da127d]">
        {cat.name || cat.label}
      </h3>
    </div>
  );
};

export default CategoriesCard;
