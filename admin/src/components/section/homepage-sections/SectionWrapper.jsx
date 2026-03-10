import { ToggleLeft, ToggleRight } from "lucide-react";

export const SectionWrapper = ({ title, enabled, onToggle, children }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      <button
        onClick={() => onToggle(!enabled)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
          enabled
            ? "bg-green-50 border-green-200 text-green-800"
            : "bg-gray-50 border-gray-200 text-gray-600"
        }`}>
        {enabled ? (
          <ToggleRight className="w-5 h-5" />
        ) : (
          <ToggleLeft className="w-5 h-5" />
        )}
        {enabled ? "Enabled" : "Disabled"}
      </button>
    </div>
    {enabled && children}
  </div>
);
