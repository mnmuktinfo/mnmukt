import React, { useState } from "react";
import {
  ChevronDown,
  Ruler,
  Truck,
  ShieldCheck,
  HeartPulse,
} from "lucide-react";

const ProductAccordion = ({ product }) => {
  const [openSection, setOpenSection] = useState("description");

  const sections = [
    {
      id: "description",
      title: "Product Story",
      icon: <HeartPulse size={18} strokeWidth={1.5} />,
      content:
        product.description ||
        "Crafted with precision and designed for timeless elegance.",
    },
    {
      id: "details",
      title: "Material & Fit",
      icon: <Ruler size={18} strokeWidth={1.5} />,
      list: [
        { label: "Material", value: "Premium Sustainable Fabric" },
        { label: "Care", value: "Dry clean only" },
        { label: "Fit", value: "Regular fit" },
        { label: "Pattern", value: "Intricate Embroidery" },
      ],
    },
    {
      id: "shipping",
      title: "Shipping & Returns",
      icon: <Truck size={18} strokeWidth={1.5} />,
      list: [
        { label: "Standard", value: "3-5 business days (Free over ₹999)" },
        { label: "Express", value: "1-2 business days available" },
        { label: "Returns", value: "Easy 7-day hassle-free returns" },
      ],
    },
    {
      id: "care",
      title: "Care Guide",
      icon: <ShieldCheck size={18} strokeWidth={1.5} />,
      list: [
        { label: "Washing", value: "Dry clean only to maintain texture" },
        { label: "Ironing", value: "Reverse iron on low heat" },
        { label: "Storage", value: "Store in a breathable garment bag" },
      ],
    },
  ];

  return (
    <div className="w-full space-y-2">
      {sections.map((section) => (
        <div
          key={section.id}
          className={`overflow-hidden transition-all duration-300 border-b border-gray-100 ${
            openSection === section.id ? "bg-[#F9F9F9]/50" : "bg-transparent"
          }`}>
          <button
            onClick={() =>
              setOpenSection(openSection === section.id ? null : section.id)
            }
            className="w-full py-5 text-left flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <span
                className={`transition-colors duration-300 ${
                  openSection === section.id ? "text-black" : "text-gray-400"
                }`}>
                {section.icon}
              </span>
              <span
                className={`text-sm uppercase tracking-[0.15em] font-semibold transition-colors duration-300 ${
                  openSection === section.id ? "text-black" : "text-gray-500"
                }`}>
                {section.title}
              </span>
            </div>
            <div
              className={`transition-transform duration-500 rounded-full p-1 ${
                openSection === section.id
                  ? "rotate-180 bg-black text-white"
                  : "text-gray-300"
              }`}>
              <ChevronDown size={16} />
            </div>
          </button>

          <div
            className={`transition-all duration-500 ease-in-out ${
              openSection === section.id
                ? "max-h-[500px] opacity-100 pb-8"
                : "max-h-0 opacity-0"
            }`}>
            <div className="pl-[52px] pr-6">
              {section.content && (
                <p className="text-[15px] leading-relaxed text-gray-600 font-light">
                  {section.content}
                </p>
              )}

              {section.list && (
                <ul className="space-y-3">
                  {section.list.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex flex-col sm:flex-row sm:gap-4 text-[14px]">
                      <span className="font-bold text-gray-900 w-24 shrink-0 uppercase text-[10px] tracking-wider pt-1">
                        {item.label}
                      </span>
                      <span className="text-gray-500 font-light">
                        {item.value}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductAccordion;
