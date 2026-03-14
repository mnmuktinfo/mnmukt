import React from "react";
import { useNavigate } from "react-router-dom";

const EthnicWearHero = () => {
  const navigate = useNavigate();

  return (
    <section className="w-full bg-[#FAFAFA] py-12 md:py-20 font-sans overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* LEFT: Typography & Call to Action */}
          <div className="flex-1 text-center lg:text-left z-10">
            {/* Soft accent text matching the pink from your previous navbar */}
            <span className="text-[#da127d] uppercase tracking-[0.2em] text-xs sm:text-sm font-semibold mb-4 block">
              Spring / Summer Collection
            </span>

            <h1
              className="text-4xl md:text-5xl lg:text-6xl text-gray-900 leading-tight mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              Elegance in Every <br className="hidden lg:block" />
              <span className="italic text-[#da127d]">Stitch & Fold.</span>
            </h1>

            <p className="text-gray-600 text-base md:text-lg max-w-lg mx-auto lg:mx-0 mb-10 leading-relaxed">
              Discover our latest range of intricately crafted Salwar Suits and
              Kurta sets. Designed for the modern woman who roots her style in
              tradition and comfort.
            </p>

            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <button
                onClick={() => navigate("/collections/salwar-suits")}
                className="bg-[#da127d] hover:bg-[#b80f6a] text-white px-8 py-3.5 rounded-sm text-sm uppercase tracking-wider transition-colors duration-300 shadow-md">
                Shop New Arrivals
              </button>
              <button
                onClick={() => navigate("/collections/bestsellers")}
                className="border border-[#da127d] text-[#da127d] hover:bg-[#da127d] hover:text-white px-8 py-3.5 rounded-sm text-sm uppercase tracking-wider transition-colors duration-300">
                View Bestsellers
              </button>
            </div>
          </div>

          {/* RIGHT: Elegant Arched Image Display */}
          <div
            className="flex-1 w-full max-w-md lg:max-w-none mx-auto relative group cursor-pointer"
            onClick={() => navigate("/collections/salwar-suits")}>
            {/* Decorative background shape to give depth */}
            <div className="absolute inset-0 bg-[#F3E8E6] rounded-t-[150px] rounded-b-xl transform translate-x-4 translate-y-4 md:translate-x-6 md:translate-y-6 transition-transform duration-500 group-hover:translate-x-2 group-hover:translate-y-2 -z-10"></div>

            {/* Main Image with Boutique Arch styling */}
            <div className="overflow-hidden rounded-t-[150px] rounded-b-xl shadow-lg">
              <img
                src="https://images.biba.in/dw/image/v2/BKQK_PRD/on/demandware.static/-/Sites-biba-product-catalog/default/dw972146e7/images/ss26/skdblokbls32050ss26crm_1.jpg?sw=502&sh=753&q=100&strip=false"
                alt="Beautiful Cream Salwar Suit Set"
                className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            {/* Subtle floating badge */}
            <div className="absolute -left-4 bottom-12 bg-white px-6 py-3 shadow-xl rounded-sm flex flex-col gap-1 hidden md:flex">
              <span className="text-xs text-gray-500 uppercase tracking-widest">
                Featured
              </span>
              <span className="text-sm font-semibold text-gray-900 font-serif">
                Ivory Block Print Suit
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EthnicWearHero;
