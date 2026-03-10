import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const NavigationBar = ({ product }) => {
  const navigate = useNavigate();

  return (
    <nav className="flex items-center gap-4 text-[10px] tracking-[0.2em] uppercase font-bold text-gray-400">
      {/* Back Icon - Clean & Functional */}
      <button
        onClick={() => navigate(-1)}
        className="p-2 -ml-2 hover:text-black transition-colors"
        aria-label="Go back">
        <ArrowLeft size={16} strokeWidth={2.5} />
      </button>

      {/* Simplified Breadcrumb Path */}
      <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
        <button
          onClick={() => navigate("/")}
          className="hover:text-black transition-colors">
          Home
        </button>

        <span className="text-gray-200">/</span>

        <button
          onClick={() => navigate(`/collections/${product?.collectionType}`)}
          className="hover:text-black transition-colors truncate max-w-[80px] sm:max-w-none">
          {product?.collectionType?.replace("-", " ") || "Shop"}
        </button>

        <span className="text-gray-200">/</span>

        <span className="text-black truncate max-w-[100px] sm:max-w-none">
          {product?.name}
        </span>
      </div>
    </nav>
  );
};

export default NavigationBar;
