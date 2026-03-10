import React from "react";
import { COLORS } from "../../../style/theme";
import { Copy, MessageCircle } from "lucide-react";

const ShareSection = () => {
  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <div className="text-center mb-10 text-sm" style={{ color: COLORS.text }}>
      <span className="font-medium">Share on :</span>

      <div className="flex justify-center gap-4 mt-3">
        {/* Facebook */}
        <button
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm text-sm hover:shadow-md transition"
          style={{ color: COLORS.textAlt }}>
          Facebook
        </button>

        {/* WhatsApp */}
        <button
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm text-sm hover:shadow-md transition"
          style={{ color: COLORS.textAlt }}>
          <MessageCircle size={18} />
          WhatsApp
        </button>

        {/* Copy Link */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm text-sm hover:shadow-md transition"
          style={{ color: COLORS.textAlt }}>
          <Copy size={18} />
          Copy Link
        </button>
      </div>
    </div>
  );
};

export default ShareSection;
