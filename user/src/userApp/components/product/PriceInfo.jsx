export const PriceInfo = ({ product, discount, formatPrice }) => (
  <div className="space-y-1">
    <div className="flex items-center gap-3 flex-wrap">
      <span>MRP</span>
      <span className="text-xl text-gray-500 line-through">
        {/* ₹{formatPrice(product.originalPrice)} */}
      </span>

      {/* {discount > 0 && (
        <>
          <span className="text-md font-bold text-gray-900">
            ₹{formatPrice(product.price)}
          </span>
          <span className="bg-red-500 text-white px-2 py-1 text-sm font-semibold rounded">
            {discount}% OFF!
          </span>
        </>
      )} */}
    </div>
    <div className="flex items-center gap-2">
      <p className="text-sm text-gray-500">Inclusive of all taxes</p>
      <span
        className={`px-2 py-1 text-sm font-medium rounded ${
          product.isActive
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}>
        {product.isActive ? "In Stock" : "Out of Stock"}
      </span>
    </div>
  </div>
);
