import React from "react";

const Button = ({ onClick, label, type = "primary", icon }) => {
  // Define different button styles
  const buttonStyles = {
    primary:
      "bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition w-full flex items-center justify-center gap-2",
    secondary:
      "bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition w-full flex items-center justify-center gap-2",
    success:
      "bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition w-full flex items-center justify-center gap-2",
  };

  return (
    <button onClick={onClick} className={buttonStyles[type]}>
      {icon && <span>{icon}</span>}
      {label}
    </button>
  );
};

export default Button;
