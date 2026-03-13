import React from "react";
import CategoriesCard from "../cards/CategoriesCard";

const CategoriesSection = ({ categories, loading }) => {
  if (loading) {
    return (
      <section className="w-full px-4  py-10">
        <div className="flex justify-center mb-8">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="aspect-[4/5] bg-gray-100 rounded-sm animate-pulse"></div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-10 md:py-16 bg-white border-b border-gray-100 font-sans">
      <div className="max-w-[1400px] mx-auto">
        {/* --- Section Header (Matches image_6a0984.jpg) --- */}
        <div className="text-center mb-10">
          <h2
            style={{
              fontFamily: "Playfair Display, serif",
            }}
            className="text-center text-3xl md:text-4xl tracking-wide mb-12 text-gray-900">
            {/* <h2 className="text-[18px] md:text-[22px]  text-[#111827] uppercase tracking-wider"> */}
            Categories
          </h2>
        </div>

        {/* --- Categories Grid --- */}
        {/* Mobile: 2 Columns (Image 76c789.jpg style)
            Desktop: 3 to 4 Columns (Image 6a0984.jpg style)
        */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-x-4 gap-y-10">
          {categories.map((cat) => (
            <div key={cat.id} className="group cursor-pointer">
              <CategoriesCard cat={cat} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
