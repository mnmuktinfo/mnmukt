import { Eye, EyeOff } from "lucide-react";
import React from "react";

const ProductStatusCard = ({ product, setProduct }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-sm shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] p-6">
      <h3 className="text-base font-medium text-[#212121] mb-1">Status</h3>
      <p className="text-[13px] text-[#878787] mb-5">
        Control product visibility on your storefront.
      </p>

      <button
        type="button"
        onClick={() => setProduct((p) => ({ ...p, isActive: !p.isActive }))}
        className={`w-full flex items-center justify-between px-5 py-3.5 rounded-sm border font-medium text-[15px] transition-all
                  ${
                    product.isActive
                      ? "bg-[#e8f5e9] text-[#2e7d32] border-[#c8e6c9]"
                      : "bg-[#f1f3f6] text-[#878787] border-[#d7d7d7] hover:bg-[#e0e0e0]"
                  }`}>
        <div className="flex items-center gap-3">
          {product.isActive ? <Eye size={20} /> : <EyeOff size={20} />}
          <span>
            {product.isActive ? "Active (Visible)" : "Inactive (Hidden)"}
          </span>
        </div>
        <div
          className={`w-10 h-5 rounded-full relative transition-colors ${product.isActive ? "bg-[#2e7d32]" : "bg-[#d7d7d7]"}`}>
          <div
            className={`absolute top-0.5 bottom-0.5 w-4 rounded-full bg-white transition-all ${product.isActive ? "right-0.5" : "left-0.5"}`}></div>
        </div>
      </button>
    </div>
  );
};

export default ProductStatusCard;
