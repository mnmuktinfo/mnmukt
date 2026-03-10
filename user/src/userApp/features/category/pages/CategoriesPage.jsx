import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllCategories } from "../services/categoriesService";
import { ChevronRight, LayoutGrid } from "lucide-react";

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

  // --- SKELETON LOADER (Amazon Style) ---
  if (loading) {
    return (
      <div className="max-w-7xl  mt-20 md:mt-35  mx-auto px-4 py-6 bg-white min-h-screen">
        <div className="h-7 w-48 bg-gray-200 animate-pulse rounded mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-square bg-gray-100 animate-pulse rounded-2xl" />
              <div className="h-4 w-3/4 bg-gray-100 animate-pulse rounded mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mt-20 md:mt-35 mx-auto px-4 py-6 bg-[#F7F8F8] min-h-screen">
      {/* Modern E-commerce Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/category/${cat.id}`}
            className="group flex flex-col bg-white border border-gray-100 rounded-2xl p-2 shadow-sm hover:shadow-md active:scale-95 transition-all duration-200">
            {/* Image Container with Amazon-style soft background */}
            <div className="aspect-square w-full rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center p-2">
              <img
                src={cat.image || "https://via.placeholder.com/300"}
                alt={cat.name}
                className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
              />
            </div>

            {/* Label Section */}
            <div className="py-3 px-1 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-800 group-hover:text-[#B4292F] transition-colors">
                  {cat.name}
                </span>
                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">
                  Explore Now
                </span>
              </div>

              <div className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-red-50 transition-colors">
                <ChevronRight
                  size={16}
                  className="text-gray-400 group-hover:text-[#B4292F]"
                />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Amazon-style Footer Promotion */}
      <div className="mt-10 p-6 bg-white border border-dashed border-gray-200 rounded-2xl text-center">
        <p className="text-sm text-gray-500 font-medium italic">
          "Purity in every drop - Taruveda Organics"
        </p>
      </div>
    </div>
  );
};

export default CategoriesPage;
