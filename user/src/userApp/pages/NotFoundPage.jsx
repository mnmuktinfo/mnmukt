import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

// Mock data updated with your editorial categories
const mockProducts = [
  {
    id: 1,
    name: "Pure Silk: Blush Rose",
    category: "Festive Collection",
    price: 4599,
    badge: "NEW ARRIVAL",
    image:
      "https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 2,
    name: "Cotton Linen: Sienna",
    category: "Summer Collection",
    price: 1799,
    badge: "LINEN BLEND",
    image:
      "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 3,
    name: "Organza: Ivory Dreams",
    category: "Luxury Suits",
    price: 5299,
    badge: "HAND CRAFTED",
    image:
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 4,
    name: "Chanderi: Coral Peach",
    category: "Salwar Suits",
    price: 3499,
    badge: "BESTSELLER",
    image:
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=600&q=80",
  },
];

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 pb-20 selection:bg-[#da127d] selection:text-white">
      <Helmet>
        <title>Page Not Found — Mnmukt</title>
        <meta
          name="description"
          content="The page you are looking for cannot be found."
        />
      </Helmet>

      {/* ── TOP SECTION: Editorial 404 Message ── */}
      <div className="flex flex-col items-center justify-center pt-24 pb-20 px-4 text-center">
        <h1
          className="text-2xl md:text-3xl text-gray-900 mb-6 tracking-wide"
          style={{ fontFamily: "'Playfair Display', serif" }}>
          Lost in Style
        </h1>

        <p className="text-[14px] md:text-[15px] text-gray-700 font-medium mb-10 max-w-md mx-auto leading-relaxed tracking-wide">
          It seems the piece you’re looking for has moved. Explore our latest
          curated collections instead.
        </p>

        <Link
          to="/"
          className="bg-[#da127d] hover:bg-[#b80f6a] text-white px-12 py-4 text-[12px] font-bold uppercase tracking-[0.3em] transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95">
          Explore Now
        </Link>
      </div>

      {/* ── BOTTOM SECTION: Recommended Grid ── */}
      <div className="max-w-[1500px] mx-auto px-5 sm:px-8 lg:px-12 pt-16 border-t border-gray-100">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-[#da127d] uppercase tracking-[0.2em] text-[11px] font-bold mb-2 block">
              Curated Picks
            </span>
            <h2
              className="text-2xl md:text-3xl text-gray-900 tracking-wide"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              You May Also Like
            </h2>
          </div>
          <Link
            to="/collections/all"
            className="text-[11px] font-bold uppercase tracking-widest text-gray-500 hover:text-[#da127d] transition-colors border-b border-gray-200 pb-1">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 lg:gap-12">
          {mockProducts.map((product) => (
            <div
              key={product.id}
              className="group cursor-pointer flex flex-col items-center text-center">
              {/* Sharp Image Shell */}
              <div className="relative w-full aspect-[3/4] bg-gray-50 overflow-hidden border border-gray-100/50">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                />

                {/* Sharp Label Badge */}
                <div className="absolute top-3 left-3 text-[9px] font-bold text-white bg-gray-900 uppercase tracking-widest px-2.5 py-1.5">
                  {product.badge}
                </div>

                {/* Wishlist Icon */}
                <button className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-md flex items-center justify-center hover:bg-[#da127d] hover:text-white transition-all duration-300 group/heart">
                  <Heart
                    size={16}
                    className="text-gray-900 group-hover/heart:text-white"
                    strokeWidth={1.5}
                  />
                </button>
              </div>

              {/* Product Info */}
              <div className="pt-5 flex flex-col items-center">
                <h3 className="text-[13px] font-semibold text-gray-900 uppercase tracking-widest group-hover:text-[#da127d] transition-colors">
                  {product.name}
                </h3>
                <p className="text-[12px] text-gray-500 italic font-serif mt-1">
                  {product.category}
                </p>
                <p className="text-[14px] font-medium text-gray-900 mt-2.5">
                  ₹ {product.price}.00
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
