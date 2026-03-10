import React from "react";
import CategoriesCard from "../cards/CategoriesCard";
import { Leaf } from "lucide-react"; // Optional decorative icon

const CategoriesSection = ({ categories, loading }) => {
  // console.log(categories);
  if (loading) {
    return (
      <section className="w-full px-4 md:px-12 py-12">
        <div className="flex justify-center mb-10">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] bg-gray-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-16 md:py-24 bg-[#FDFBF7]">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        {/* --- Section Header --- */}
        <div className="text-center mb-16 relative">
          <span className="text-[10px] md:text-xs font-bold tracking-[0.3em] text-green-800 uppercase block mb-3 opacity-80">
            Curated Collections
          </span>
          <h2
            style={{ fontFamily: "Playfair Display, serif" }}
            className="text-3xl md:text-5xl text-[#1a2e1f] tracking-tight relative z-10 inline-block">
            Shop By Categories
          </h2>

          {/* Decorative Underline */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-[-20px] w-24 h-[1px] bg-green-800/30 flex items-center justify-center">
            <Leaf className="w-4 h-4 text-green-800 bg-[#FDFBF7] px-0.5" />
          </div>
        </div>

        {/* --- Categories Grid/Scroll --- */}
        {/* Mobile: Horizontal Scroll (snap-x for smooth feeling) 
           Desktop: Clean Grid 
        */}
        <div
          className="
            flex gap-4 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide 
            md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 md:gap-8 md:overflow-visible
        ">
          {categories.map((cat, index) => (
            <div
              key={cat.id}
              className="snap-center shrink-0 w-[200px] md:w-auto transition-transform duration-500 hover:-translate-y-2"
              style={{ transitionDelay: `${index * 50}ms` }} // Staggered animation effect
            >
              <CategoriesCard cat={cat} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
