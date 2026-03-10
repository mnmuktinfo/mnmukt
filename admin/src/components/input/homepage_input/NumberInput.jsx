export const NumberInput = ({ label, value, onChange, min, max }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      min={min}
      max={max}
      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#B4292F] focus:ring-2 focus:ring-[#B4292F]/20 transition-all duration-200"
    />
  </div>
);
