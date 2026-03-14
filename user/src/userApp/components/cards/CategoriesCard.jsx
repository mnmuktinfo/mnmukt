import React from "react";
import { useNavigate } from "react-router-dom";

const CategoriesCard = ({ cat }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/category/${cat.slug || cat.id}`)}
      className="group w-full flex flex-col items-center cursor-pointer">
      <div className="relative aspect-4/5 w-full overflow-hidden bg-[#F9F5F6]   shadow-sm group-hover:shadow-xl transition-shadow duration-500">
        <img
          src={cat.image || cat.img}
          alt={cat.name || cat.label}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />

        {/* Subtle, soft overlay to make it look expensive on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-[#da127d]/5 transition-colors duration-500" />
      </div>

      {/* --- Label Area (Centered, Spacious & Elegant) --- */}
      <div className="pt-5 pb-2 flex flex-col items-center text-center">
        <h3 className="text-[13px] md:text-[15px] font-medium text-gray-900 uppercase tracking-[0.2em] transition-colors duration-300 group-hover:text-[#da127d]">
          {cat.name || cat.label}
        </h3>

        {/* Elegant expanding underline that grows from the center */}
        <div className="mt-2 h-[1px] w-0 bg-[#da127d] transition-all duration-500 ease-in-out group-hover:w-12" />
      </div>
    </div>
  );
};

export default CategoriesCard;
