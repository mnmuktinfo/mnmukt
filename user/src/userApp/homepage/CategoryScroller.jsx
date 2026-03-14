import React from "react";
import CategoriesCard from "../components/cards/CategoriesCard";

const CategoryScroller = ({ categories, loading }) => {
  // --- PREMIUM LOADING SKELETON ---
  if (loading) {
    return (
      <section className="w-full px-4 sm:px-6 lg:px-10 py-16 bg-[#FAFAFA]">
        <div className="max-w-[1500px] mx-auto">
          <div className="flex flex-col items-center justify-center mb-12">
            {/* Sub-heading skeleton */}
            <div className="h-3 w-32 bg-gray-200  mb-4 animate-pulse"></div>
            {/* Main heading skeleton */}
            <div className="h-8 w-64 bg-gray-200  animate-pulse"></div>
          </div>
          {/* Grid skeleton matching the refined layout */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col gap-4">
                <div className="aspect-[4/5] bg-gray-100 rounded-t-[100px] rounded-b-xl animate-pulse"></div>
                <div className="h-4 w-3/4 mx-auto bg-gray-100 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-16 md:py-24 bg-white border-b border-gray-100 font-sans">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* --- Section Header --- */}
        <div className="text-center mb-12 md:mb-16">
          <span className="text-[#da127d] uppercase tracking-[0.2em] text-xs font-semibold mb-3 block">
            Discover Your Style
          </span>
          <h2
            style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-3xl md:text-4xl lg:text-5xl tracking-wide text-gray-900">
            Shop By Category{" "}
          </h2>
          {/* Optional elegant underline divider */}
          <div className="w-16 h-[1px] bg-[#da127d] mx-auto mt-6 opacity-50"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-8 md:gap-y-14">
          {categories?.map((cat) => (
            <div
              key={cat.id}
              className="group cursor-pointer transform transition-transform duration-500 hover:-translate-y-2">
              <CategoriesCard cat={cat} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryScroller;
