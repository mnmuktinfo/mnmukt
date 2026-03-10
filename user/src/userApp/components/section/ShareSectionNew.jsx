import { Share2 } from "lucide-react";

export const ShareSection = () => (
  <div className="flex items-center gap-4 pt-4">
    <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
      <Share2 className="w-5 h-5" />
      Share
    </button>
  </div>
);
