const SizeSelector = ({ sizes, selectedSize, onSizeChange }) => {
  console.log(sizes);
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Select Size
      </label>

      <div className="flex flex-wrap gap-3">
        {sizes.map((size, index) => (
          <button
            key={index}
            onClick={() => onSizeChange(size)}
            className={`
              w-12 h-12 
              flex items-center justify-center 
              rounded-full 
              text-sm font-medium 
              border transition-all
              ${
                selectedSize === size
                  ? "border-black bg-black text-white"
                  : "border-gray-400 bg-white hover:border-black"
              }
            `}>
            {size}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SizeSelector;
