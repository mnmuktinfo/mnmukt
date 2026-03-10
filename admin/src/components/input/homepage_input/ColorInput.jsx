export const ColorInput = ({ label, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <div className="flex gap-3">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-12 h-12 border border-gray-300 rounded cursor-pointer"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#B4292F"
        className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#B4292F] focus:ring-1 focus:ring-[#B4292F]/20"
      />
    </div>
  </div>
);
