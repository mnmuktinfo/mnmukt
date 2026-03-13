import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllCategories } from "../services/categoriesService";
import { ChevronRight } from "lucide-react";

/* ─────────────────────────────────────────
   SKELETON
───────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="flex flex-col">
    <div className="aspect-[3/4] bg-gray-100 animate-pulse rounded-sm" />
    <div className="pt-3 space-y-2">
      <div className="h-3.5 w-3/4 bg-gray-100 animate-pulse rounded" />
      <div className="h-3 w-1/2 bg-gray-100 animate-pulse rounded" />
    </div>
  </div>
);

/* ─────────────────────────────────────────
   CATEGORY CARD
───────────────────────────────────────── */
const CategoryCard = ({ cat }) => (
  <Link
    to={`/category/${cat.id}`}
    className="group flex flex-col cursor-pointer">
    {/* Image */}
    <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden rounded-sm">
      <img
        src={cat.image || "https://via.placeholder.com/400x533"}
        alt={cat.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />

      {/* Top-left label badge */}
      {cat.badge && (
        <div className="absolute top-3 left-3 text-[9px] font-bold text-gray-800 uppercase tracking-widest bg-white/70 backdrop-blur-sm px-2 py-0.5 rounded-sm">
          {cat.badge}
        </div>
      )}

      {/* Hover: subtle dark overlay with arrow */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      <div className="absolute bottom-3 right-3 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
        <ChevronRight size={14} className="text-gray-700" strokeWidth={2} />
      </div>
    </div>

    {/* Details */}
    <div className="pt-3">
      <h3 className="text-[13px] font-bold text-gray-900 truncate group-hover:text-gray-600 transition-colors">
        {cat.name}
      </h3>
      {cat.productCount != null && (
        <p className="text-[11px] text-gray-400 mt-0.5">
          {cat.productCount} products
        </p>
      )}
    </div>
  </Link>
);

/* ─────────────────────────────────────────
   CATEGORIES PAGE
───────────────────────────────────────── */
const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCats = async () => {
      const data = await getAllCategories();
      setCategories(data);
      setLoading(false);
    };
    fetchCats();
  }, []);

  return (
    <div className="min-h-screen bg-white mt-20 md:mt-35">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Page heading */}
        <div className="mb-8 md:mb-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gray-400 mb-1">
            Taruveda Organics
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            All Categories
          </h1>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-3 md:gap-6">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : categories.map((cat) => <CategoryCard key={cat.id} cat={cat} />)}
        </div>

        {/* Empty state */}
        {!loading && categories.length === 0 && (
          <div className="text-center py-24 text-gray-400 text-[13px]">
            No categories found.
          </div>
        )}

        {/* Bottom tagline */}
        {!loading && categories.length > 0 && (
          <p className="text-center text-[11px] text-gray-300 italic mt-14">
            "Purity in every drop — Taruveda Organics"
          </p>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
