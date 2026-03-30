import React from "react";

const EmptyCart = () => {
  return (
    <div className="text-center py-20 flex flex-col items-center">
      {/* Image */}
      <img
        src="https://v3.material-tailwind.com/cart-illustration.png"
        alt="Empty Cart"
        className="w-72 mb-6"
      />

      <h1 className="text-2xl font-semibold mb-3">Your cart is empty</h1>

      <p className="text-gray-500">Add items to your cart to continue</p>
    </div>
  );
};

export default EmptyCart;
