import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const CategoriesCard = ({ cat }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/category/${cat.slug}`)}
      className="group relative cursor-pointer w-full h-full overflow-hidden rounded-[20px] bg-gray-100 shadow-sm hover:shadow-xl transition-all duration-500">
      {/* --- Image Container (Aspect Ratio 4:5 for vertical shopping feel) --- */}
      <div className="relative aspect-4/5 w-full overflow-hidden">
        {/* Image with Zoom Effect */}
        <img
          src={cat.image}
          alt={cat.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />

        {/* Dark Gradient Overlay (Bottom only, for text contrast if needed) */}
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* --- Floating Info Card (The "Shopping" Element) --- */}
      <div className="absolute bottom-4 left-4 right-4 transform translate-y-0 md:translate-y-2 md:group-hover:translate-y-0 transition-all duration-500 ease-out">
        <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 flex items-center justify-between group-hover:bg-white transition-colors">
          <div className="flex flex-col gap-0.5">
            {/* Sub-label */}
            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-green-700 transition-colors">
              Collection
            </span>
            {/* Category Name */}
            <h3 className="font-serif text-lg leading-none text-gray-900 font-medium">
              {cat.name}
            </h3>
          </div>

          {/* Action Button */}
          <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-900 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-500 shadow-sm">
            <ArrowUpRight className="w-5 h-5 transition-transform duration-500 group-hover:rotate-45" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesCard;
