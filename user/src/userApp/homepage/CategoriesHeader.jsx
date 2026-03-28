import React from "react";
import { useNavigate } from "react-router-dom";

const CategoriesHeader = () => {
  const navigate = useNavigate();

  const categories = [
    {
      label: "Under ₹1000",
      link: "/products?price=1000",
      img: "https://babli.in/cdn/shop/files/Image_20260109_183445_115.jpg?v=1767964035",
    },
    {
      label: "Under ₹1500",
      link: "/products?price=1500",
      img: "https://babli.in/cdn/shop/files/Image_20260109_183445_119.jpg?v=1767964035",
    },
    {
      label: "Under ₹2000",
      link: "/products?price=2000",
      img: "https://babli.in/cdn/shop/files/Image_20260109_183445_102.jpg?v=1767964035",
    },
    {
      label: "Under ₹2500",
      link: "/products?price=2500",
      img: "https://babli.in/cdn/shop/files/Image_20260109_183445_126.jpg?v=1767964035",
    },
  ];

  return (
    <div className="flex justify-center gap-6 my-6">
      {categories.map((cat, index) => (
        <button
          key={index}
          onClick={() => navigate(cat.link)}
          className="relative w-24 h-24 rounded-full overflow-hidden flex items-center justify-center cursor-pointer transition-transform hover:scale-105">
          {/* Background image */}
          <img
            src={cat.img}
            alt={cat.label}
            className="absolute inset-0 w-full h-full object-cover "
          />
        </button>
      ))}
    </div>
  );
};

export default CategoriesHeader;
