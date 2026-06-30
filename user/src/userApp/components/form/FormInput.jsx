import React from "react";

const FormInput = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled,
  error,
  maxLength,
}) => {
  return (
    <div>
      <label className="text-xs text-gray-600 font-semibold uppercase tracking-wider">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        className={`w-full mt-1.5 px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 transition-all
        ${error ? "border-red-400 bg-red-50" : "border-gray-300 focus:border-black"}`}
      />

      {error && (
        <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
          <span>❌</span> {error}
        </p>
      )}
    </div>
  );
};

export default FormInput;
