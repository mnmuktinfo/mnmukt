import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

// Mock data to replicate the exact layout from your image.
// Swap this out with your actual product fetch logic later.
const mockProducts = [
  {
    id: 1,
    name: "Cotton Linen: Soft Pink",
    category: "Cotton Linen Shirts",
    price: 1599,
    badge: "| LINEN BLEND",
    image:
      "https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?auto=format&fit=crop&w=600&q=80", // Placeholder
  },
  {
    id: 2,
    name: "Cotton Linen: Striped Sienna",
    category: "Cotton Linen Shirts",
    price: 1799,
    badge: "| LINEN BLEND",
    image:
      "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 3,
    name: "Disney: No Worries",
    category: "Oversized T-Shirts",
    price: 1099,
    badge: "| OVERSIZED FIT",
    image:
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 4,
    name: "Cotton Linen: Coral Peach",
    category: "Cotton Linen Shirts",
    price: 1499,
    badge: "| LINEN BLEND",
    image:
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=600&q=80",
  },
];

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-800 pb-20">
      <Helmet>
        <title>Page Not Found — Mnmukt</title>
        <meta
          name="description"
          content="The page you are looking for cannot be found."
        />
      </Helmet>

      {/* ── TOP SECTION: 404 Message ── */}
      <div className="flex flex-col items-center justify-center pt-20 pb-16 px-4 text-center">
        <img
          src="https://prod-img.thesouledstore.com/static/notfound.png?w=376&dpr=2"
          alt="Product Unavailable"
          className="w-[280px] md:w-[320px] object-contain mb-8 animate-in fade-in zoom-in duration-500"
        />

        <h1 className="text-[15px] md:text-[17px] text-gray-600 font-medium mb-8 max-w-md mx-auto leading-relaxed">
          Looks like this product is unavailable. Explore more awesome products
          on our website!
        </h1>

        <Link
          to="/"
          className="bg-[#007673] hover:bg-[#005f5c] text-white px-10 py-3.5 rounded-sm text-[13px] font-bold uppercase tracking-widest transition-colors shadow-sm">
          Explore Now
        </Link>
      </div>

      {/* ── BOTTOM SECTION: Recommended Products ── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 border-t border-gray-100">
        <h2 className="text-[20px] text-gray-700 mb-6 font-medium">
          You may also like:-
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {mockProducts.map((product) => (
            <div
              key={product.id}
              className="group cursor-pointer flex flex-col">
              {/* Product Image Wrapper */}
              <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden rounded-sm">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Top Left Badge */}
                <div className="absolute top-3 left-3 text-[9px] font-bold text-gray-800 uppercase tracking-widest bg-white/60 backdrop-blur-sm px-1.5 py-0.5 rounded-sm">
                  {product.badge}
                </div>

                {/* Top Right Wishlist Heart (matches the image style) */}
                <button className="absolute top-3 right-3 w-7 h-7 bg-gray-400/40 hover:bg-gray-400/60 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors">
                  <Heart size={14} className="text-white" strokeWidth={2.5} />
                </button>
              </div>

              {/* Product Details */}
              <div className="pt-3 flex flex-col">
                <h3 className="text-[13px] font-bold text-gray-900 truncate group-hover:text-[#007673] transition-colors">
                  {product.name}
                </h3>
                <p className="text-[12px] text-gray-500 mt-0.5">
                  {product.category}
                </p>
                <p className="text-[14px] font-bold text-gray-900 mt-1.5">
                  ₹ {product.price}
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
