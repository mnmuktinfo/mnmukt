import { FaBolt, FaShoppingCart, FaSpinner } from "react-icons/fa";

const ActionButtons = ({ loading, onAddToCart, onBuyNow }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <button
        onClick={onAddToCart}
        disabled={loading}
        className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg font-semibold text-base transition-colors duration-200 shadow-md
          ${
            loading
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-orange-500 text-white hover:bg-orange-600"
          }`}>
        {loading ? (
          <FaSpinner className="animate-spin mr-2" />
        ) : (
          <FaShoppingCart className="mr-2" />
        )}
        Add to Cart
      </button>
      <button
        onClick={onBuyNow}
        className="flex-1 flex items-center justify-center py-3 px-4 rounded-lg font-semibold text-base transition-colors duration-200 shadow-md
          bg-blue-600 text-white hover:bg-blue-700">
        <FaBolt className="mr-2" />
        Buy Now
      </button>
    </div>
  );
};

export default ActionButtons;
